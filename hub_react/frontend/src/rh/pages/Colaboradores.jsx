import { useState } from 'react';
import { useSearchParams } from 'react-router';
import {
  ChevronLeft, ChevronRight, Download, FileSpreadsheet, Pencil, Plus, Search, Trash2, Users,
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { api } from '../../lib/api';
import { cpfValido, formatarCpf } from '../../lib/cpf';
import { CabecalhoPagina, Cartao, EstadoCarregamento, Vazio } from '../../admin/ui/Pagina';
import Botao, { BotaoIcone } from '../../admin/ui/Botao';
import Modal from '../../admin/ui/Modal';
import { Campo, Selo, Toggle, classeInput } from '../../admin/ui/Campos';
import { useFeedback } from '../../admin/ui/Feedback';
import { useAcoesLista } from '../../admin/ui/useAcoesLista';
import { ultimoAcesso } from '../datas';
import { ImportarColaboradores } from './ImportarColaboradores';

const POR_PAGINA = 20;
const BASE = '/rh/colaboradores';


function FormularioColaborador({ colaborador, aoFechar, aoSalvar }) {
  const novo = !colaborador.id;
  const { avisar } = useFeedback();
  const [form, setForm] = useState({
    nome_completo: colaborador.nome_completo ?? '',
    cpf: formatarCpf(colaborador.cpf ?? ''),
    ativo: colaborador.ativo ?? true,
  });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [salvando, setSalvando] = useState(false);
  const mudar = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  async function salvar(e) {
    e.preventDefault();
    const novosErros = {};
    if (!form.nome_completo.trim()) novosErros.nome_completo = 'Informe o nome.';
    if (!cpfValido(form.cpf)) novosErros.cpf = 'CPF inválido. Confira os números.';
    setErros(novosErros);
    if (Object.keys(novosErros).length) return;

    setSalvando(true);
    setErroGeral('');
    try {
      await api(novo ? BASE : `${BASE}/${colaborador.id}`, { method: novo ? 'POST' : 'PUT', body: form });
      avisar(novo ? 'Colaborador cadastrado. Já pode entrar no hub com o CPF.' : 'Cadastro atualizado.');
      aoSalvar();
    } catch (e) {
      setErroGeral(e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      aberto
      titulo={novo ? 'Novo colaborador' : 'Editar colaborador'}
      descricao="O colaborador entra no hub só com o CPF."
      aoFechar={aoFechar}
      rodape={
        <>
          <Botao variante="secundario" onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" form="form-colaborador" carregando={salvando}>{novo ? 'Cadastrar' : 'Salvar'}</Botao>
        </>
      }
    >
      <form id="form-colaborador" onSubmit={salvar} className="space-y-5" noValidate>
        <Campo rotulo="Nome completo" erro={erros.nome_completo}>
          {(id) => <input id={id} className={classeInput} value={form.nome_completo} maxLength={150} autoFocus onChange={(e) => mudar('nome_completo', e.target.value)} aria-invalid={Boolean(erros.nome_completo)} />}
        </Campo>
        <Campo rotulo="CPF" erro={erros.cpf}>
          {(id) => <input id={id} inputMode="numeric" placeholder="000.000.000-00" className={classeInput} value={form.cpf} onChange={(e) => mudar('cpf', formatarCpf(e.target.value))} aria-invalid={Boolean(erros.cpf)} />}
        </Campo>
        <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-800">Acesso liberado</p>
            <p className="text-xs text-gray-500">Desligado = o CPF não consegue entrar no hub (ex.: desligamento, afastamento).</p>
          </div>
          <Toggle ligado={form.ativo} aoMudar={(v) => mudar('ativo', v)} rotulo="Acesso liberado" />
        </div>
        {erroGeral && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">{erroGeral}</p>}
      </form>
    </Modal>
  );
}

/** Planilha (CSV com ";" que o Excel em português abre direto) da lista filtrada. */
function exportar(lista) {
  const celula = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const linhas = [
    ['Nome', 'CPF', 'Acesso', 'Último acesso'],
    ...lista.map((c) => [c.nome_completo, formatarCpf(c.cpf), c.ativo ? 'Liberado' : 'Bloqueado', ultimoAcesso(c.ultimo_acesso) ?? 'Nunca entrou']),
  ];
  const csv = '﻿' + linhas.map((l) => l.map(celula).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: `colaboradores-hub-${new Date().toISOString().slice(0, 10)}.csv` });
  link.click();
  URL.revokeObjectURL(url);
}

const FILTROS = {
  '': { rotulo: 'Todos', teste: () => true },
  ativos: { rotulo: 'Com acesso', teste: (c) => c.ativo },
  bloqueados: { rotulo: 'Bloqueados', teste: (c) => !c.ativo },
  nunca: { rotulo: 'Nunca entraram', teste: (c) => c.ativo && !c.ultimo_acesso },
};

export default function Colaboradores() {
  const { dados, erro, carregando, recarregar, setDados } = useApi(BASE);
  const [parametros, setParametros] = useSearchParams();
  const [editando, setEditando] = useState(null);
  const [importando, setImportando] = useState(parametros.get('importar') === '1');
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const filtro = FILTROS[parametros.get('filtro')] ? parametros.get('filtro') : '';

  const lista = dados ?? [];
  const acoes = useAcoesLista({ base: BASE, lista, setLista: setDados, recarregar });

  const termo = busca.trim().toLowerCase();
  const termoCpf = termo.replace(/\D/g, '');
  const filtrados = lista.filter(
    (c) => FILTROS[filtro].teste(c) && (!termo || c.nome_completo.toLowerCase().includes(termo) || (termoCpf && c.cpf.includes(termoCpf))),
  );
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);

  function mudarFiltro(valor) {
    setParametros(valor ? { filtro: valor } : {}, { replace: true });
    setPagina(1);
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Colaboradores"
        descricao="CPFs que podem entrar no hub. Em um desligamento, bloqueie o acesso: o histórico da pessoa continua guardado."
        acoes={
          <>
            <Botao variante="secundario" icone={FileSpreadsheet} onClick={() => setImportando(true)}>Cadastrar vários</Botao>
            <Botao icone={Plus} onClick={() => setEditando({})}>Novo colaborador</Botao>
          </>
        }
      />
      <EstadoCarregamento carregando={carregando} erro={erro} recarregar={recarregar}>
        <Cartao>
          <div className="flex flex-col gap-3 border-b border-gray-100 p-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" aria-hidden />
              <input
                type="search"
                placeholder="Buscar por nome ou CPF"
                aria-label="Buscar colaboradores"
                value={busca}
                onChange={(e) => { setBusca(e.target.value); setPagina(1); }}
                className={`${classeInput} pl-9`}
              />
            </div>
            <div className="flex items-start gap-2">
            <div className="flex flex-1 flex-wrap gap-1.5" role="group" aria-label="Filtrar">
              {Object.entries(FILTROS).map(([valor, { rotulo, teste }]) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => mudarFiltro(valor)}
                  aria-pressed={filtro === valor}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-colors ${
                    filtro === valor ? 'bg-brand-soft text-brand-darker ring-brand/40' : 'text-gray-600 ring-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {rotulo} <span className="tabular-nums opacity-70">{lista.filter(teste).length}</span>
                </button>
              ))}
            </div>
            <BotaoIcone icone={Download} rotulo="Baixar lista em planilha" disabled={!filtrados.length} onClick={() => exportar(filtrados)} className="shrink-0 disabled:opacity-30" />
            </div>
          </div>

          {lista.length === 0 ? (
            <Vazio icone={Users} titulo="Nenhum colaborador cadastrado" acao={<Botao icone={Plus} onClick={() => setEditando({})}>Novo colaborador</Botao>} />
          ) : filtrados.length === 0 ? (
            <Vazio icone={Search} titulo="Ninguém encontrado" texto="Ajuste a busca ou o filtro." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500">
                  <tr>
                    <th scope="col" className="px-4 py-2.5">Nome</th>
                    <th scope="col" className="hidden px-4 py-2.5 sm:table-cell">CPF</th>
                    <th scope="col" className="hidden px-4 py-2.5 md:table-cell">Último acesso</th>
                    <th scope="col" className="px-4 py-2.5">Acesso</th>
                    <th scope="col" className="px-4 py-2.5"><span className="sr-only">Ações</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visiveis.map((c) => (
                    <tr key={c.id} className={c.ativo ? '' : 'text-gray-400'}>
                      <td className="max-w-64 px-4 py-3">
                        <p className={`truncate font-medium ${c.ativo ? 'text-gray-900' : ''}`}>{c.nome_completo}</p>
                        <p className="text-xs text-gray-500 tabular-nums sm:hidden">{formatarCpf(c.cpf)}</p>
                      </td>
                      <td className="hidden px-4 py-3 whitespace-nowrap text-gray-600 tabular-nums sm:table-cell">{formatarCpf(c.cpf)}</td>
                      <td className="hidden px-4 py-3 whitespace-nowrap tabular-nums md:table-cell">
                        {c.ultimo_acesso ? <span className="text-gray-600">{ultimoAcesso(c.ultimo_acesso)}</span> : <Selo cor="azul"><span className="normal-case">nunca entrou</span></Selo>}
                      </td>
                      <td className="px-4 py-3">
                        <Toggle ligado={c.ativo} aoMudar={(v) => acoes.alternarAtivo(c, v)} rotulo={`${c.ativo ? 'Bloquear' : 'Liberar'} acesso de ${c.nome_completo}`} />
                      </td>
                      <td className="px-2 py-3 text-right whitespace-nowrap">
                        <BotaoIcone icone={Pencil} rotulo={`Editar ${c.nome_completo}`} onClick={() => setEditando(c)} />
                        {/* só cadastro feito por engano (quem nunca entrou) pode ser excluído */}
                        <BotaoIcone
                          icone={Trash2}
                          perigo
                          disabled={Boolean(c.ultimo_acesso)}
                          className="disabled:invisible"
                          rotulo={`Excluir ${c.nome_completo}`}
                          onClick={() => acoes.excluir(c, {
                            titulo: 'Excluir cadastro?',
                            mensagem: `${c.nome_completo} nunca entrou no hub, então o cadastro pode ser apagado (ex.: CPF digitado errado). Para desligamentos, bloqueie o acesso.`,
                          })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filtrados.length > POR_PAGINA && (
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm text-gray-600">
              <span className="tabular-nums">
                {(paginaAtual - 1) * POR_PAGINA + 1}–{Math.min(paginaAtual * POR_PAGINA, filtrados.length)} de {filtrados.length}
              </span>
              <div className="flex gap-1">
                <BotaoIcone icone={ChevronLeft} rotulo="Página anterior" disabled={paginaAtual === 1} onClick={() => setPagina(paginaAtual - 1)} className="disabled:opacity-30" />
                <BotaoIcone icone={ChevronRight} rotulo="Próxima página" disabled={paginaAtual === totalPaginas} onClick={() => setPagina(paginaAtual + 1)} className="disabled:opacity-30" />
              </div>
            </div>
          )}
        </Cartao>
      </EstadoCarregamento>

      {editando && (
        <FormularioColaborador
          colaborador={editando}
          aoFechar={() => setEditando(null)}
          aoSalvar={() => {
            setEditando(null);
            recarregar();
          }}
        />
      )}
      {importando && (
        <ImportarColaboradores
          aoFechar={() => {
            setImportando(false);
            if (parametros.has('importar')) setParametros({}, { replace: true });
          }}
          aoImportar={recarregar}
        />
      )}
    </>
  );
}
