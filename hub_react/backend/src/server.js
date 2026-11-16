import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cookieSession from 'cookie-session';
import compression from 'compression';
import multer from 'multer';
import { config } from './config.js';
import { pool } from './db.js';
import { exigeAdmin, exigeRh } from './auth.js';
import { registrarAoAlterar } from './historico.js';
import authRoutes from './routes/auth.js';
import publicoRoutes from './routes/publico.js';
import dashboardRoutes from './routes/admin/dashboard.js';
import linksRoutes from './routes/admin/links.js';
import categoriasRoutes from './routes/admin/categorias.js';
import bannersRoutes from './routes/admin/banners.js';
import usuariosRoutes from './routes/admin/usuarios.js';
import avisosRoutes from './routes/admin/avisos.js';
import temasRoutes from './routes/admin/temas.js';
import presentesRoutes from './routes/admin/presentes.js';
import rhResumoRoutes from './routes/rh/resumo.js';
import rhColaboradoresRoutes from './routes/rh/colaboradores.js';
import rhHistoricoRoutes from './routes/rh/historico.js';
import rhFactorialRoutes from './routes/rh/factorial.js';
import { agendarSincronizacao } from './factorial.js';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', /^\d+$/.test(config.trustProxy) ? Number(config.trustProxy) : config.trustProxy);

// gzip em JSON, JS e CSS (o código do site cai para ~1/3 do tamanho)
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(
  cookieSession({
    name: 'hub_sessao',
    keys: [config.sessao.segredo],
    maxAge: config.sessao.duracaoHoras * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: config.sessao.cookieSeguro,
  }),
);

// --- API -----------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api', publicoRoutes);

const admin = express.Router();
admin.use(exigeAdmin);
admin.use('/dashboard', dashboardRoutes);
admin.use('/links', linksRoutes);
admin.use('/categorias', categoriasRoutes);
admin.use('/banners', bannersRoutes);
admin.use('/usuarios', usuariosRoutes);
admin.use('/avisos', avisosRoutes);
admin.use('/temas', temasRoutes);
admin.use('/presentes', presentesRoutes);
app.use('/api/admin', admin);

// Painel do RH: só colaboradores, avisos e o histórico do que o próprio RH fez
const rh = express.Router();
rh.use(exigeRh);
rh.use('/resumo', rhResumoRoutes);
rh.use('/colaboradores', rhColaboradoresRoutes);
rh.use(
  '/avisos',
  registrarAoAlterar((req) => {
    const titulo = req.body?.titulo ? `"${req.body.titulo}"` : `#${req.path.split('/')[1]}`;
    if (req.method === 'POST') return ['aviso', `Publicou o aviso ${titulo}`];
    if (req.method === 'DELETE') return ['aviso', `Excluiu o aviso ${titulo}`];
    if (req.method === 'PATCH') return ['aviso', `${req.body?.ativo ? 'Ativou' : 'Desativou'} o aviso ${titulo}`];
    return ['aviso', `Editou o aviso ${titulo}`];
  }),
  avisosRoutes,
);
rh.use('/historico', rhHistoricoRoutes);
rh.use('/factorial', rhFactorialRoutes);
app.use('/api/rh', rh);

app.use('/api', (req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

// --- Arquivos enviados (banners) -----------------------------------------
app.use('/uploads', express.static(config.pastas.uploads, { maxAge: '7d', index: false }));

// --- Front-end React compilado (produção) --------------------------------
const indexHtml = path.join(config.pastas.frontend, 'index.html');
if (fs.existsSync(indexHtml)) {
  app.use(
    express.static(config.pastas.frontend, {
      index: false,
      setHeaders(res, caminho) {
        // arquivos do build têm hash no nome: podem ficar no cache do navegador por 1 ano
        if (/[\\/]assets[\\/]/.test(caminho)) res.set('Cache-Control', 'public, max-age=31536000, immutable');
        else res.set('Cache-Control', 'public, max-age=3600'); // logos e imagens dos temas
      },
    }),
  );
  // o index.html é sempre revalidado, para uma atualização do site chegar na hora
  app.get(/^\/(?!api\/|uploads\/).*/, (req, res) => res.set('Cache-Control', 'no-cache').sendFile(indexHtml));
}

// --- Tratamento de erros -------------------------------------------------
app.use((erro, req, res, next) => {
  if (res.headersSent) return next(erro);
  if (erro instanceof multer.MulterError) {
    const msg = erro.code === 'LIMIT_FILE_SIZE'
      ? `A imagem deve ter no máximo ${config.tamanhoMaxImagemMb} MB.`
      : 'Falha no envio do arquivo.';
    return res.status(400).json({ erro: msg });
  }
  if (erro.type === 'entity.parse.failed') return res.status(400).json({ erro: 'JSON inválido.' });
  if (erro.code === 'ER_NO_SUCH_TABLE' || erro.code === 'ER_BAD_FIELD_ERROR') {
    console.error(`[${req.method} ${req.originalUrl}] banco desatualizado:`, erro.message);
    return res.status(503).json({ erro: 'O banco de dados precisa ser atualizado. Rode "npm run migrar" na pasta backend e reinicie o servidor.' });
  }
  if (erro.status && erro.status < 500) return res.status(erro.status).json({ erro: erro.message });

  console.error(`[${req.method} ${req.originalUrl}]`, erro);
  const msg = erro.status ? erro.message : 'Erro interno do servidor. Se persistir, contate o setor de T.I.';
  res.status(erro.status || 500).json({ erro: msg });
});

const servidor = app.listen(config.porta, async () => {
  console.log(`🚀 Hub Tintomax (API) em http://localhost:${config.porta}`);
  console.log(`📍 Banco: ${config.db.user}@${config.db.host}/${config.db.database}`);
  console.log(`🌤️  API do clima: ${config.clima.chaveHg ? 'configurada' : 'NÃO configurada'}`);
  console.log(`👥 Factorial: ${agendarSincronizacao()
    ? `sincroniza a cada ${config.factorial.intervaloHoras} h`
    : config.factorial.chave ? 'só pelo painel do RH' : 'NÃO configurado'}`);
  console.log(`🖥️  Front-end: ${fs.existsSync(indexHtml) ? config.pastas.frontend : 'não compilado (use o Vite em dev)'}`);
  try {
    await pool.query('SELECT 1');
    console.log('✅ Conexão com o banco OK');
  } catch (erro) {
    console.error('❌ Não foi possível conectar ao banco:', erro.message);
  }
});

for (const sinal of ['SIGINT', 'SIGTERM']) {
  process.on(sinal, () => servidor.close(() => pool.end().finally(() => process.exit(0))));
}
