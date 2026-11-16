import { config, temPainel } from './config.js';
import { query, queryOne, transacao } from './db.js';
import { registrarRh } from './historico.js';
import { nivelDoColaborador } from './niveis.js';
import { hojeIso } from './temas.js';
import { HttpError, cpfValido, somenteDigitos } from './util.js';

/*
 * Integração com o Factorial (https://apidoc.factorialhr.com): o Factorial é a fonte
 * dos colaboradores. Quem está ativo lá pode entrar no hub com o CPF; quem foi desligado
 * lá é bloqueado aqui. Só LEITURA no Factorial — o hub nunca altera nada por lá.
 *
 * Regras de segurança:
 *  - contas da T.I. e do RH (com painel) nunca são alteradas pela sincronização;
 *  - quem está bloqueado no hub não é reativado sozinho (o RH decide);
 *  - colaboradores do hub que não existem no Factorial (ex.: terceiros) não são bloqueados;
 *  - a sincronização automática não aplica se for bloquear mais que FACTORIAL_MAX_BLOQUEIOS.
 */

const CHAVE_STATUS = 'factorial_ultima_sync';
// onde o CPF costuma estar no cadastro do funcionário (o primeiro com CPF válido vence)
const CAMPOS_CPF = ['identifier', 'social_security_number', 'company_identifier'];
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

export const factorialConfigurado = () => Boolean(config.factorial.chave);

/** GET na API do Factorial com a chave, tentando de novo em limite de uso (429) e falhas do servidor. */
async function pedir(url) {
  for (let tentativa = 0; ; tentativa++) {
    let resposta;
    try {
      resposta = await fetch(url, {
        headers: { 'x-api-key': config.factorial.chave, accept: 'application/json' },
        signal: AbortSignal.timeout(30_000),
      });
    } catch {
      if (tentativa < 3) { await espera(2000 * 2 ** tentativa); continue; }
      throw new HttpError(502, 'Não foi possível conectar ao Factorial. Verifique a internet do servidor.');
    }
    if (resposta.ok) return resposta.json().catch(() => null);
    if ((resposta.status === 429 || resposta.status >= 500) && tentativa < 4) {
      await espera(2000 * 2 ** tentativa);
      continue;
    }
    if (resposta.status === 401) throw new HttpError(502, 'O Factorial recusou a chave da API (FACTORIAL_API_KEY). Confira com a T.I.');
    if (resposta.status === 403) throw new HttpError(502, 'A chave da API do Factorial não tem permissão para ler os colaboradores. Use uma chave criada por um administrador.');
    throw new HttpError(502, `O Factorial respondeu com erro ${resposta.status}.`);
  }
}

/** Todos os funcionários (ativos e desligados), página a página. */
export async function listarFuncionarios() {
  const { url, versao } = config.factorial;
  const todos = [];
  let cursor = null;
  for (let pagina = 0; pagina < 1000; pagina++) {
    const endereco = new URL(`${url}/api/${versao}/resources/employees/employees`);
    endereco.searchParams.set('limit', '100');
    endereco.searchParams.set('only_active', 'false');
    endereco.searchParams.set('only_managers', 'false');
    if (cursor) endereco.searchParams.set('after_id', cursor);

    const corpo = await pedir(endereco);
    // credencial do ambiente errado (demo x produção) volta 200 sem conteúdo
    if (!corpo || !Array.isArray(corpo.data)) {
      throw new HttpError(502, 'Resposta inesperada do Factorial. Confira se a chave é do ambiente de produção.');
    }
    todos.push(...corpo.data);
    if (!corpo.meta?.has_next_page || !corpo.meta.end_cursor) break;
    cursor = corpo.meta.end_cursor;
  }
  return todos;
}

/** CPF do funcionário: o primeiro campo (na ordem de CAMPOS_CPF) que tiver um CPF válido. */
export function cpfDoFuncionario(funcionario) {
  const campos = config.factorial.campoCpf ? [config.factorial.campoCpf] : CAMPOS_CPF;
  for (const campo of campos) {
    const digitos = somenteDigitos(funcionario?.[campo]);
    if (digitos.length < 9 || digitos.length > 11) continue;
    const cpf = digitos.padStart(11, '0'); // zeros à esquerda perdidos no cadastro
    if (cpfValido(cpf)) return { cpf, campo };
  }
  return null;
}

/** Ativo = não desligado. A data de desligamento vale até o fim do dia (bloqueia a partir do dia seguinte). */
export function estaAtivo(funcionario, hoje = hojeIso()) {
  if (funcionario.active === false) return false;
  const desligamento = String(funcionario.terminated_on ?? funcionario.termination_date ?? '').slice(0, 10);
  return !(desligamento && desligamento < hoje);
}

const nomeDo = (f) =>
  String(f.full_name || [f.first_name, f.last_name].filter(Boolean).join(' ')).replace(/\s+/g, ' ').trim().slice(0, 150);

/** Compara o Factorial com o hub e devolve o que mudaria — sem alterar nada. */
export async function planejar() {
  if (!factorialConfigurado()) throw new HttpError(400, 'A integração com o Factorial não está configurada (FACTORIAL_API_KEY no .env do servidor).');

  const funcionarios = await listarFuncionarios();
  if (!funcionarios.length) throw new HttpError(502, 'O Factorial não devolveu nenhum colaborador. Nada foi alterado.');

  const hoje = hojeIso();
  const porCpf = new Map();
  const semCpf = [];
  const camposUsados = {};
  for (const f of funcionarios) {
    const achado = cpfDoFuncionario(f);
    const ativo = estaAtivo(f, hoje);
    if (!achado) {
      if (ativo) semCpf.push({ nome: nomeDo(f), factorialId: f.id });
      continue;
    }
    camposUsados[achado.campo] = (camposUsados[achado.campo] ?? 0) + 1;
    const anterior = porCpf.get(achado.cpf);
    // readmissão pode gerar outro cadastro com o mesmo CPF: vale o que estiver ativo
    if (!anterior || (ativo && !anterior.ativo)) porCpf.set(achado.cpf, { nome: nomeDo(f), cpf: achado.cpf, ativo });
  }
  if (!porCpf.size) {
    throw new HttpError(502, `Nenhum colaborador do Factorial tem CPF nos campos lidos (${CAMPOS_CPF.join(', ')}). `
      + 'Confira em qual campo o CPF é cadastrado (FACTORIAL_CAMPO_CPF) e se a chave da API é de administrador. Nada foi alterado.');
  }

  const usuarios = await query('SELECT id, nome_completo, cpf, nivel_acesso, ativo FROM usuarios');
  const noHub = new Map(usuarios.map((u) => [u.cpf, u]));

  const criar = [];
  const bloquear = [];
  const renomear = [];
  const bloqueadosNoHub = [];
  for (const f of porCpf.values()) {
    const u = noHub.get(f.cpf);
    if (!u) {
      if (f.ativo && f.nome) criar.push({ nome: f.nome, cpf: f.cpf });
      continue;
    }
    if (temPainel(u.nivel_acesso)) continue; // contas da T.I./RH: só a T.I. mexe
    const item = { id: u.id, nome: u.nome_completo, cpf: u.cpf };
    if (!f.ativo && u.ativo) bloquear.push(item);
    if (f.ativo && !u.ativo) bloqueadosNoHub.push(item);
    if (f.ativo && f.nome && f.nome !== u.nome_completo) renomear.push({ ...item, novoNome: f.nome });
  }
  const foraDoFactorial = usuarios
    .filter((u) => u.ativo && !temPainel(u.nivel_acesso) && !porCpf.has(u.cpf))
    .map((u) => ({ id: u.id, nome: u.nome_completo, cpf: u.cpf }));

  const ordenar = (lista) => lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  return {
    totalFactorial: funcionarios.length,
    ativosFactorial: [...porCpf.values()].filter((f) => f.ativo).length,
    campoCpf: Object.entries(camposUsados).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
    criar: ordenar(criar),
    bloquear: ordenar(bloquear),
    renomear: ordenar(renomear),
    bloqueadosNoHub: ordenar(bloqueadosNoHub),
    foraDoFactorial: ordenar(foraDoFactorial),
    semCpf: ordenar(semCpf),
  };
}

export async function ultimaSincronizacao() {
  try {
    const linha = await queryOne('SELECT valor FROM configuracoes WHERE chave = ?', [CHAVE_STATUS]);
    return linha ? JSON.parse(linha.valor) : null;
  } catch {
    return null;
  }
}

async function guardarStatus(status) {
  try {
    await query(
      'INSERT INTO configuracoes (chave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)',
      [CHAVE_STATUS, JSON.stringify({ ...status, quando: new Date().toISOString() })],
    );
  } catch (erro) {
    console.warn('Não foi possível guardar o status da sincronização do Factorial:', erro.message);
  }
}

let emAndamento = false;

/**
 * Busca no Factorial e aplica as mudanças. `req` = quem clicou no painel (manual);
 * sem `req` é a sincronização automática, que respeita a trava de bloqueios em massa.
 */
export async function sincronizar(req = null) {
  if (emAndamento) throw new HttpError(409, 'Já existe uma sincronização com o Factorial em andamento. Aguarde alguns instantes.');
  emAndamento = true;
  const automatico = !req;
  const autor = req ?? { session: { usuario: { id: null, nome: 'Factorial (automático)' } } };
  const quem = automatico ? 'automático' : req.session.usuario.nome;

  try {
    const plano = await planejar();
    const { limiteBloqueios } = config.factorial;
    if (automatico && plano.bloquear.length > limiteBloqueios) {
      const alerta = `A sincronização automática encontraria ${plano.bloquear.length} desligamentos de uma vez (limite: ${limiteBloqueios}). `
        + 'Por segurança nada foi aplicado. Confira em "Factorial" no painel do RH e sincronize manualmente.';
      await guardarStatus({ quem, alerta, pendentes: { criar: plano.criar.length, bloquear: plano.bloquear.length } });
      console.warn(`Factorial: ${alerta}`);
      return { aplicado: false, alerta, plano };
    }

    if (plano.criar.length || plano.bloquear.length || plano.renomear.length) {
      const nivel = await nivelDoColaborador();
      await transacao(async (conn) => {
        for (const c of plano.criar) {
          await conn.query('INSERT INTO usuarios (nome_completo, cpf, nivel_acesso, ativo) VALUES (?, ?, ?, 1)', [c.nome, c.cpf, nivel]);
        }
        for (const b of plano.bloquear) await conn.query('UPDATE usuarios SET ativo = 0 WHERE id = ?', [b.id]);
        for (const r of plano.renomear) await conn.query('UPDATE usuarios SET nome_completo = ? WHERE id = ?', [r.novoNome, r.id]);
      });
    }

    const resumo = (lista, campo = 'nome') => lista.slice(0, 15).map((i) => i[campo]).join(', ') + (lista.length > 15 ? '...' : '');
    if (plano.criar.length) await registrarRh(autor, 'importacao', `Factorial: cadastrou ${plano.criar.length} admitido(s): ${resumo(plano.criar)}`);
    if (plano.bloquear.length) await registrarRh(autor, 'bloqueio', `Factorial: bloqueou ${plano.bloquear.length} desligado(s): ${resumo(plano.bloquear)}`);
    if (plano.renomear.length) await registrarRh(autor, 'edicao', `Factorial: atualizou o nome de ${plano.renomear.length} colaborador(es): ${resumo(plano.renomear, 'novoNome')}`);

    const contagem = {
      criados: plano.criar.length,
      bloqueados: plano.bloquear.length,
      renomeados: plano.renomear.length,
      semCpf: plano.semCpf.length,
      bloqueadosNoHub: plano.bloqueadosNoHub.length,
      foraDoFactorial: plano.foraDoFactorial.length,
      totalFactorial: plano.totalFactorial,
    };
    await guardarStatus({ quem, ...contagem });
    return { aplicado: true, ...contagem };
  } catch (erro) {
    await guardarStatus({ quem, erro: erro.message });
    throw erro;
  } finally {
    emAndamento = false;
  }
}

/** Liga a sincronização automática (chamado quando o servidor sobe). */
export function agendarSincronizacao() {
  const { intervaloHoras } = config.factorial;
  if (!factorialConfigurado() || !(intervaloHoras > 0)) return false;
  const rodar = () => sincronizar().then(
    (r) => r.aplicado && console.log(`🔄 Factorial: ${r.criados} cadastrado(s), ${r.bloqueados} bloqueado(s), ${r.renomeados} nome(s) atualizado(s)`),
    (erro) => console.warn('⚠️  Factorial:', erro.message),
  );
  setTimeout(rodar, 60_000).unref(); // 1 minuto depois de subir
  setInterval(rodar, intervaloHoras * 3_600_000).unref();
  return true;
}
