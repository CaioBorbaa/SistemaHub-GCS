import { Router } from 'express';
import { query, queryOne } from '../../db.js';
import { niveisDePainel } from '../../niveis.js';

const router = Router();
// Colaborador ativo sem entrar no hub há mais que isso aparece em "sem acesso há muito tempo"
const DIAS_SEM_ACESSO = 60;

router.get('/', async (req, res) => {
  const niveis = [niveisDePainel()];
  const ultimos = `SELECT usuario_id, MAX(data_hora) AS ultimo FROM login_log GROUP BY usuario_id`;
  const [totais, ultimosAcessos, semAcesso] = await Promise.all([
    queryOne(
      `SELECT
         SUM(u.ativo = 1) AS ativos,
         SUM(u.ativo = 0) AS inativos,
         SUM(u.ativo = 1 AND a.ultimo IS NULL) AS nunca_entraram,
         SUM(u.ativo = 1 AND a.ultimo >= CURDATE()) AS entraram_hoje,
         SUM(u.ativo = 1 AND a.ultimo >= NOW() - INTERVAL 7 DAY) AS entraram_7_dias,
         SUM(u.ativo = 1 AND a.ultimo < NOW() - INTERVAL ${DIAS_SEM_ACESSO} DAY) AS sem_acesso
       FROM usuarios u
       LEFT JOIN (${ultimos}) a ON a.usuario_id = u.id
       WHERE COALESCE(LOWER(u.nivel_acesso), '') NOT IN (?)`,
      niveis,
    ),
    query(
      `SELECT g.id, u.nome_completo AS nome, DATE_FORMAT(g.data_hora, '%Y-%m-%dT%H:%i:%s') AS data_hora
       FROM login_log g
       JOIN usuarios u ON u.id = g.usuario_id
       WHERE COALESCE(LOWER(u.nivel_acesso), '') NOT IN (?)
       ORDER BY g.data_hora DESC, g.id DESC
       LIMIT 8`,
      niveis,
    ),
    query(
      `SELECT u.id, u.nome_completo AS nome, DATE_FORMAT(a.ultimo, '%Y-%m-%dT%H:%i:%s') AS ultimo_acesso
       FROM usuarios u
       JOIN (${ultimos}) a ON a.usuario_id = u.id
       WHERE u.ativo = 1 AND COALESCE(LOWER(u.nivel_acesso), '') NOT IN (?) AND a.ultimo < NOW() - INTERVAL ${DIAS_SEM_ACESSO} DAY
       ORDER BY a.ultimo
       LIMIT 8`,
      niveis,
    ),
  ]);

  res.json({
    totais: Object.fromEntries(Object.entries(totais).map(([k, v]) => [k, Number(v ?? 0)])),
    diasSemAcesso: DIAS_SEM_ACESSO,
    ultimosAcessos,
    semAcesso,
  });
});

export default router;
