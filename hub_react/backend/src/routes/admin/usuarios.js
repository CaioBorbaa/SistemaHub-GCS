import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { config, ehNivelAdmin, temPainel } from '../../config.js';
import { niveisDoEnum } from '../../niveis.js';
import { query, queryOne, transacao } from '../../db.js';
import { HttpError, cpfValido, flag, idParam, somenteDigitos, textoObrigatorio } from '../../util.js';

const router = Router();
const SENHA_MINIMA = 8;

async function buscar(id) {
  const usuario = await queryOne('SELECT id, nivel_acesso, senha_hash FROM usuarios WHERE id = ?', [id]);
  if (!usuario) throw new HttpError(404, 'Usuário não encontrado.');
  return usuario;
}

function dadosDoFormulario(body) {
  const cpf = somenteDigitos(body?.cpf);
  if (!cpfValido(cpf)) throw new HttpError(400, 'CPF inválido.');
  const senha = String(body?.senha ?? '');
  if (senha && senha.length < SENHA_MINIMA) {
    throw new HttpError(400, `A senha deve ter pelo menos ${SENHA_MINIMA} caracteres.`);
  }
  return {
    nome_completo: textoObrigatorio(body?.nome_completo, 'o nome completo', 150),
    cpf,
    nivel_acesso: textoObrigatorio(body?.nivel_acesso, 'o nível de acesso', 50).toLowerCase(),
    ativo: flag(body?.ativo ?? '1'),
    senha,
  };
}

async function validarNivel(nivel) {
  const permitidos = await niveisDoEnum();
  if (permitidos && !permitidos.includes(nivel)) {
    throw new HttpError(400, `Nível de acesso inválido. Use: ${permitidos.join(', ')}.`);
  }
}

async function validarCpfUnico(cpf, idAtual = 0) {
  if (await queryOne('SELECT id FROM usuarios WHERE cpf = ? AND id <> ?', [cpf, idAtual])) {
    throw new HttpError(409, 'Já existe um usuário com esse CPF.');
  }
}

function protegerProprioUsuario(req, id, { ativo, nivel_acesso }) {
  if (id !== req.session.usuario.id) return;
  if (!ativo) throw new HttpError(400, 'Você não pode desativar o seu próprio usuário.');
  if (!ehNivelAdmin(nivel_acesso)) throw new HttpError(400, 'Você não pode remover o seu próprio acesso administrativo.');
}

router.get('/', async (req, res) => {
  const [usuarios, niveis, niveisFixos] = await Promise.all([
    query(`
      SELECT id, nome_completo, cpf, nivel_acesso, ativo, (senha_hash IS NOT NULL) AS tem_senha
      FROM usuarios
      ORDER BY nome_completo
    `),
    query('SELECT DISTINCT LOWER(nivel_acesso) AS nivel FROM usuarios WHERE nivel_acesso IS NOT NULL ORDER BY nivel'),
    niveisDoEnum(),
  ]);
  res.json({
    usuarios: usuarios.map((u) => ({ ...u, ativo: Boolean(u.ativo), tem_senha: Boolean(u.tem_senha) })),
    niveis: niveisFixos ?? [...new Set([...niveis.map((n) => n.nivel), ...config.niveisAdmin, ...config.niveisRh])].filter(Boolean).sort(),
    niveisFixos: Boolean(niveisFixos),
    niveisAdmin: config.niveisAdmin,
    niveisRh: config.niveisRh,
    senhaMinima: SENHA_MINIMA,
  });
});

router.post('/', async (req, res) => {
  const dados = dadosDoFormulario(req.body);
  await validarNivel(dados.nivel_acesso);
  await validarCpfUnico(dados.cpf);
  if (temPainel(dados.nivel_acesso) && !dados.senha) {
    throw new HttpError(400, 'Defina uma senha para esse usuário acessar o painel.');
  }
  const hash = dados.senha ? await bcrypt.hash(dados.senha, 12) : null;
  const r = await query(
    'INSERT INTO usuarios (nome_completo, cpf, nivel_acesso, ativo, senha_hash) VALUES (?, ?, ?, ?, ?)',
    [dados.nome_completo, dados.cpf, dados.nivel_acesso, dados.ativo, hash],
  );
  res.status(201).json({ id: r.insertId });
});

router.put('/:id', async (req, res) => {
  const usuario = await buscar(idParam(req));
  const dados = dadosDoFormulario(req.body);
  protegerProprioUsuario(req, usuario.id, dados);
  await validarNivel(dados.nivel_acesso);
  await validarCpfUnico(dados.cpf, usuario.id);
  if (temPainel(dados.nivel_acesso) && !dados.senha && !usuario.senha_hash) {
    throw new HttpError(400, 'Defina uma senha para esse usuário acessar o painel.');
  }

  await query('UPDATE usuarios SET nome_completo = ?, cpf = ?, nivel_acesso = ?, ativo = ? WHERE id = ?', [
    dados.nome_completo, dados.cpf, dados.nivel_acesso, dados.ativo, usuario.id,
  ]);
  if (dados.senha) {
    await query('UPDATE usuarios SET senha_hash = ? WHERE id = ?', [await bcrypt.hash(dados.senha, 12), usuario.id]);
  }
  res.status(204).end();
});

router.patch('/:id/ativo', async (req, res) => {
  const usuario = await buscar(idParam(req));
  const ativo = flag(req.body?.ativo);
  protegerProprioUsuario(req, usuario.id, { ativo, nivel_acesso: usuario.nivel_acesso });
  await query('UPDATE usuarios SET ativo = ? WHERE id = ?', [ativo, usuario.id]);
  res.status(204).end();
});

router.delete('/:id', async (req, res) => {
  const usuario = await buscar(idParam(req));
  if (usuario.id === req.session.usuario.id) throw new HttpError(400, 'Você não pode excluir o seu próprio usuário.');
  await transacao(async (conn) => {
    await conn.query('UPDATE link_cliques SET usuario_id = NULL WHERE usuario_id = ?', [usuario.id]);
    await conn.query('DELETE FROM login_log WHERE usuario_id = ?', [usuario.id]);
    await conn.query('DELETE FROM usuarios WHERE id = ?', [usuario.id]);
  });
  res.status(204).end();
});

export default router;
