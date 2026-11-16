import crypto from 'node:crypto';
import sharp from 'sharp';
import { query, queryOne } from './db.js';
import { detectarImagem } from './util.js';

/**
 * Imagens guardadas no banco (BLOB) servidas de forma leve:
 * - redimensionadas para o tamanho em que aparecem (WebP), com o original intacto no banco;
 * - com uma "versão" (hash do conteúdo) na URL, para o navegador guardar em cache
 *   por tempo indeterminado e só baixar de novo quando a imagem mudar.
 *
 * Os ícones originais chegavam a 1,5 MB cada para aparecerem com 170 px na tela.
 */
export const TIPOS = {
  links: { tabela: 'links', coluna: 'imagem', ladoMax: 320, rota: (id) => `/api/links/${id}/imagem` },
  presentes: { tabela: 'presentes', coluna: 'imagem', ladoMax: 280, rota: (id) => `/api/presentes/${id}/imagem` },
  avisos: { tabela: 'avisos', coluna: 'imagem', ladoMax: 1400, rota: (id) => `/api/avisos/${id}/imagem` },
};

const VERSOES_TTL_MS = 10 * 60 * 1000; // segurança caso o banco seja alterado por fora do painel
const MAX_MINIATURAS = 400;

const versoes = new Map(); // tipo -> { quando, mapa: Map(id -> versão) }
const miniaturas = new Map(); // `${tipo}:${id}` -> { versao, buffer, mime }

const hash = (buffer) => crypto.createHash('md5').update(buffer).digest('hex').slice(0, 12);

/** Versão (hash do conteúdo) de todas as imagens de um tipo; calculada no banco e guardada em memória. */
export async function versoesDe(tipo) {
  const atual = versoes.get(tipo);
  if (atual && Date.now() - atual.quando < VERSOES_TTL_MS) return atual.mapa;
  const { tabela, coluna } = TIPOS[tipo];
  const linhas = await query(`SELECT id, LEFT(MD5(${coluna}), 12) AS v FROM ${tabela} WHERE ${coluna} IS NOT NULL`);
  const mapa = new Map(linhas.map((l) => [l.id, l.v]));
  versoes.set(tipo, { quando: Date.now(), mapa });
  return mapa;
}

/** URL com versão, ex.: /api/links/3/imagem?v=a1b2c3d4e5f6 (ou null se não há imagem). */
export function urlVersionada(tipo, id, mapa) {
  const v = mapa.get(id);
  return v ? `${TIPOS[tipo].rota(id)}?v=${v}` : null;
}

/** Esquece versões e miniaturas de um tipo (próximo acesso recalcula a partir do banco). */
export function invalidarImagens(tipo) {
  versoes.delete(tipo);
  for (const chave of miniaturas.keys()) if (chave.startsWith(`${tipo}:`)) miniaturas.delete(chave);
}

/** Middleware dos roteadores do painel: qualquer alteração bem-sucedida invalida o cache daquele tipo. */
export const invalidarAoAlterar = (tipo) => (req, res, next) => {
  if (req.method !== 'GET') res.on('finish', () => res.statusCode < 400 && invalidarImagens(tipo));
  next();
};

async function reduzir(buffer, ladoMax) {
  const tipo = detectarImagem(buffer);
  if (tipo?.mime === 'image/gif') return { buffer, mime: tipo.mime }; // preserva GIF animado
  try {
    const saida = await sharp(buffer)
      .rotate()
      .resize(ladoMax, ladoMax, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();
    // se por algum motivo ficar maior que o original, usa o original
    return saida.length < buffer.length ? { buffer: saida, mime: 'image/webp' } : { buffer, mime: tipo?.mime };
  } catch (erro) {
    console.warn('Não foi possível otimizar a imagem:', erro.message);
    return { buffer, mime: tipo?.mime };
  }
}

/**
 * Responde com a imagem otimizada. Com `?v=` igual à versão atual, o navegador
 * pode guardar para sempre (immutable); sem versão, revalida a cada uso.
 */
export async function enviarImagemOtimizada(req, res, tipo, id) {
  const chave = `${tipo}:${id}`;
  let item = miniaturas.get(chave);
  if (!item) {
    const { tabela, coluna, ladoMax } = TIPOS[tipo];
    const linha = await queryOne(`SELECT ${coluna} AS imagem FROM ${tabela} WHERE id = ?`, [id]);
    if (!linha?.imagem) return res.status(404).json({ erro: 'Imagem não encontrada' });
    item = { versao: hash(linha.imagem), ...(await reduzir(linha.imagem, ladoMax)) };
    if (miniaturas.size >= MAX_MINIATURAS) miniaturas.delete(miniaturas.keys().next().value);
    miniaturas.set(chave, item);
  }

  const pediuVersaoAtual = req.query.v === item.versao;
  res.set('Cache-Control', pediuVersaoAtual ? 'private, max-age=31536000, immutable' : 'private, no-cache');
  res.set('ETag', `"${item.versao}"`);
  if (!pediuVersaoAtual && req.headers['if-none-match'] === `"${item.versao}"`) return res.status(304).end();
  res.type(item.mime || 'application/octet-stream');
  res.send(item.buffer);
}
