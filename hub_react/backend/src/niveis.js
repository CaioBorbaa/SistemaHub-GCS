import { config, temPainel } from './config.js';
import { queryOne } from './db.js';

/**
 * Se nivel_acesso for ENUM no banco (ex.: 'admin','rh','colaborador'),
 * devolve os valores permitidos; se for texto livre, null.
 */
export async function niveisDoEnum() {
  const coluna = await queryOne(
    `SELECT COLUMN_TYPE AS tipo FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'nivel_acesso'`,
  );
  const enumerado = /^enum\((.*)\)$/i.exec(coluna?.tipo ?? '');
  if (!enumerado) return null;
  return [...enumerado[1].matchAll(/'((?:[^']|'')*)'/g)].map((m) => m[1].replace(/''/g, "'"));
}

/** Níveis que dão acesso a algum painel (T.I. ou RH) — o RH não enxerga nem mexe nesses usuários. */
export const niveisDePainel = () => [...new Set([...config.niveisAdmin, ...config.niveisRh])];

/** Nível dado a quem o RH cadastra: "colaborador" (ou o primeiro nível comum que o banco aceitar). */
export async function nivelDoColaborador() {
  const permitidos = await niveisDoEnum();
  if (!permitidos || permitidos.includes('colaborador')) return 'colaborador';
  const comum = permitidos.find((n) => !temPainel(n));
  if (!comum) throw new Error('O banco não tem um nível de acesso comum para colaboradores.');
  return comum;
}
