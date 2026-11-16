import { Router } from 'express';
import { proximaOrdem, query, queryOne, salvarOrdem, transacao } from '../../db.js';
import { HttpError, idParam, listaDeIds, textoObrigatorio } from '../../util.js';

const router = Router();

// "geral" é especial: seus sistemas aparecem em todas as abas da home.
export const CATEGORIA_GERAL = 'geral';
const ehGeral = (nome) => String(nome).trim().toLowerCase() === CATEGORIA_GERAL;

async function buscar(id) {
  const categoria = await queryOne('SELECT id, nome FROM categorias WHERE id = ?', [id]);
  if (!categoria) throw new HttpError(404, 'Categoria não encontrada.');
  return categoria;
}

async function validarNome(nome, idAtual = 0) {
  const repetida = await queryOne('SELECT id FROM categorias WHERE LOWER(nome) = LOWER(?) AND id <> ?', [nome, idAtual]);
  if (repetida) throw new HttpError(409, 'Já existe uma categoria com esse nome.');
}

router.get('/', async (req, res) => {
  const categorias = await query(`
    SELECT c.id, c.nome, c.ordem, COUNT(lc.link_id) AS total_links
    FROM categorias c
    LEFT JOIN link_categorias lc ON lc.categoria_id = c.id
    GROUP BY c.id, c.nome, c.ordem
    ORDER BY c.ordem, c.nome
  `);
  res.json(categorias.map((c) => ({ ...c, total_links: Number(c.total_links), geral: ehGeral(c.nome) })));
});

router.post('/', async (req, res) => {
  const nome = textoObrigatorio(req.body?.nome, 'o nome da categoria', 60);
  await validarNome(nome);
  const ordem = await proximaOrdem('categorias');
  const r = await query('INSERT INTO categorias (nome, ordem) VALUES (?, ?)', [nome, ordem]);
  res.status(201).json({ id: r.insertId });
});

router.put('/ordem', async (req, res) => {
  await salvarOrdem('categorias', listaDeIds(req.body?.ids));
  res.status(204).end();
});

router.put('/:id', async (req, res) => {
  const categoria = await buscar(idParam(req));
  const nome = textoObrigatorio(req.body?.nome, 'o nome da categoria', 60);
  if (ehGeral(categoria.nome) && !ehGeral(nome)) {
    throw new HttpError(400, 'A categoria "geral" não pode ser renomeada.');
  }
  await validarNome(nome, categoria.id);
  await query('UPDATE categorias SET nome = ? WHERE id = ?', [nome, categoria.id]);
  res.status(204).end();
});

router.delete('/:id', async (req, res) => {
  const categoria = await buscar(idParam(req));
  if (ehGeral(categoria.nome)) throw new HttpError(400, 'A categoria "geral" não pode ser excluída.');
  await transacao(async (conn) => {
    await conn.query('DELETE FROM link_categorias WHERE categoria_id = ?', [categoria.id]);
    await conn.query('DELETE FROM categorias WHERE id = ?', [categoria.id]);
  });
  res.status(204).end();
});

export default router;
