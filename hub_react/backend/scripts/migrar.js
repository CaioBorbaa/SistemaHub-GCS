/**
 * Prepara um banco EXISTENTE (do sistema Flask) para a versão React.
 * Pode ser executado mais de uma vez: só aplica o que ainda falta.
 *
 *   npm run migrar
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../src/config.js';
import { pool, query, queryOne } from '../src/db.js';

const schema = await fs.readFile(path.join(config.pastas.raiz, 'database', 'schema.sql'), 'utf8');

async function coluna(tabela, nome) {
  return queryOne(
    `SELECT DATA_TYPE AS tipo FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [tabela, nome],
  );
}

async function passo(descricao, fn) {
  const resultado = await fn();
  console.log(`${resultado === false ? '·' : '✔'} ${descricao}${resultado === false ? ' (já estava ok)' : ''}`);
}

try {
  // 1) Tabelas (CREATE TABLE IF NOT EXISTS não altera tabelas já existentes)
  const comandos = schema
    .replace(/--.*$/gm, '')
    .split(';')
    .map((c) => c.trim())
    .filter(Boolean);
  for (const sql of comandos) await query(sql);
  console.log('✔ Tabelas criadas/verificadas');

  // 2) Senha dos administradores
  await passo('Coluna usuarios.senha_hash', async () => {
    if (await coluna('usuarios', 'senha_hash')) return false;
    await query('ALTER TABLE usuarios ADD COLUMN senha_hash VARCHAR(255) NULL');
  });

  // 3) BLOB comum só guarda 64 KB — ícones maiores seriam cortados
  await passo('links.imagem como MEDIUMBLOB (até 16 MB)', async () => {
    const atual = await coluna('links', 'imagem');
    if (!atual || ['mediumblob', 'longblob'].includes(atual.tipo)) return false;
    await query('ALTER TABLE links MODIFY imagem MEDIUMBLOB NULL');
  });

  // 4) Colunas de ordenação/status usadas pelo painel
  for (const [tabela, nome, definicao] of [
    ['links', 'ordem', 'INT NOT NULL DEFAULT 0'],
    ['links', 'ativo', 'TINYINT(1) NOT NULL DEFAULT 1'],
    ['categorias', 'ordem', 'INT NOT NULL DEFAULT 0'],
    ['banners', 'ordem', 'INT NOT NULL DEFAULT 0'],
    ['banners', 'ativo', 'TINYINT(1) NOT NULL DEFAULT 1'],
    ['banners', 'popup_nome', 'VARCHAR(255) NULL'], // imagem aberta ao clicar no banner
  ]) {
    await passo(`Coluna ${tabela}.${nome}`, async () => {
      if (await coluna(tabela, nome)) return false;
      await query(`ALTER TABLE ${tabela} ADD COLUMN ${nome} ${definicao}`);
    });
  }

  // 5) Presentes iniciais do saco de Natal (só se a tabela estiver vazia)
  await passo('Presentes iniciais do saco de Natal', async () => {
    const { total } = await queryOne('SELECT COUNT(*) AS total FROM presentes');
    if (Number(total) > 0) return false;
    const pasta = path.join(config.pastas.raiz, 'database', 'presentes');
    const lista = JSON.parse(await fs.readFile(path.join(pasta, 'presentes.json'), 'utf8'));
    for (const p of lista) {
      const imagem = await fs.readFile(path.join(pasta, p.arquivo));
      await query('INSERT INTO presentes (nome, imagem, imagem_tipo) VALUES (?, ?, ?)', [p.nome, imagem, 'image/png']);
    }
  });

  console.log('\nMigração concluída. Crie um administrador com: npm run criar-admin');
} catch (erro) {
  console.error('\n❌ Falha na migração:', erro.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
