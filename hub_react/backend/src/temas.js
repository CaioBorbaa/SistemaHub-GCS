import { query, queryOne } from './db.js';
import { HttpError } from './util.js';

/**
 * Temas comemorativos. A aparência de cada um fica no front-end
 * (frontend/src/temas); aqui ficam só as regras de data e a configuração.
 * Para criar um tema novo: adicione-o aqui e em frontend/src/temas/index.js.
 */
export const TEMAS = {
  pascoa: { mensagem: '🐰 Feliz Páscoa! 🥚', periodoAuto: periodoPascoa },
  'festa-junina': { mensagem: '🌽 Arraiá do Hub! Viva São João! 🔥', periodoAuto: (ano) => periodoFixo(ano, '06-01', '06-30') },
  'festa-julina': { mensagem: '🎉 Arraiá Julino do Hub! 🌽', periodoAuto: (ano) => periodoFixo(ano, '07-01', '07-31') },
  halloween: { mensagem: '🎃 Feliz Halloween! 👻', periodoAuto: (ano) => periodoFixo(ano, '10-24', '10-31') },
  natal: { mensagem: '🎄 Feliz Natal! 🎅', periodoAuto: (ano) => periodoFixo(ano, '12-01', '12-26') },
  'ano-novo': { mensagem: '🎆 Feliz Ano Novo! 🥂', periodoAuto: (ano) => periodoFixo(ano, '12-27', '01-06') },
};

const CHAVE = 'tema';
const FUSO = process.env.TIMEZONE || 'America/Sao_Paulo';
const DIA_MS = 24 * 60 * 60 * 1000;
const MODOS = ['automatico', 'fixo', 'desligado'];

// --- Datas (sempre em UTC, só a parte do dia importa) ---------------------

const data = (ano, mes, dia) => new Date(Date.UTC(ano, mes - 1, dia));
const iso = (d) => d.toISOString().slice(0, 10);
const somarDias = (d, n) => new Date(d.getTime() + n * DIA_MS);

export function hoje() {
  const [a, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone: FUSO }).format(new Date()).split('-').map(Number);
  return data(a, m, d);
}

/** Domingo de Páscoa (algoritmo de Meeus/Jones/Butcher). */
export function domingoDePascoa(ano) {
  const a = ano % 19, b = Math.floor(ano / 100), c = ano % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return data(ano, mes, dia);
}

/** Duas semanas antes do domingo de Páscoa até a segunda-feira seguinte. */
function periodoPascoa(ano) {
  const domingo = domingoDePascoa(ano);
  return { inicio: somarDias(domingo, -14), fim: somarDias(domingo, 1) };
}

/** Período "MM-DD" a "MM-DD" que começa em `ano` (pode virar o ano). */
function periodoFixo(ano, inicio, fim) {
  const [mi, di] = inicio.split('-').map(Number);
  const [mf, df] = fim.split('-').map(Number);
  const d1 = data(ano, mi, di);
  let d2 = data(ano, mf, df);
  if (d2 < d1) d2 = data(ano + 1, mf, df);
  return { inicio: d1, fim: d2 };
}

function periodoNoAno(id, cfg, ano) {
  const p = cfg.periodo;
  return p?.tipo === 'personalizado' ? periodoFixo(ano, p.inicio, p.fim) : TEMAS[id].periodoAuto(ano);
}

/** Período em vigor hoje ou o próximo que vai começar. */
function proximoPeriodo(id, cfg, dia) {
  const ano = dia.getUTCFullYear();
  return [ano - 1, ano, ano + 1]
    .map((a) => periodoNoAno(id, cfg, a))
    .find((p) => p.fim >= dia);
}

// --- Configuração ---------------------------------------------------------

export function configPadrao() {
  return {
    modo: 'automatico',
    fixo: null,
    temas: Object.fromEntries(
      Object.entries(TEMAS).map(([id, t]) => [id, { habilitado: true, periodo: { tipo: 'auto' }, mensagem: t.mensagem, efeitos: true }]),
    ),
  };
}

/** Completa a configuração salva com os padrões (ex.: temas criados depois). */
function normalizar(salva) {
  const padrao = configPadrao();
  const cfg = { ...padrao, ...salva, temas: { ...padrao.temas } };
  for (const id of Object.keys(TEMAS)) cfg.temas[id] = { ...padrao.temas[id], ...salva?.temas?.[id] };
  return cfg;
}

export async function lerConfig() {
  try {
    const linha = await queryOne('SELECT valor FROM configuracoes WHERE chave = ?', [CHAVE]);
    return normalizar(linha ? JSON.parse(linha.valor) : null);
  } catch {
    return configPadrao(); // tabela ainda não migrada
  }
}

const MM_DD = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

/** "MM-DD" que existe no calendário (29/02 é aceito). */
function diaDoAnoValido(mmdd) {
  if (!MM_DD.test(mmdd)) return false;
  const [m, d] = mmdd.split('-').map(Number);
  return data(2024, m, d).getUTCDate() === d;
}

export function validarConfig(entrada) {
  const modo = entrada?.modo;
  if (!MODOS.includes(modo)) throw new HttpError(400, 'Modo de tema inválido.');
  const fixo = entrada.fixo ?? null;
  if (modo === 'fixo' && !TEMAS[fixo]) throw new HttpError(400, 'Escolha qual tema deve ficar fixo.');

  const temas = {};
  for (const id of Object.keys(TEMAS)) {
    const t = entrada.temas?.[id] ?? {};
    const periodo = t.periodo?.tipo === 'personalizado'
      ? { tipo: 'personalizado', inicio: String(t.periodo.inicio), fim: String(t.periodo.fim) }
      : { tipo: 'auto' };
    if (periodo.tipo === 'personalizado' && (!diaDoAnoValido(periodo.inicio) || !diaDoAnoValido(periodo.fim))) {
      throw new HttpError(400, 'Período personalizado inválido. Use dia e mês válidos.');
    }
    temas[id] = {
      habilitado: Boolean(t.habilitado),
      periodo,
      mensagem: String(t.mensagem ?? '').trim().slice(0, 120),
      efeitos: Boolean(t.efeitos),
    };
  }
  return { modo, fixo: modo === 'fixo' ? fixo : null, temas };
}

export async function salvarConfig(cfg) {
  try {
    await query(
      'INSERT INTO configuracoes (chave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)',
      [CHAVE, JSON.stringify(cfg)],
    );
  } catch (erro) {
    if (erro.code === 'ER_NO_SUCH_TABLE' || erro.code === 'ER_BAD_FIELD_ERROR') {
      throw new HttpError(503, 'O banco ainda não tem a tabela de configurações. Rode "npm run migrar" na pasta backend e tente de novo.');
    }
    throw erro;
  }
}

/** Tema que deve aparecer no hub em `dia` (ou null para o visual padrão). */
export function temaAtivo(cfg, dia = hoje()) {
  if (cfg.modo === 'desligado') return null;

  if (cfg.modo === 'fixo') {
    const t = cfg.temas[cfg.fixo];
    return t ? { id: cfg.fixo, mensagem: t.mensagem, efeitos: t.efeitos, origem: 'fixo', ate: null } : null;
  }

  for (const [id, t] of Object.entries(cfg.temas)) {
    if (!t.habilitado) continue;
    const p = proximoPeriodo(id, t, dia);
    if (p && p.inicio <= dia) return { id, mensagem: t.mensagem, efeitos: t.efeitos, origem: 'automatico', ate: iso(p.fim) };
  }
  return null;
}

/** Próximas datas de cada tema, para exibir no painel. */
export function calendario(cfg, dia = hoje()) {
  return Object.fromEntries(
    Object.keys(TEMAS).map((id) => {
      const p = proximoPeriodo(id, cfg.temas[id], dia);
      return [id, { inicio: iso(p.inicio), fim: iso(p.fim) }];
    }),
  );
}

export const hojeIso = () => iso(hoje());
