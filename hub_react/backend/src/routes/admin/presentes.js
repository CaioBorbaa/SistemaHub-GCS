import { Router } from 'express';
import { query, queryOne } from '../../db.js';
import { invalidarAoAlterar, urlVersionada, versoesDe } from '../../imagens.js';
import { HttpError, flag, idParam, imagemEnviada, textoObrigatorio, uploadImagem } from '../../util.js';

// Produtos do saco de presentes (tema de Natal).
const router = Router();
router.use(invalidarAoAlterar('presentes'));

async function existe(id) {
  if (!(await queryOne('SELECT id FROM presentes WHERE id = ?', [id]))) throw new HttpError(404, 'Presente não encontrado.');
}

router.get('/', async (req, res) => {
  const [presentes, versoes] = await Promise.all([query('SELECT id, nome, ativo FROM presentes ORDER BY nome'), versoesDe('presentes')]);
  res.json(presentes.map((p) => ({ ...p, ativo: Boolean(p.ativo), imagem: urlVersionada('presentes', p.id, versoes) })));
});

router.post('/', uploadImagem, async (req, res) => {
  const imagem = imagemEnviada(req, { obrigatoria: true });
  const r = await query('INSERT INTO presentes (nome, imagem, imagem_tipo, ativo) VALUES (?, ?, ?, ?)', [
    textoObrigatorio(req.body.nome, 'o nome do produto', 100),
    imagem.buffer,
    imagem.mime,
    flag(req.body.ativo ?? '1'),
  ]);
  res.status(201).json({ id: r.insertId });
});

router.put('/:id', uploadImagem, async (req, res) => {
  const id = idParam(req);
  await existe(id);
  const imagem = imagemEnviada(req);
  await query('UPDATE presentes SET nome = ?, ativo = ? WHERE id = ?', [
    textoObrigatorio(req.body.nome, 'o nome do produto', 100),
    flag(req.body.ativo),
    id,
  ]);
  if (imagem) await query('UPDATE presentes SET imagem = ?, imagem_tipo = ? WHERE id = ?', [imagem.buffer, imagem.mime, id]);
  res.status(204).end();
});

router.patch('/:id/ativo', async (req, res) => {
  const id = idParam(req);
  await existe(id);
  await query('UPDATE presentes SET ativo = ? WHERE id = ?', [flag(req.body?.ativo), id]);
  res.status(204).end();
});

router.delete('/:id', async (req, res) => {
  const id = idParam(req);
  await existe(id);
  await query('DELETE FROM presentes WHERE id = ?', [id]);
  res.status(204).end();
});

export default router;
