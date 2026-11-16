import { Router } from 'express';
import { query, queryOne, transacao } from '../../db.js';
import { registrarRh } from '../../historico.js';
import { niveisDePainel, nivelDoColaborador } from '../../niveis.js';
import { HttpError, cpfValido, flag, idParam, somenteDigitos, textoObrigatorio } from '../../util.js';

/*
 * Painel do RH: só enxerga e altera COLABORADORES (quem entra no hub só com CPF).
 * Contas da T.I. e do próprio RH (que têm senha e painel) ficam de fora — quem
 * cuida delas é a T.I., em /admin/usuarios. O RH também não define nível nem senha.
 */
const router = Router();
const MAX_IMPORTACAO = 500;

const cpfFormatado = (cpf) => cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
const ehColaborador = () => ["COALESCE(LOWER(u.nivel_acesso), '') NOT IN (?)", [niveisDePainel()]];

async function buscar(id) {
  const [condicao, params] = ehColaborador();
  const colaborador = await queryOne(
    `SELECT u.id, u.nome_completo, u.cpf, u.ativo FROM usuarios u WHERE u.id = ? AND ${condicao}`,
    [id, ...params],
  );
  if (!colaborador) throw new HttpError(404, 'Colaborador não encontrado.');
  return colaborador;
}

function nomeValido(valor) {
  // nomes em maiúsculas/minúsculas misturadas ficam como foram digitados; só limpa espaços
  return textoObrigatorio(String(valor ?? '').replace(/\s+/g, ' '), 'o nome completo', 150);
}

function cpfDoFormulario(valor) {
  const cpf = somenteDigitos(valor);
  if (!cpfValido(cpf)) throw new HttpError(400, 'CPF inválido.');
  return cpf;
}

async function validarCpfUnico(cpf, idAtual = 0) {
  const existente = await queryOne('SELECT id, nome_completo FROM usuarios WHERE cpf = ? AND id <> ?', [cpf, idAtual]);
  if (existente) throw new HttpError(409, `Esse CPF já está cadastrado (${existente.nome_completo}).`);
}

router.get('/', async (req, res) => {
  const [condicao, params] = ehColaborador();
  const colaboradores = await query(
    `SELECT u.id, u.nome_completo, u.cpf, u.ativo,
            DATE_FORMAT(a.ultimo, '%Y-%m-%dT%H:%i:%s') AS ultimo_acesso
     FROM usuarios u
     LEFT JOIN (SELECT usuario_id, MAX(data_hora) AS ultimo FROM login_log GROUP BY usuario_id) a ON a.usuario_id = u.id
     WHERE ${condicao}
     ORDER BY u.nome_completo`,
    params,
  );
  res.json(colaboradores.map((c) => ({ ...c, ativo: Boolean(c.ativo) })));
});

router.post('/', async (req, res) => {
  const nome = nomeValido(req.body?.nome_completo);
  const cpf = cpfDoFormulario(req.body?.cpf);
  const ativo = flag(req.body?.ativo ?? '1');
  await validarCpfUnico(cpf);
  const r = await query('INSERT INTO usuarios (nome_completo, cpf, nivel_acesso, ativo) VALUES (?, ?, ?, ?)', [
    nome, cpf, await nivelDoColaborador(), ativo,
  ]);
  await registrarRh(req, 'cadastro', `Cadastrou ${nome} (CPF ${cpfFormatado(cpf)})${ativo ? '' : ' como inativo'}`);
  res.status(201).json({ id: r.insertId });
});

router.put('/:id', async (req, res) => {
  const atual = await buscar(idParam(req));
  const nome = nomeValido(req.body?.nome_completo);
  const cpf = cpfDoFormulario(req.body?.cpf);
  const ativo = flag(req.body?.ativo);
  await validarCpfUnico(cpf, atual.id);
  await query('UPDATE usuarios SET nome_completo = ?, cpf = ?, ativo = ? WHERE id = ?', [nome, cpf, ativo, atual.id]);

  const mudancas = [];
  if (nome !== atual.nome_completo) mudancas.push(`nome de "${atual.nome_completo}" para "${nome}"`);
  if (cpf !== atual.cpf) mudancas.push(`CPF de ${cpfFormatado(atual.cpf)} para ${cpfFormatado(cpf)}`);
  if (ativo !== Number(atual.ativo)) mudancas.push(ativo ? 'reativou o acesso' : 'bloqueou o acesso');
  if (mudancas.length) await registrarRh(req, 'edicao', `${nome}: ${mudancas.join('; ')}`);
  res.status(204).end();
});

router.patch('/:id/ativo', async (req, res) => {
  const atual = await buscar(idParam(req));
  const ativo = flag(req.body?.ativo);
  await query('UPDATE usuarios SET ativo = ? WHERE id = ?', [ativo, atual.id]);
  if (ativo !== Number(atual.ativo)) {
    await registrarRh(req, ativo ? 'ativacao' : 'bloqueio', `${ativo ? 'Liberou' : 'Bloqueou'} o acesso de ${atual.nome_completo}`);
  }
  res.status(204).end();
});

// Exclusão só para cadastro feito por engano (quem nunca entrou). Desligamento = desativar,
// assim o histórico de acessos da pessoa continua guardado.
router.delete('/:id', async (req, res) => {
  const atual = await buscar(idParam(req));
  if (await queryOne('SELECT 1 FROM login_log WHERE usuario_id = ? LIMIT 1', [atual.id])) {
    throw new HttpError(409, `${atual.nome_completo} já acessou o hub, então o cadastro não pode ser excluído. Desative o acesso.`);
  }
  await transacao(async (conn) => {
    await conn.query('UPDATE link_cliques SET usuario_id = NULL WHERE usuario_id = ?', [atual.id]);
    await conn.query('DELETE FROM usuarios WHERE id = ?', [atual.id]);
  });
  await registrarRh(req, 'exclusao', `Excluiu o cadastro de ${atual.nome_completo} (CPF ${cpfFormatado(atual.cpf)})`);
  res.status(204).end();
});

/**
 * Cadastro em lote (ex.: turma de admissão colada de uma planilha).
 * Recebe { linhas: [{ nome, cpf }] }; cadastra as válidas e devolve o motivo das que ficaram de fora.
 */
router.post('/importar', async (req, res) => {
  const linhas = Array.isArray(req.body?.linhas) ? req.body.linhas : [];
  if (!linhas.length) throw new HttpError(400, 'Nenhuma linha para importar.');
  if (linhas.length > MAX_IMPORTACAO) throw new HttpError(400, `Importe no máximo ${MAX_IMPORTACAO} pessoas por vez.`);

  const cpfs = linhas.map((l) => somenteDigitos(l?.cpf)).filter((c) => c.length === 11);
  const existentes = cpfs.length
    ? new Map((await query('SELECT cpf, nome_completo, ativo FROM usuarios WHERE cpf IN (?)', [cpfs])).map((u) => [u.cpf, u]))
    : new Map();

  const validos = [];
  const problemas = [];
  const vistos = new Set();
  linhas.forEach((linha, i) => {
    const nome = String(linha?.nome ?? '').replace(/\s+/g, ' ').trim();
    const cpf = somenteDigitos(linha?.cpf);
    const problema = (motivo) => problemas.push({ linha: i + 1, nome, cpf, motivo });
    if (!nome) return problema('Nome em branco.');
    if (nome.length > 150) return problema('Nome muito longo (máx. 150 caracteres).');
    if (!cpfValido(cpf)) return problema('CPF inválido.');
    if (vistos.has(cpf)) return problema('CPF repetido na lista.');
    vistos.add(cpf);
    const existente = existentes.get(cpf);
    if (existente) {
      return problema(`Já cadastrado como ${existente.nome_completo}${existente.ativo ? '' : ' (inativo — reative na lista)'}.`);
    }
    validos.push({ nome, cpf });
  });

  if (validos.length) {
    const nivel = await nivelDoColaborador();
    await transacao(async (conn) => {
      for (const v of validos) {
        await conn.query('INSERT INTO usuarios (nome_completo, cpf, nivel_acesso, ativo) VALUES (?, ?, ?, 1)', [v.nome, v.cpf, nivel]);
      }
    });
    const nomes = validos.slice(0, 15).map((v) => v.nome).join(', ');
    await registrarRh(req, 'importacao', `Cadastrou ${validos.length} pessoa(s) em lote: ${nomes}${validos.length > 15 ? '...' : ''}`);
  }
  res.json({ criados: validos.length, problemas });
});

export default router;
