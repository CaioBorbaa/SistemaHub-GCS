import { query } from './db.js';

/**
 * Registra uma ação feita no painel do RH. Nunca derruba a ação principal:
 * se a tabela ainda não existir (falta rodar "npm run migrar"), só avisa no console.
 */
export async function registrarRh(req, acao, descricao) {
  const autor = req.session?.usuario;
  try {
    await query('INSERT INTO historico_rh (usuario_id, autor, acao, descricao) VALUES (?, ?, ?, ?)', [
      autor?.id ?? null,
      autor?.nome ?? 'desconhecido',
      acao,
      String(descricao).slice(0, 500),
    ]);
  } catch (erro) {
    console.warn('Não foi possível registrar no histórico do RH:', erro.message);
  }
}

/** Middleware: registra no histórico as alterações (não-GET) bem-sucedidas de um router reaproveitado. */
export function registrarAoAlterar(descrever) {
  return (req, res, next) => {
    if (req.method !== 'GET') {
      res.on('finish', () => {
        if (res.statusCode < 400) {
          const [acao, descricao] = descrever(req);
          registrarRh(req, acao, descricao);
        }
      });
    }
    next();
  };
}
