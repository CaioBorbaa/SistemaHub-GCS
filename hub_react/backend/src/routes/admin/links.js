import { Router } from 'express';
import { proximaOrdem, query, queryOne, salvarOrdem, transacao } from '../../db.js';
import { invalidarAoAlterar, urlVersionada, versoesDe } from '../../imagens.js';
import {
  HttpError, flag, idParam, imagemEnviada, listaDeIds, textoObrigatorio, uploadImagem, urlObrigatoria,
} from '../../util.js';

const router = Router();
router.use(invalidarAoAlterar('links'));

function dadosDoFormulario(req) {
  const categorias = listaDeIds(req.body.categorias);
  if (categorias.length === 0) throw new HttpError(400, 'Selecione ao menos uma categoria.');
  return {
    nome: textoObrigatorio(req.body.nome, 'o nome do sistema', 100),
    url: urlObrigatoria(req.body.url, 'o link do sistema'),
    ativo: flag(req.body.ativo ?? '1'),
    categorias,
  };
}

async function gravarCategorias(conn, linkId, categorias) {
  await conn.query('DELETE FROM link_categorias WHERE link_id = ?', [linkId]);
  for (const categoriaId of categorias) {
    await conn.query('INSERT INTO link_categorias (link_id, categoria_id) VALUES (?, ?)', [linkId, categoriaId]);
  }
}

async function existe(id) {
  if (!(await queryOne('SELECT id FROM links WHERE id = ?', [id]))) {
    throw new HttpError(404, 'Sistema não encontrado.');
  }
}

router.get('/', async (req, res) => {
  const [links, vinculos, versoes] = await Promise.all([
    query(`
      SELECT l.id, l.nome, l.url, l.ativo, l.ordem,
             (l.imagem IS NOT NULL) AS tem_imagem,
             (SELECT COUNT(*) FROM link_cliques k WHERE k.link_id = l.id) AS cliques
      FROM links l
      ORDER BY l.ordem, l.id
    `),
    query('SELECT link_id, categoria_id FROM link_categorias'),
    versoesDe('links'),
  ]);

  const porLink = new Map();
  for (const v of vinculos) {
    if (!porLink.has(v.link_id)) porLink.set(v.link_id, []);
    porLink.get(v.link_id).push(v.categoria_id);
  }

  res.json(links.map((l) => ({
    ...l,
    ativo: Boolean(l.ativo),
    tem_imagem: Boolean(l.tem_imagem),
    imagem: urlVersionada('links', l.id, versoes),
    cliques: Number(l.cliques),
    categorias: porLink.get(l.id) ?? [],
  })));
});

router.post('/', uploadImagem, async (req, res) => {
  const dados = dadosDoFormulario(req);
  const imagem = imagemEnviada(req, { obrigatoria: true });
  const ordem = await proximaOrdem('links');

  const id = await transacao(async (conn) => {
    const [r] = await conn.query(
      'INSERT INTO links (nome, url, imagem, ativo, ordem) VALUES (?, ?, ?, ?, ?)',
      [dados.nome, dados.url, imagem.buffer, dados.ativo, ordem],
    );
    await gravarCategorias(conn, r.insertId, dados.categorias);
    return r.insertId;
  });
  res.status(201).json({ id });
});

router.put('/ordem', async (req, res) => {
  await salvarOrdem('links', listaDeIds(req.body?.ids));
  res.status(204).end();
});

router.put('/:id', uploadImagem, async (req, res) => {
  const id = idParam(req);
  await existe(id);
  const dados = dadosDoFormulario(req);
  const imagem = imagemEnviada(req);

  await transacao(async (conn) => {
    await conn.query('UPDATE links SET nome = ?, url = ?, ativo = ? WHERE id = ?', [dados.nome, dados.url, dados.ativo, id]);
    if (imagem) await conn.query('UPDATE links SET imagem = ? WHERE id = ?', [imagem.buffer, id]);
    await gravarCategorias(conn, id, dados.categorias);
  });
  res.status(204).end();
});

router.patch('/:id/ativo', async (req, res) => {
  const id = idParam(req);
  await existe(id);
  await query('UPDATE links SET ativo = ? WHERE id = ?', [flag(req.body?.ativo), id]);
  res.status(204).end();
});

router.delete('/:id', async (req, res) => {
  const id = idParam(req);
  await existe(id);
  await transacao(async (conn) => {
    await conn.query('DELETE FROM link_categorias WHERE link_id = ?', [id]);
    await conn.query('DELETE FROM link_cliques WHERE link_id = ?', [id]);
    await conn.query('DELETE FROM links WHERE id = ?', [id]);
  });
  res.status(204).end();
});

export default router;
