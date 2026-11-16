import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function obrigatoria(nome) {
  const valor = process.env[nome];
  if (!valor) {
    console.error(`❌ Variável de ambiente ${nome} não configurada (veja .env.example).`);
    process.exit(1);
  }
  return valor;
}

export const config = {
  porta: Number(process.env.PORT || 3001),
  producao: process.env.NODE_ENV === 'production',

  db: {
    host: obrigatoria('DB_HOST'),
    port: Number(process.env.DB_PORT || 3306),
    user: obrigatoria('DB_USER'),
    password: process.env.DB_PASSWORD || '',
    database: obrigatoria('DB_NAME'),
  },

  sessao: {
    segredo: obrigatoria('SESSION_SECRET'),
    duracaoHoras: Number(process.env.SESSION_HOURS || 12),
    cookieSeguro: process.env.COOKIE_SECURE === 'true',
  },

  // Valores de usuarios.nivel_acesso que podem entrar no painel administrativo
  niveisAdmin: (process.env.ADMIN_LEVELS || 'admin')
    .split(',')
    .map((n) => n.trim().toLowerCase())
    .filter(Boolean),

  // Valores de usuarios.nivel_acesso que entram no painel do RH (/rh)
  niveisRh: (process.env.RH_LEVELS || 'rh')
    .split(',')
    .map((n) => n.trim().toLowerCase())
    .filter(Boolean),

  // Integração com o Factorial (cadastro de colaboradores pelo CPF)
  factorial: {
    chave: process.env.FACTORIAL_API_KEY || '',
    url: (process.env.FACTORIAL_API_URL || 'https://api.factorialhr.com').replace(/\/+$/, ''),
    versao: process.env.FACTORIAL_API_VERSION || '2026-10-01',
    // de quantas em quantas horas sincroniza sozinho (0 = só pelo botão no painel do RH)
    intervaloHoras: Number(process.env.FACTORIAL_SYNC_HORAS ?? 6),
    // trava de segurança: a sincronização automática não bloqueia mais que isso de uma vez
    limiteBloqueios: Number(process.env.FACTORIAL_MAX_BLOQUEIOS || 20),
    // campo do funcionário com o CPF; vazio = descobre sozinho (identifier, social_security_number...)
    campoCpf: process.env.FACTORIAL_CAMPO_CPF || '',
  },

  clima: {
    chaveHg: process.env.HG_WEATHER_API_KEY || '',
    // IP público usado quando o acesso vem da rede interna (IPs privados não têm geolocalização)
    ipPadrao: process.env.WEATHER_FALLBACK_IP || '200.233.220.149',
    cacheSegundos: 1800,
  },

  // Quantos proxies confiáveis ficam na frente da aplicação (Cloudflare, Nginx...)
  trustProxy: process.env.TRUST_PROXY ?? 'loopback',

  pastas: {
    raiz,
    // Onde ficam os arquivos enviados pelo painel (banners). Padrão: backend/uploads
    uploads: path.resolve(raiz, process.env.UPLOADS_DIR || 'uploads'),
    banners: path.resolve(raiz, process.env.UPLOADS_DIR || 'uploads', 'banners'),
    frontend: path.resolve(raiz, process.env.FRONTEND_DIST || '../frontend/dist'),
  },

  tamanhoMaxImagemMb: 5,
};

export function ehNivelAdmin(nivel) {
  return config.niveisAdmin.includes(String(nivel || '').trim().toLowerCase());
}

export function ehNivelRh(nivel) {
  return config.niveisRh.includes(String(nivel || '').trim().toLowerCase());
}

/** Níveis que entram em algum painel (TI ou RH) e por isso precisam de senha. */
export function temPainel(nivel) {
  return ehNivelAdmin(nivel) || ehNivelRh(nivel);
}
