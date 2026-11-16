import multer from 'multer';
import { config } from './config.js';

/** Erro com status HTTP; o handler global devolve `{ erro: message }`. */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const somenteDigitos = (valor) => String(valor ?? '').replace(/\D/g, '');

export function cpfValido(cpf) {
  const d = somenteDigitos(cpf);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  for (const tamanho of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(d[i]) * (tamanho + 1 - i);
    const digito = ((soma * 10) % 11) % 10;
    if (digito !== Number(d[tamanho])) return false;
  }
  return true;
}

export function iniciais(nomeCompleto) {
  const nomes = String(nomeCompleto || '').trim().split(/\s+/).filter(Boolean);
  if (nomes.length === 0) return 'U';
  const ini = nomes.length > 1 ? nomes[0][0] + nomes.at(-1)[0] : nomes[0].slice(0, 2);
  return ini.toUpperCase();
}

/** IP real do cliente (Cloudflare > X-Forwarded-For via trust proxy > conexão). */
export function ipDoCliente(req) {
  const ip = req.headers['cf-connecting-ip'] || req.ip || '';
  return String(ip).replace(/^::ffff:/, '');
}

export function idParam(req, nome = 'id') {
  const id = Number(req.params[nome]);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'ID inválido.');
  return id;
}

export function textoObrigatorio(valor, campo, max = 255) {
  const texto = String(valor ?? '').trim();
  if (!texto) throw new HttpError(400, `Informe ${campo}.`);
  if (texto.length > max) throw new HttpError(400, `${campo} deve ter no máximo ${max} caracteres.`);
  return texto;
}

export function urlOpcional(valor, campo = 'o link') {
  const texto = String(valor ?? '').trim();
  if (!texto || texto === '#') return '';
  try {
    const url = new URL(texto);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
  } catch {
    throw new HttpError(400, `Informe ${campo} completo, começando com http:// ou https://`);
  }
  return texto;
}

export function urlObrigatoria(valor, campo = 'o link') {
  const url = urlOpcional(valor, campo);
  if (!url) throw new HttpError(400, `Informe ${campo}.`);
  return url;
}

/** Converte "1"/"true"/true/"on" em 1, qualquer outra coisa em 0. */
export const flag = (valor) => (['1', 'true', 'on', true, 1].includes(valor) ? 1 : 0);

export function listaDeIds(valor) {
  let lista = valor;
  if (typeof valor === 'string') {
    try {
      lista = JSON.parse(valor);
    } catch {
      lista = valor.split(',');
    }
  }
  if (!Array.isArray(lista)) return [];
  return [...new Set(lista.map(Number).filter((n) => Number.isInteger(n) && n > 0))];
}

// --- Imagens -------------------------------------------------------------

const ASSINATURAS = [
  { mime: 'image/png', ext: 'png', bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: 'image/jpeg', ext: 'jpg', bytes: [0xff, 0xd8, 0xff] },
  { mime: 'image/gif', ext: 'gif', bytes: [0x47, 0x49, 0x46, 0x38] },
  { mime: 'image/webp', ext: 'webp', bytes: [0x52, 0x49, 0x46, 0x46], extra: [8, [0x57, 0x45, 0x42, 0x50]] },
];

/** Identifica o tipo da imagem pelos primeiros bytes (não confia na extensão enviada). */
export function detectarImagem(buffer) {
  if (!buffer || buffer.length < 12) return null;
  const confere = (offset, bytes) => bytes.every((b, i) => buffer[offset + i] === b);
  return ASSINATURAS.find((a) => confere(0, a.bytes) && (!a.extra || confere(...a.extra))) ?? null;
}

export const uploadImagem = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.tamanhoMaxImagemMb * 1024 * 1024, files: 1 },
}).single('imagem');

/** Upload de várias imagens em campos diferentes, ex.: uploadImagens('imagem', 'popup'). */
export const uploadImagens = (...campos) =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: config.tamanhoMaxImagemMb * 1024 * 1024, files: campos.length },
  }).fields(campos.map((name) => ({ name, maxCount: 1 })));

function validarImagem(arquivo, { obrigatoria = false, mensagem = 'Selecione uma imagem.' } = {}) {
  if (!arquivo) {
    if (obrigatoria) throw new HttpError(400, mensagem);
    return null;
  }
  const tipo = detectarImagem(arquivo.buffer);
  if (!tipo) throw new HttpError(400, 'Formato de imagem não suportado. Use PNG, JPG, GIF ou WEBP.');
  return { buffer: arquivo.buffer, ...tipo };
}

/** Valida o arquivo enviado em `req.file`; devolve null se nenhum foi enviado. */
export function imagemEnviada(req, opcoes) {
  return validarImagem(req.file, opcoes);
}

/** Igual a imagemEnviada, para um campo de `uploadImagens`. */
export function imagemDoCampo(req, campo, opcoes) {
  return validarImagem(req.files?.[campo]?.[0], opcoes);
}
