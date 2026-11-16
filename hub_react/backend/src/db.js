import mysql from 'mysql2/promise';
import { config } from './config.js';

export const pool = mysql.createPool({
  ...config.db,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
});

export async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] ?? null;
}

/** Executa `fn(conn)` dentro de uma transação, com commit/rollback automáticos. */
export async function transacao(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const resultado = await fn(conn);
    await conn.commit();
    return resultado;
  } catch (erro) {
    await conn.rollback();
    throw erro;
  } finally {
    conn.release();
  }
}

/** Grava `ordem = posição + 1` para cada id da lista (usado no arrastar-e-soltar). */
export async function salvarOrdem(tabela, ids) {
  await transacao(async (conn) => {
    for (const [posicao, id] of ids.entries()) {
      await conn.query(`UPDATE ${tabela} SET ordem = ? WHERE id = ?`, [posicao + 1, id]);
    }
  });
}

export async function proximaOrdem(tabela) {
  const linha = await queryOne(`SELECT COALESCE(MAX(ordem), 0) + 1 AS proxima FROM ${tabela}`);
  return linha.proxima;
}
