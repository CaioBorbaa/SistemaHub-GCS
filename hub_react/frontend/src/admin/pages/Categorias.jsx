import { useState } from 'react';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { api } from '../../lib/api';
import { CabecalhoPagina, Cartao, EstadoCarregamento, Vazio } from '../ui/Pagina';
import Botao, { BotaoIcone } from '../ui/Botao';
import Modal from '../ui/Modal';
import ListaOrdenavel from '../ui/ListaOrdenavel';
import { Campo, Selo, classeInput } from '../ui/Campos';
import { useFeedback } from '../ui/Feedback';
import { useAcoesLista } from '../ui/useAcoesLista';

function FormularioCategoria({ categoria, aoFechar, aoSalvar }) {
  const novo = !categoria.id;
  const { avisar } = useFeedback();
  const [nome, setNome] = useState(categoria.nome ?? '');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    setErro('');
    try {
      await api(novo ? '/admin/categorias' : `/admin/categorias/${categoria.id}`, { method: novo ? 'POST' : 'PUT', body: { nome } });
      avisar(novo ? 'Categoria criada.' : 'Categoria renomeada.');
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
      titulo={novo ? 'Nova categoria' : 'Renomear categoria'}
      aoFechar={aoFechar}
      largura="max-w-md"
      rodape={
        <>
          <Botao variante="secundario" onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" form="form-categoria" carregando={salvando}>{novo ? 'Criar' : 'Salvar'}</Botao>
        </>
      }
    >
      <form id="form-categoria" onSubmit={salvar} noValidate>
        <Campo rotulo="Nome" dica="Vira um botão de filtro na home (ex.: comercial, logística)." erro={erro}>
          {(id) => <input id={id} className={classeInput} value={nome} maxLength={60} onChange={(e) => setNome(e.target.value)} aria-invalid={Boolean(erro)} />}
        </Campo>
      </form>
    </Modal>
  );
}

export default function Categorias() {
  const { dados, erro, carregando, recarregar, setDados } = useApi('/admin/categorias');
  const [editando, setEditando] = useState(null);
  const lista = dados ?? [];
  const acoes = useAcoesLista({ base: '/admin/categorias', lista, setLista: setDados, recarregar });

  return (
    <>
      <CabecalhoPagina
        titulo="Categorias"
        descricao='Cada categoria vira um botão na home, na ordem abaixo. A categoria "geral" é fixa: seus sistemas aparecem em todas as abas.'
        acoes={<Botao icone={Plus} onClick={() => setEditando({})}>Nova categoria</Botao>}
      />
      <EstadoCarregamento carregando={carregando} erro={erro} recarregar={recarregar}>
        <Cartao>
          {lista.length === 0 ? (
            <Vazio icone={Tags} titulo="Nenhuma categoria" texto='Crie a categoria "geral" e as demais áreas da empresa.' />
          ) : (
            <ListaOrdenavel
              itens={lista}
              aoReordenar={acoes.reordenar}
              renderItem={(c) => (
                <>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-gray-900 capitalize">{c.nome}</p>
                      {c.geral && <Selo cor="laranja">fixa</Selo>}
                    </div>
                    <p className="text-xs text-gray-500">
                      {c.total_links} {c.total_links === 1 ? 'sistema' : 'sistemas'}
                      {c.total_links === 0 && !c.geral && ' · não aparece na home enquanto estiver vazia'}
                    </p>
                  </div>
                  <div className="flex">
                    <BotaoIcone icone={Pencil} rotulo={`Renomear ${c.nome}`} onClick={() => setEditando(c)} disabled={c.geral} className="disabled:invisible" />
                    <BotaoIcone
                      icone={Trash2}
                      perigo
                      rotulo={`Excluir ${c.nome}`}
                      disabled={c.geral}
                      className="disabled:invisible"
                      onClick={() => acoes.excluir(c, {
                        titulo: 'Excluir categoria?',
                        mensagem: c.total_links
                          ? `"${c.nome}" será excluída e ${c.total_links} sistema(s) deixarão de aparecer nessa aba. Os sistemas em si não são apagados.`
                          : `"${c.nome}" será excluída.`,
                      })}
                    />
                  </div>
                </>
              )}
            />
          )}
        </Cartao>
      </EstadoCarregamento>

      {editando && (
        <FormularioCategoria
          categoria={editando}
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
