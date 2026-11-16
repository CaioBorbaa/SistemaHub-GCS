import { Router } from 'express';
import { query, queryOne } from '../../db.js';

const router = Router();
const DIAS = 30;

/** Lista as datas (YYYY-MM-DD) dos últimos `dias` dias terminando em `hoje`. */
function ultimosDias(hoje, dias) {
  const fim = new Date(`${hoje}T00:00:00Z`);
  return Array.from({ length: dias }, (_, i) => {
    const d = new Date(fim);
    d.setUTCDate(fim.getUTCDate() - (dias - 1 - i));
    return d.toISOString().slice(0, 10);
  });
}

router.get('/', async (req, res) => {
  const [totais, maisAcessados, porDia, ultimosLogins] = await Promise.all([
    queryOne(`
      SELECT
        (SELECT COUNT(*) FROM links) AS links_total,
        (SELECT COUNT(*) FROM links WHERE ativo = 1) AS links_ativos,
        (SELECT COUNT(*) FROM categorias) AS categorias,
        (SELECT COUNT(*) FROM usuarios WHERE ativo = 1) AS usuarios_ativos,
        (SELECT COUNT(*) FROM banners WHERE ativo = 1) AS banners_ativos,
        (SELECT COUNT(*) FROM link_cliques WHERE data_hora >= CURDATE() - INTERVAL ${DIAS - 1} DAY) AS cliques_periodo,
        (SELECT COUNT(*) FROM login_log WHERE data_hora >= CURDATE()) AS logins_hoje,
        (SELECT COUNT(DISTINCT usuario_id) FROM login_log WHERE data_hora >= NOW() - INTERVAL 7 DAY) AS usuarios_7_dias,
        DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS hoje
    `),
    query(`
      SELECT l.id, l.nome, COUNT(*) AS cliques
      FROM link_cliques k
      JOIN links l ON l.id = k.link_id
      WHERE k.data_hora >= CURDATE() - INTERVAL ${DIAS - 1} DAY
      GROUP BY l.id, l.nome
      ORDER BY cliques DESC, l.nome
      LIMIT 8
    `),
    query(`
      SELECT DATE_FORMAT(data_hora, '%Y-%m-%d') AS dia, COUNT(*) AS cliques
      FROM link_cliques
      WHERE data_hora >= CURDATE() - INTERVAL ${DIAS - 1} DAY
      GROUP BY dia
    `),
    query(`
      SELECT g.id, u.nome_completo AS nome, g.ip, DATE_FORMAT(g.data_hora, '%Y-%m-%dT%H:%i:%s') AS data_hora
      FROM login_log g
      JOIN usuarios u ON u.id = g.usuario_id
      ORDER BY g.data_hora DESC, g.id DESC
      LIMIT 8
    `),
  ]);

  const cliquesPorDia = new Map(porDia.map((d) => [d.dia, Number(d.cliques)]));
  const { hoje, ...numeros } = totais;

  res.json({
    totais: Object.fromEntries(Object.entries(numeros).map(([k, v]) => [k, Number(v)])),
    dias: DIAS,
    cliquesPorDia: ultimosDias(hoje, DIAS).map((dia) => ({ dia, cliques: cliquesPorDia.get(dia) ?? 0 })),
    maisAcessados: maisAcessados.map((l) => ({ ...l, cliques: Number(l.cliques) })),
    ultimosLogins,
  });
});

export default router;
