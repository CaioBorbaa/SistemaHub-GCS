import { Router } from 'express';
import { config } from '../../config.js';
import { factorialConfigurado, planejar, sincronizar, ultimaSincronizacao } from '../../factorial.js';

const router = Router();

// Situação da integração (a chave da API nunca sai do servidor)
router.get('/', async (req, res) => {
  res.json({
    configurado: factorialConfigurado(),
    intervaloHoras: config.factorial.intervaloHoras,
    limiteBloqueios: config.factorial.limiteBloqueios,
    ultima: await ultimaSincronizacao(),
  });
});

// Mostra o que mudaria, sem alterar nada
router.post('/previa', async (req, res) => {
  res.json(await planejar());
});

// Aplica agora (manual: sem a trava de bloqueios em massa, o RH já conferiu a prévia)
router.post('/sincronizar', async (req, res) => {
  res.json(await sincronizar(req));
});

export default router;
