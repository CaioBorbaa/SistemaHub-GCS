import { Router } from 'express';
import { query, queryOne } from '../../db.js';
import { invalidarAoAlterar, urlVersionada, versoesDe } from '../../imagens.js';
import {
  HttpError, flag, idParam, imagemEnviada, textoObrigatorio, uploadImagem, urlOpcional,
} from '../../util.js';

const router = Router();
router.use(invalidarAoAlterar('avisos'));

async function existe(id) {
  if (!(await queryOne('SELECT id FROM avisos WHERE id = ?', [id]))) throw new HttpError(404, 'Aviso não encontrado.');
}

router.get('/', async (req, res) => {
  const [avisos, versoes] = await Promise.all([
    query('SELECT id, titulo, link_url, ativo, criado_em FROM avisos ORDER BY criado_em DESC, id DESC'),
    versoesDe('avisos'),
  ]);
  res.json(avisos.map((a) => ({
    ...a,
    link_url: a.link_url ?? '',
    ativo: Boolean(a.ativo),
    imagem: urlVersionada('avisos', a.id, versoes),
  })));
});

router.post('/', uploadImagem, async (req, res) => {
  const imagem = imagemEnviada(req, { obrigatoria: true });
  const r = await query(
    'INSERT INTO avisos (titulo, link_url, imagem, imagem_tipo, ativo) VALUES (?, ?, ?, ?, ?)',
    [
      textoObrigatorio(req.body.titulo, 'o título', 150),
      urlOpcional(req.body.link_url) || null,
      imagem.buffer,
      imagem.mime,
      flag(req.body.ativo ?? '1'),
    ],
  );
  res.status(201).json({ id: r.insertId });
});

router.put('/:id', uploadImagem, async (req, res) => {
  const id = idParam(req);
  await existe(id);
  const imagem = imagemEnviada(req);
  await query('UPDATE avisos SET titulo = ?, link_url = ?, ativo = ? WHERE id = ?', [
    textoObrigatorio(req.body.titulo, 'o título', 150),
    urlOpcional(req.body.link_url) || null,
    flag(req.body.ativo),
    id,
  ]);
  if (imagem) await query('UPDATE avisos SET imagem = ?, imagem_tipo = ? WHERE id = ?', [imagem.buffer, imagem.mime, id]);
  res.status(204).end();
});

router.patch('/:id/ativo', async (req, res) => {
  const id = idParam(req);
  await existe(id);
  await query('UPDATE avisos SET ativo = ? WHERE id = ?', [flag(req.body?.ativo), id]);
  res.status(204).end();
});

router.delete('/:id', async (req, res) => {
  const id = idParam(req);
  await existe(id);
  await query('DELETE FROM avisos WHERE id = ?', [id]);
  res.status(204).end();
});

export default router;
