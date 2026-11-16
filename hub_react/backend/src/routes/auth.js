import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query, queryOne } from '../db.js';
import { ehNivelAdmin, ehNivelRh } from '../config.js';
import { dadosDaSessao, usuarioPublico } from '../auth.js';
import { HttpError, ipDoCliente, somenteDigitos } from '../util.js';

const router = Router();

// Limite simples de tentativas do login administrativo, por IP (em memória).
const tentativas = new Map();
const JANELA_MS = 15 * 60 * 1000;
const MAX_TENTATIVAS = 10;

function verificarLimite(ip) {
  const agora = Date.now();
  const registro = tentativas.get(ip);
  if (!registro || agora - registro.inicio > JANELA_MS) {
    tentativas.set(ip, { inicio: agora, total: 1 });
    return;
  }
  registro.total += 1;
  if (registro.total > MAX_TENTATIVAS) {
    throw new HttpError(429, 'Muitas tentativas. Aguarde alguns minutos e tente novamente.');
  }
}

async function registrarLogin(usuarioId, ip) {
  try {
    await query('INSERT INTO login_log (usuario_id, ip) VALUES (?, ?)', [usuarioId, ip]);
  } catch (erro) {
    // O login não pode falhar por causa da estatística (ex.: migração ainda não aplicada).
    console.warn('Não foi possível registrar o login:', erro.message);
  }
}

router.get('/me', (req, res) => {
  res.json({ usuario: usuarioPublico(req) });
});

// Login dos colaboradores: somente CPF (mesmo comportamento do sistema original).
router.post('/login', async (req, res) => {
  const cpf = somenteDigitos(req.body?.cpf);
  if (cpf.length !== 11) throw new HttpError(400, 'Informe um CPF com 11 dígitos.');

  const usuario = await queryOne(
    'SELECT id, nome_completo, nivel_acesso FROM usuarios WHERE cpf = ? AND ativo = 1',
    [cpf],
  );
  if (!usuario) throw new HttpError(401, 'CPF não encontrado ou inativo. Por favor, contate o RH.');

  req.session.usuario = dadosDaSessao(usuario);
  req.session.admin = false;
  req.session.rh = false;
  await registrarLogin(usuario.id, ipDoCliente(req));
  res.json({ usuario: usuarioPublico(req) });
});

/** Login com CPF + senha para um painel; `podeEntrar(nivel)` diz quem é aceito. */
async function loginDePainel(req, podeEntrar) {
  const ip = ipDoCliente(req);
  verificarLimite(ip);

  const cpf = somenteDigitos(req.body?.cpf);
  const senha = String(req.body?.senha ?? '');
  const invalido = new HttpError(401, 'CPF ou senha inválidos.');
  if (cpf.length !== 11 || !senha) throw invalido;

  const usuario = await queryOne(
    'SELECT id, nome_completo, nivel_acesso, senha_hash FROM usuarios WHERE cpf = ? AND ativo = 1',
    [cpf],
  );
  if (!usuario?.senha_hash || !podeEntrar(usuario.nivel_acesso)) throw invalido;
  if (!(await bcrypt.compare(senha, usuario.senha_hash))) throw invalido;

  tentativas.delete(ip);
  req.session.usuario = dadosDaSessao(usuario);
  await registrarLogin(usuario.id, ip);
  return usuario;
}

// Login do painel da T.I.: CPF + senha, apenas para níveis administrativos.
router.post('/admin/login', async (req, res) => {
  await loginDePainel(req, ehNivelAdmin);
  req.session.admin = true;
  req.session.rh = false;
  res.json({ usuario: usuarioPublico(req) });
});

// Login do painel do RH: CPF + senha, níveis do RH (e a T.I., para suporte).
router.post('/rh/login', async (req, res) => {
  const usuario = await loginDePainel(req, (nivel) => ehNivelRh(nivel) || ehNivelAdmin(nivel));
  req.session.rh = true;
  // quem é da T.I. continua com o acesso dela; o RH nunca ganha o painel da T.I.
  req.session.admin = ehNivelAdmin(usuario.nivel_acesso) && Boolean(req.session.admin);
  res.json({ usuario: usuarioPublico(req) });
});

router.post('/logout', (req, res) => {
  req.session = null;
  res.status(204).end();
});

export default router;
