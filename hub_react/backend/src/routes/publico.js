import { Router } from 'express';
import { query, queryOne } from '../db.js';
import { exigeLogin } from '../auth.js';
import { climaPorIp, tamanhoCache } from '../clima.js';
import { lerConfig, temaAtivo } from '../temas.js';
import { idParam, ipDoCliente } from '../util.js';
import { enviarImagemOtimizada, urlVersionada, versoesDe } from '../imagens.js';

const router = Router();

export const urlBanner = (nomeArquivo) => `/uploads/banners/${encodeURIComponent(nomeArquivo)}`;

async function bannersAtivos() {
  try {
    return await query('SELECT id, imagem_nome, link_url, popup_nome FROM banners WHERE ativo = 1 ORDER BY ordem, id');
  } catch (erro) {
    if (erro.code !== 'ER_BAD_FIELD_ERROR') throw erro;
    // migração ainda não aplicada (sem a coluna popup_nome): a home continua funcionando
    return query('SELECT id, imagem_nome, link_url FROM banners WHERE ativo = 1 ORDER BY ordem, id');
  }
}

async function avisoAtivo() {
  try {
    return await queryOne(
      `SELECT id, titulo, link_url FROM avisos WHERE ativo = 1 ORDER BY criado_em DESC, id DESC LIMIT 1`,
    );
  } catch {
    return null; // tabela ainda não migrada
  }
}

/**
 * Tudo que a home precisa em uma chamada: seções (categorias com seus links,
 * na ordem configurada), banners ativos e o aviso em destaque.
 */
router.get('/hub', exigeLogin, async (req, res) => {
  const [linhas, banners, aviso, versoes] = await Promise.all([
    query(`
      SELECT c.id AS categoria_id, c.nome AS categoria, l.id, l.nome, l.url
      FROM links AS l
      JOIN link_categorias AS lc ON l.id = lc.link_id
      JOIN categorias AS c ON lc.categoria_id = c.id
      WHERE l.ativo = 1
      ORDER BY c.ordem, c.nome, l.ordem, l.id
    `),
    bannersAtivos(),
    avisoAtivo(),
    versoesDe('links'),
  ]);

  const secoes = new Map();
  for (const linha of linhas) {
    if (!secoes.has(linha.categoria_id)) {
      secoes.set(linha.categoria_id, { id: linha.categoria_id, nome: linha.categoria, links: [] });
    }
    const secao = secoes.get(linha.categoria_id);
    if (!secao.links.some((l) => l.id === linha.id)) {
      // ícone leve e com versão na URL (o navegador guarda em cache até a imagem mudar)
      secao.links.push({ id: linha.id, nome: linha.nome, url: linha.url, imagem: urlVersionada('links', linha.id, versoes) });
    }
  }

  res.json({
    secoes: [...secoes.values()],
    banners: banners.map((b) => ({
      id: b.id,
      imagem: urlBanner(b.imagem_nome),
      link: b.link_url && b.link_url !== '#' ? b.link_url : null,
      popup: b.popup_nome ? urlBanner(b.popup_nome) : null, // imagem aberta no centro da tela ao clicar
    })),
    aviso: aviso && { ...aviso, imagem: urlVersionada('avisos', aviso.id, await versoesDe('avisos')) },
  });
});

router.get('/links/:id/imagem', exigeLogin, (req, res) => enviarImagemOtimizada(req, res, 'links', idParam(req)));

router.post('/links/:id/clique', exigeLogin, async (req, res) => {
  try {
    await query('INSERT INTO link_cliques (link_id, usuario_id, ip) VALUES (?, ?, ?)', [
      idParam(req),
      req.session.usuario.id,
      ipDoCliente(req),
    ]);
  } catch (erro) {
    console.warn('Não foi possível registrar o clique:', erro.message);
  }
  res.status(204).end();
});

router.get('/avisos/:id/imagem', exigeLogin, (req, res) => enviarImagemOtimizada(req, res, 'avisos', idParam(req)));

// Tema comemorativo do dia (público: também decora a tela de login)
router.get('/tema', async (req, res) => {
  const tema = temaAtivo(await lerConfig());
  res.json({ tema: tema && { id: tema.id, mensagem: tema.mensagem, efeitos: tema.efeitos } });
});

// Produtos ativos do saco de presentes (tema de Natal); o sorteio é feito no navegador
router.get('/presentes', exigeLogin, async (req, res) => {
  try {
    const [presentes, versoes] = await Promise.all([query('SELECT id, nome FROM presentes WHERE ativo = 1'), versoesDe('presentes')]);
    res.json(presentes.map((p) => ({ ...p, imagem: urlVersionada('presentes', p.id, versoes) })));
  } catch {
    res.json([]); // tabela ainda não migrada: o saco simplesmente fica vazio
  }
});

router.get('/presentes/:id/imagem', exigeLogin, (req, res) => enviarImagemOtimizada(req, res, 'presentes', idParam(req)));

router.get('/clima', async (req, res) => {
  res.json(await climaPorIp(ipDoCliente(req)));
});

router.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: Date.now() / 1000, cache_size: tamanhoCache() });
});

export default router;
