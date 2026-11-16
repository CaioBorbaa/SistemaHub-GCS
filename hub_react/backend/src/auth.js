import { queryOne } from './db.js';
import { ehNivelAdmin, ehNivelRh } from './config.js';
import { iniciais } from './util.js';

/** Dados do usuário guardados no cookie de sessão. */
export function dadosDaSessao(usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome_completo,
    nivel: usuario.nivel_acesso,
    iniciais: iniciais(usuario.nome_completo),
  };
}

/** Formato devolvido ao front-end em /auth/me e nos logins. */
export function usuarioPublico(req) {
  const u = req.session?.usuario;
  if (!u) return null;
  return {
    ...u,
    admin: Boolean(req.session.admin),
    // a T.I. também entra no painel do RH (suporte), sem precisar de outro login
    rh: Boolean(req.session.rh || req.session.admin),
    podeAdministrar: ehNivelAdmin(u.nivel),
    podeRh: ehNivelRh(u.nivel) || ehNivelAdmin(u.nivel),
  };
}

export function exigeLogin(req, res, next) {
  if (!req.session?.usuario) return res.status(401).json({ erro: 'Sessão expirada. Faça login novamente.' });
  next();
}

/**
 * Exige sessão administrativa (CPF + senha) e confere no banco se o usuário
 * continua ativo e com nível de administrador, para que uma remoção de acesso
 * tenha efeito imediato mesmo com o cookie ainda válido.
 */
export async function exigeAdmin(req, res, next) {
  const u = req.session?.usuario;
  if (!u) return res.status(401).json({ erro: 'Sessão expirada. Faça login novamente.' });
  if (!req.session.admin) return res.status(403).json({ erro: 'Acesso restrito ao painel administrativo.' });

  const atual = await queryOne('SELECT nivel_acesso FROM usuarios WHERE id = ? AND ativo = 1', [u.id]);
  if (!atual || !ehNivelAdmin(atual.nivel_acesso)) {
    req.session = null;
    return res.status(401).json({ erro: 'Seu acesso administrativo foi removido.' });
  }
  next();
}

/** Painel do RH: sessão aberta em /rh/login (ou do painel da T.I.), conferida no banco a cada chamada. */
export async function exigeRh(req, res, next) {
  const u = req.session?.usuario;
  if (!u) return res.status(401).json({ erro: 'Sessão expirada. Faça login novamente.' });
  if (!req.session.rh && !req.session.admin) return res.status(403).json({ erro: 'Acesso restrito ao painel do RH.' });

  const atual = await queryOne('SELECT nivel_acesso FROM usuarios WHERE id = ? AND ativo = 1', [u.id]);
  if (!atual || !(ehNivelRh(atual.nivel_acesso) || ehNivelAdmin(atual.nivel_acesso))) {
    req.session = null;
    return res.status(401).json({ erro: 'Seu acesso ao painel do RH foi removido.' });
  }
  next();
}
