import { useState } from 'react';
import { ExternalLink, LayoutGrid, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { api, paraFormData } from '../../lib/api';
import { CabecalhoPagina, Cartao, EstadoCarregamento, Vazio } from '../ui/Pagina';
import Botao, { BotaoIcone } from '../ui/Botao';
import Modal from '../ui/Modal';
import EntradaImagem from '../ui/EntradaImagem';
import ListaOrdenavel from '../ui/ListaOrdenavel';
import { Campo, Selo, Toggle, classeInput } from '../ui/Campos';
import { useFeedback } from '../ui/Feedback';
import { useAcoesLista } from '../ui/useAcoesLista';
import { capitalizar, plural } from '../../lib/texto';

// a API já devolve a URL com a versão da imagem (muda sozinha quando o ícone é trocado)
const imagemDoLink = (link) => link.imagem ?? null;

function Icone({ src, nome, tamanho = 'size-12' }) {
  return src ? (
    <img src={src} alt="" className={`${tamanho} shrink-0 rounded-[20%] object-cover`} />
  ) : (
    <div className={`${tamanho} flex shrink-0 items-center justify-center rounded-[20%] bg-gray-200 text-xs font-bold text-gray-500`}>
      {nome.slice(0, 2).toUpperCase()}
    </div>
  );
}

function FormularioSistema({ sistema, categorias, aoFechar, aoSalvar }) {
  const novo = !sistema.id;
  const { avisar } = useFeedback();
  const [form, setForm] = useState({
    nome: sistema.nome ?? '',
    url: sistema.url ?? 'https://',
    ativo: sistema.ativo ?? true,
    categorias: sistema.categorias ?? [],
  });
  const [imagem, setImagem] = useState(null);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const mudar = (campo) => (valor) => setForm((f) => ({ ...f, [campo]: valor }));

  function alternarCategoria(id) {
    setForm((f) => ({
      ...f,
      categorias: f.categorias.includes(id) ? f.categorias.filter((c) => c !== id) : [...f.categorias, id],
    }));
  }

  async function salvar(e) {
    e.preventDefault();
    if (form.categorias.length === 0) return setErro('Selecione ao menos uma categoria.');
    if (novo && !imagem) return setErro('Escolha a imagem do ícone.');
    setErro('');
    setSalvando(true);
    try {
      await api(novo ? '/admin/links' : `/admin/links/${sistema.id}`, {
        method: novo ? 'POST' : 'PUT',
        form: paraFormData({ ...form, imagem }),
      });
      avisar(novo ? 'Sistema cadastrado.' : 'Alterações salvas.');
      aoSalvar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      aberto
      titulo={novo ? 'Novo sistema' : 'Editar sistema'}
      descricao="Os sistemas aparecem como ícones na home, dentro das categorias marcadas."
      aoFechar={aoFechar}
      largura="max-w-2xl"
      rodape={
        <>
          <Botao variante="secundario" onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" form="form-sistema" carregando={salvando}>{novo ? 'Cadastrar' : 'Salvar'}</Botao>
        </>
      }
    >
      <form id="form-sistema" onSubmit={salvar} className="space-y-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo rotulo="Nome">
            {(id) => <input id={id} className={classeInput} value={form.nome} maxLength={100} onChange={(e) => mudar('nome')(e.target.value)} required />}
          </Campo>
          <Campo rotulo="Link" dica="Endereço completo que abre em nova aba.">
            {(id) => <input id={id} type="url" className={classeInput} value={form.url} onChange={(e) => mudar('url')(e.target.value)} required />}
          </Campo>
        </div>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-gray-700">Categorias</legend>
          <div className="flex flex-wrap gap-2">
            {categorias.map((c) => {
              const marcada = form.categorias.includes(c.id);
              return (
                <label
                  key={c.id}
                  className={`cursor-pointer rounded-full px-3 py-1.5 text-sm capitalize ring-1 transition-colors ring-inset has-focus-visible:ring-2 has-focus-visible:ring-brand ${
                    marcada ? 'bg-brand-soft font-medium text-brand-darker ring-brand/40' : 'bg-white text-gray-600 ring-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input type="checkbox" className="sr-only" checked={marcada} onChange={() => alternarCategoria(c.id)} />
                  {c.nome}
                </label>
              );
            })}
          </div>
          <p className="mt-1.5 text-xs text-gray-500">Sistemas em "geral" aparecem em todas as abas.</p>
        </fieldset>

        <Campo rotulo="Ícone">
          {(id) => (
            <EntradaImagem
              id={id}
              arquivo={imagem}
              aoMudar={setImagem}
              atual={sistema.id ? imagemDoLink(sistema) : null}
              dica="Imagem quadrada (ex.: 512×512). Os cantos são arredondados automaticamente."
              renderPreview={(url) => (
                <div className="flex flex-col items-center">
                  <img src={url} alt="" className="size-24 rounded-[20%] object-cover shadow-sm" />
                  <span className="mt-2 max-w-24 truncate text-xs font-bold text-gray-700">{form.nome || 'Prévia'}</span>
                </div>
              )}
            />
          )}
        </Campo>

        <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-800">Publicado</p>
            <p className="text-xs text-gray-500">Sistemas inativos ficam ocultos na home.</p>
          </div>
          <Toggle ligado={form.ativo} aoMudar={mudar('ativo')} rotulo="Publicado" />
        </div>

        {erro && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">{erro}</p>}
      </form>
    </Modal>
  );
}

export default function Sistemas() {
  const links = useApi('/admin/links');
  const categorias = useApi('/admin/categorias');
  const [editando, setEditando] = useState(null);
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  const lista = links.dados ?? [];
  const acoes = useAcoesLista({ base: '/admin/links', lista, setLista: links.setDados, recarregar: links.recarregar });
  const nomesCategorias = new Map((categorias.dados ?? []).map((c) => [c.id, c.nome]));

  const termo = busca.trim().toLowerCase();
  const filtrando = Boolean(termo || filtroCategoria || filtroStatus);
  const visiveis = lista.filter(
    (l) =>
      (!termo || l.nome.toLowerCase().includes(termo) || l.url.toLowerCase().includes(termo)) &&
      (!filtroCategoria || l.categorias.includes(Number(filtroCategoria))) &&
      (!filtroStatus || String(l.ativo) === filtroStatus),
  );

  async function aoSalvar() {
    setEditando(null);
    await links.recarregar();
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Sistemas"
        descricao="Ícones exibidos na home. Arraste pela alça para mudar a ordem."
        acoes={<Botao icone={Plus} onClick={() => setEditando({})} disabled={!categorias.dados}>Novo sistema</Botao>}
      />

      <EstadoCarregamento carregando={links.carregando || categorias.carregando} erro={links.erro || categorias.erro} recarregar={() => { links.recarregar(); categorias.recarregar(); }}>
        <Cartao>
          <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" aria-hidden />
              <input type="search" placeholder="Buscar por nome ou link" aria-label="Buscar sistemas" value={busca} onChange={(e) => setBusca(e.target.value)} className={`${classeInput} pl-9`} />
            </div>
            <select aria-label="Filtrar por categoria" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className={`${classeInput} sm:w-48`}>
              <option value="">Todas as categorias</option>
              {(categorias.dados ?? []).map((c) => <option key={c.id} value={c.id}>{capitalizar(c.nome)}</option>)}
            </select>
            <select aria-label="Filtrar por status" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className={`${classeInput} sm:w-36`}>
              <option value="">Todos</option>
              <option value="true">Ativos</option>
              <option value="false">Inativos</option>
            </select>
          </div>

          {filtrando && visiveis.length > 0 && (
            <p className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-500">
              Limpe os filtros para reordenar arrastando.
            </p>
          )}

          {lista.length === 0 ? (
            <Vazio icone={LayoutGrid} titulo="Nenhum sistema cadastrado" texto="Cadastre o primeiro sistema para ele aparecer na home." acao={<Botao icone={Plus} onClick={() => setEditando({})}>Novo sistema</Botao>} />
          ) : visiveis.length === 0 ? (
            <Vazio icone={Search} titulo="Nenhum sistema encontrado" texto="Ajuste a busca ou os filtros." />
          ) : (
            <ListaOrdenavel
              itens={visiveis}
              desabilitado={filtrando}
              aoReordenar={acoes.reordenar}
              renderItem={(link) => (
                <>
                  <Icone src={imagemDoLink(link)} nome={link.nome} />
                  <div className={`min-w-0 flex-1 ${link.ativo ? '' : 'opacity-60'}`}>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="truncate font-medium text-gray-900">{link.nome}</p>
                      {link.categorias.map((id) => <Selo key={id} cor={nomesCategorias.get(id)?.toLowerCase() === 'geral' ? 'laranja' : 'cinza'}>{nomesCategorias.get(id) ?? '?'}</Selo>)}
                    </div>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="mt-0.5 inline-flex max-w-full items-center gap-1 truncate text-xs text-gray-500 hover:text-brand-dark">
                      <span className="truncate">{link.url}</span>
                      <ExternalLink className="size-3 shrink-0" aria-hidden />
                    </a>
                  </div>
                  <span className="hidden w-24 text-right text-xs text-gray-500 tabular-nums md:block">{plural(link.cliques, 'clique')}</span>
                  <Toggle ligado={link.ativo} aoMudar={(v) => acoes.alternarAtivo(link, v)} rotulo={`${link.ativo ? 'Desativar' : 'Ativar'} ${link.nome}`} />
                  <div className="flex">
                    <BotaoIcone icone={Pencil} rotulo={`Editar ${link.nome}`} onClick={() => setEditando(link)} />
                    <BotaoIcone
                      icone={Trash2}
                      perigo
                      rotulo={`Excluir ${link.nome}`}
                      onClick={() => acoes.excluir(link, {
                        titulo: 'Excluir sistema?',
                        mensagem: `"${link.nome}" será removido da home e o histórico de cliques dele será apagado. Para apenas ocultar, use o botão de ativo.`,
                      })}
                    />
                  </div>
                </>
              )}
            />
          )}
        </Cartao>
      </EstadoCarregamento>

      {editando && categorias.dados && (
        <FormularioSistema sistema={editando} categorias={categorias.dados} aoFechar={() => setEditando(null)} aoSalvar={aoSalvar} />
      )}
    </>
  );
}
