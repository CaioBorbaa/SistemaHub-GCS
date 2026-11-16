import { Router } from 'express';
import { calendario, hojeIso, lerConfig, salvarConfig, temaAtivo, validarConfig } from '../../temas.js';

const router = Router();

async function resposta() {
  const config = await lerConfig();
  return { config, ativo: temaAtivo(config), calendario: calendario(config), hoje: hojeIso() };
}

router.get('/', async (req, res) => {
  res.json(await resposta());
});

router.put('/', async (req, res) => {
  await salvarConfig(validarConfig(req.body));
  res.json(await resposta());
});

export default router;
