import { Router } from 'express';
import { query } from '../../db.js';

const router = Router();
const LIMITE = 300;

// Últimas ações feitas no painel do RH (as tabelas são lidas tanto pelo RH quanto pela T.I.)
router.get('/', async (req, res) => {
  const itens = await query(
    `SELECT id, autor, acao, descricao, DATE_FORMAT(data_hora, '%Y-%m-%dT%H:%i:%s') AS data_hora
     FROM historico_rh
     ORDER BY data_hora DESC, id DESC
     LIMIT ${LIMITE}`,
  );
  res.json(itens);
});

export default router;
