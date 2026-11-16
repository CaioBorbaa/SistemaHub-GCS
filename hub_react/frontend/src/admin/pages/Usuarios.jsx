import { useState } from 'react';
import { ChevronLeft, ChevronRight, KeyRound, Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { api } from '../../lib/api';
import { cpfValido, formatarCpf } from '../../lib/cpf';
import { useAuth } from '../../context/AuthContext';
import { CabecalhoPagina, Cartao, EstadoCarregamento, Vazio } from '../ui/Pagina';
import Botao, { BotaoIcone } from '../ui/Botao';
import Modal from '../ui/Modal';
import { Campo, Selo, Toggle, classeInput } from '../ui/Campos';
import { useFeedback } from '../ui/Feedback';
import { useAcoesLista } from '../ui/useAcoesLista';
import { capitalizar } from '../../lib/texto';

const POR_PAGINA = 20;

function FormularioUsuario({ usuario, niveis, niveisFixos, niveisAdmin, niveisRh, senhaMinima, ehVoceMesmo, aoFechar, aoSalvar }) {
  const novo = !usuario.id;
  const { avisar } = useFeedback();
  const [form, setForm] = useState({
    nome_completo: usuario.nome_completo ?? '',
    cpf: formatarCpf(usuario.cpf ?? ''),
    nivel_acesso: usuario.nivel_acesso ?? niveis.find((n) => !niveisAdmin.includes(n) && !niveisRh.includes(n)) ?? '',
    ativo: usuario.ativo ?? true,
    senha: '',
  });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [salvando, setSalvando] = useState(false);
  const mudar = (campo, valor) => setForm((f) => ({ ...f, [campo]: valor }));

  const nivel = form.nivel_acesso.trim().toLowerCase();
  const virouAdmin = niveisAdmin.includes(nivel);
  const virouRh = niveisRh.includes(nivel);
  const comPainel = virouAdmin || virouRh;
  const precisaSenha = comPainel && !usuario.tem_senha;

  async function salvar(e) {
    e.preventDefault();
    const novosErros = {};
    if (!form.nome_completo.trim()) novosErros.nome_completo = 'Informe o nome.';
    if (!cpfValido(form.cpf)) novosErros.cpf = 'CPF inválido.';
    if (!form.nivel_acesso.trim()) novosErros.nivel_acesso = 'Informe o nível.';
    if (precisaSenha && !form.senha) novosErros.senha = virouRh ? 'O RH precisa de senha para entrar no painel do RH.' : 'Administradores precisam de senha para entrar no painel.';
    if (form.senha && form.senha.length < senhaMinima) novosErros.senha = `Mínimo de ${senhaMinima} caracteres.`;
    setErros(novosErros);
    if (Object.keys(novosErros).length) return;

    setSalvando(true);
    setErroGeral('');
    try {
      await api(novo ? '/admin/usuarios' : `/admin/usuarios/${usuario.id}`, { method: novo ? 'POST' : 'PUT', body: form });
      avisar(novo ? 'Usuário cadastrado.' : 'Usuário atualizado.');
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
      titulo={novo ? 'Novo usuário' : 'Editar usuário'}
      descricao="Colaboradores entram no hub só com o CPF."
      aoFechar={aoFechar}
      rodape={
        <>
          <Botao variante="secundario" onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" form="form-usuario" carregando={salvando}>{novo ? 'Cadastrar' : 'Salvar'}</Botao>
        </>
      }
    >
      <form id="form-usuario" onSubmit={salvar} className="space-y-5" noValidate>
        <Campo rotulo="Nome completo" erro={erros.nome_completo}>
          {(id) => <input id={id} className={classeInput} value={form.nome_completo} maxLength={150} onChange={(e) => mudar('nome_completo', e.target.value)} aria-invalid={Boolean(erros.nome_completo)} />}
        </Campo>
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo rotulo="CPF" erro={erros.cpf}>
            {(id) => <input id={id} inputMode="numeric" placeholder="000.000.000-00" className={classeInput} value={form.cpf} onChange={(e) => mudar('cpf', formatarCpf(e.target.value))} aria-invalid={Boolean(erros.cpf)} />}
          </Campo>
          <Campo rotulo="Nível de acesso" erro={erros.nivel_acesso} dica={virouAdmin ? 'Pode acessar o painel administrativo.' : virouRh ? 'Pode acessar o painel do RH (/rh).' : undefined}>
            {(id) => niveisFixos ? (
              // O banco só aceita estes valores (coluna ENUM)
              <select
                id={id}
                className={classeInput}
                value={form.nivel_acesso}
                disabled={ehVoceMesmo}
                onChange={(e) => mudar('nivel_acesso', e.target.value)}
                aria-invalid={Boolean(erros.nivel_acesso)}
              >
                {niveis.map((n) => <option key={n} value={n}>{capitalizar(n)}</option>)}
              </select>
            ) : (
              <>
                <input
                  id={id}
                  list="niveis-acesso"
                  className={classeInput}
                  value={form.nivel_acesso}
                  disabled={ehVoceMesmo}
                  onChange={(e) => mudar('nivel_acesso', e.target.value)}
                  aria-invalid={Boolean(erros.nivel_acesso)}
                />
                <datalist id="niveis-acesso">
                  {niveis.map((n) => <option key={n} value={n} />)}
                </datalist>
              </>
            )}
          </Campo>
        </div>

        {(comPainel || usuario.tem_senha) && (
          <Campo
            rotulo={usuario.tem_senha ? 'Nova senha do painel' : 'Senha do painel'}
            opcional={!precisaSenha}
            erro={erros.senha}
            dica={usuario.tem_senha ? 'Deixe em branco para manter a senha atual.' : `Mínimo de ${senhaMinima} caracteres.`}
          >
            {(id) => <input id={id} type="password" autoComplete="new-password" className={classeInput} value={form.senha} onChange={(e) => mudar('senha', e.target.value)} aria-invalid={Boolean(erros.senha)} />}
          </Campo>
        )}

        <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-800">Ativo</p>
            <p className="text-xs text-gray-500">{ehVoceMesmo ? 'Você não pode desativar o seu próprio usuário.' : 'Usuários inativos não conseguem entrar.'}</p>
          </div>
          <Toggle ligado={form.ativo} aoMudar={(v) => mudar('ativo', v)} rotulo="Ativo" disabled={ehVoceMesmo} />
        </div>

        {erroGeral && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">{erroGeral}</p>}
      </form>
    </Modal>
  );
}

export default function Usuarios() {
  const { usuario: eu } = useAuth();
  const { dados, erro, carregando, recarregar, setDados } = useApi('/admin/usuarios');
  const [editando, setEditando] = useState(null);
  const [busca, setBusca] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [pagina, setPagina] = useState(1);

  const lista = dados?.usuarios ?? [];
  const acoes = useAcoesLista({
    base: '/admin/usuarios',
    lista,
    setLista: (usuarios) => setDados((d) => ({ ...d, usuarios })),
    recarregar,
  });

  const termo = busca.trim().toLowerCase();
  const termoCpf = termo.replace(/\D/g, '');
  const filtrados = lista.filter(
    (u) =>
      (!termo || u.nome_completo.toLowerCase().includes(termo) || (termoCpf && u.cpf.includes(termoCpf))) &&
      (!filtroNivel || u.nivel_acesso?.toLowerCase() === filtroNivel) &&
      (!filtroStatus || String(u.ativo) === filtroStatus),
  );
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);

  const filtrar = (setter) => (e) => {
    setter(e.target.value);
    setPagina(1);
  };
  const ehAdmin = (u) => dados?.niveisAdmin.includes(u.nivel_acesso?.toLowerCase());
  const ehRh = (u) => (dados?.niveisRh ?? []).includes(u.nivel_acesso?.toLowerCase());
  const semSenha = (u) => (ehAdmin(u) || ehRh(u)) && !u.tem_senha;

  return (
    <>
      <CabecalhoPagina
        titulo="Usuários"
        descricao="Quem pode entrar no hub. Administradores acessam este painel e o RH acessa o painel do RH (/rh), ambos com senha."
        acoes={<Botao icone={Plus} onClick={() => setEditando({})}>Novo usuário</Botao>}
      />
      <EstadoCarregamento carregando={carregando} erro={erro} recarregar={recarregar}>
        <Cartao>
          <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" aria-hidden />
              <input type="search" placeholder="Buscar por nome ou CPF" aria-label="Buscar usuários" value={busca} onChange={filtrar(setBusca)} className={`${classeInput} pl-9`} />
            </div>
            <select aria-label="Filtrar por nível" value={filtroNivel} onChange={filtrar(setFiltroNivel)} className={`${classeInput} sm:w-44`}>
              <option value="">Todos os níveis</option>
              {(dados?.niveis ?? []).map((n) => <option key={n} value={n}>{capitalizar(n)}</option>)}
            </select>
            <select aria-label="Filtrar por status" value={filtroStatus} onChange={filtrar(setFiltroStatus)} className={`${classeInput} sm:w-36`}>
              <option value="">Todos</option>
              <option value="true">Ativos</option>
              <option value="false">Inativos</option>
            </select>
          </div>

          {lista.length === 0 ? (
            <Vazio icone={Users} titulo="Nenhum usuário" acao={<Botao icone={Plus} onClick={() => setEditando({})}>Novo usuário</Botao>} />
          ) : filtrados.length === 0 ? (
            <Vazio icone={Search} titulo="Nenhum usuário encontrado" texto="Ajuste a busca ou os filtros." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500">
                  <tr>
                    <th scope="col" className="px-4 py-2.5">Nome</th>
                    <th scope="col" className="hidden px-4 py-2.5 sm:table-cell">CPF</th>
                    <th scope="col" className="hidden px-4 py-2.5 md:table-cell">Nível</th>
                    <th scope="col" className="px-4 py-2.5">Ativo</th>
                    <th scope="col" className="px-4 py-2.5"><span className="sr-only">Ações</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visiveis.map((u) => {
                    const voce = u.id === eu.id;
                    return (
                      <tr key={u.id} className={u.ativo ? '' : 'text-gray-400'}>
                        <td className="max-w-56 px-4 py-3">
                          <p className={`truncate font-medium ${u.ativo ? 'text-gray-900' : ''}`}>
                            {u.nome_completo}
                            {voce && <span className="ml-2 text-xs font-normal text-gray-400">(você)</span>}
                          </p>
                          <p className="text-xs text-gray-500 tabular-nums sm:hidden">{formatarCpf(u.cpf)}</p>
                          <p className="mt-0.5 text-xs text-gray-500 capitalize md:hidden">{u.nivel_acesso}{semSenha(u) && <span className="text-red-600 normal-case"> · sem senha</span>}</p>
                        </td>
                        <td className="hidden px-4 py-3 whitespace-nowrap text-gray-600 tabular-nums sm:table-cell">{formatarCpf(u.cpf)}</td>
                        <td className="hidden px-4 py-3 whitespace-nowrap md:table-cell">
                          <Selo cor={ehAdmin(u) ? 'laranja' : ehRh(u) ? 'azul' : 'cinza'}>
                            {ehAdmin(u) && <KeyRound className="size-3" aria-hidden />}
                            {u.nivel_acesso}
                          </Selo>
                          {semSenha(u) && <span className="ml-2 text-xs text-red-600">sem senha</span>}
                        </td>
                        <td className="px-4 py-3">
                          <Toggle ligado={u.ativo} disabled={voce} aoMudar={(v) => acoes.alternarAtivo(u, v)} rotulo={`${u.ativo ? 'Desativar' : 'Ativar'} ${u.nome_completo}`} />
                        </td>
                        <td className="px-2 py-3 text-right whitespace-nowrap">
                          <BotaoIcone icone={Pencil} rotulo={`Editar ${u.nome_completo}`} onClick={() => setEditando(u)} />
                          <BotaoIcone
                            icone={Trash2}
                            perigo
                            disabled={voce}
                            className="disabled:invisible"
                            rotulo={`Excluir ${u.nome_completo}`}
                            onClick={() => acoes.excluir(u, {
                              titulo: 'Excluir usuário?',
                              mensagem: `${u.nome_completo} será excluído permanentemente. Para apenas bloquear o acesso (ex.: desligamento), prefira desativar.`,
                            })}
                          />
                        </td>
                      </tr>
                    );
                  })}
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

      {editando && dados && (
        <FormularioUsuario
          usuario={editando}
          niveis={dados.niveis}
          niveisFixos={dados.niveisFixos}
          niveisAdmin={dados.niveisAdmin}
          niveisRh={dados.niveisRh ?? []}
          senhaMinima={dados.senhaMinima}
          ehVoceMesmo={editando.id === eu.id}
          aoFechar={() => setEditando(null)}
          aoSalvar={() => {
            setEditando(null);
            recarregar();
          }}
        />
      )}
    </>
  );
}
