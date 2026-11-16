/**
 * Cria um administrador ou promove um usuário existente, definindo a senha
 * do painel. Exemplos:
 *
 *   npm run criar-admin
 *   npm run criar-admin -- --cpf 123.456.789-09 --nome "Maria Souza"
 */
import readline from 'node:readline/promises';
import { parseArgs } from 'node:util';
import bcrypt from 'bcryptjs';
import { config } from '../src/config.js';
import { pool, queryOne, query } from '../src/db.js';
import { cpfValido, somenteDigitos } from '../src/util.js';

const { values: args } = parseArgs({
  options: { cpf: { type: 'string' }, nome: { type: 'string' }, senha: { type: 'string' } },
});

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const perguntar = async (texto, atual) => atual ?? (await rl.question(texto)).trim();

try {
  const cpf = somenteDigitos(await perguntar('CPF do administrador: ', args.cpf));
  if (!cpfValido(cpf)) throw new Error('CPF inválido.');

  const existente = await queryOne('SELECT id, nome_completo FROM usuarios WHERE cpf = ?', [cpf]);
  const nome = existente?.nome_completo ?? (await perguntar('Nome completo: ', args.nome));
  if (!nome) throw new Error('Informe o nome.');

  const senha = await perguntar('Senha do painel (mín. 8 caracteres): ', args.senha);
  if (senha.length < 8) throw new Error('A senha deve ter pelo menos 8 caracteres.');

  const hash = await bcrypt.hash(senha, 12);
  const nivel = config.niveisAdmin[0];

  if (existente) {
    await query('UPDATE usuarios SET nivel_acesso = ?, senha_hash = ?, ativo = 1 WHERE id = ?', [nivel, hash, existente.id]);
    console.log(`\n✔ ${nome} agora é "${nivel}" e pode entrar em /admin.`);
  } else {
    await query(
      'INSERT INTO usuarios (nome_completo, cpf, nivel_acesso, ativo, senha_hash) VALUES (?, ?, ?, 1, ?)',
      [nome, cpf, nivel, hash],
    );
    console.log(`\n✔ Administrador ${nome} criado. Entre em /admin com o CPF e a senha.`);
  }
} catch (erro) {
  console.error(`\n❌ ${erro.message}`);
  process.exitCode = 1;
} finally {
  rl.close();
  await pool.end();
}
