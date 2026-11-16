import { useState } from 'react';
import { Megaphone, Pencil, Plus, Trash2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { api, paraFormData } from '../../lib/api';
import { CabecalhoPagina, Cartao, EstadoCarregamento, Vazio } from '../ui/Pagina';
import Botao, { BotaoIcone } from '../ui/Botao';
import Modal from '../ui/Modal';
import EntradaImagem from '../ui/EntradaImagem';
import { Campo, Selo, Toggle, classeInput } from '../ui/Campos';
import { useFeedback } from '../ui/Feedback';
import { useAcoesLista } from '../ui/useAcoesLista';

const data = (iso) => new Date(iso.replace(' ', 'T')).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

function FormularioAviso({ base, aviso, aoFechar, aoSalvar }) {
  const novo = !aviso.id;
  const { avisar } = useFeedback();
  const [titulo, setTitulo] = useState(aviso.titulo ?? '');
  const [link, setLink] = useState(aviso.link_url ?? '');
  const [ativo, setAtivo] = useState(aviso.ativo ?? true);
  const [imagem, setImagem] = useState(null);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar(e) {
    e.preventDefault();
    if (novo && !imagem) return setErro('Escolha a imagem do aviso.');
    setSalvando(true);
    setErro('');
    try {
      await api(novo ? base : `${base}/${aviso.id}`, {
        method: novo ? 'POST' : 'PUT',
        form: paraFormData({ titulo, link_url: link, ativo, imagem }),
      });
      avisar(novo ? 'Aviso publicado.' : 'Aviso atualizado.');
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
      titulo={novo ? 'Novo aviso' : 'Editar aviso'}
      descricao="Popup exibido uma vez por sessão quando o colaborador abre o hub."
      aoFechar={aoFechar}
      largura="max-w-2xl"
      rodape={
        <>
          <Botao variante="secundario" onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" form="form-aviso" carregando={salvando}>{novo ? 'Publicar' : 'Salvar'}</Botao>
        </>
      }
    >
      <form id="form-aviso" onSubmit={salvar} className="space-y-5" noValidate>
        <Campo rotulo="Título">
          {(id) => <input id={id} className={classeInput} value={titulo} maxLength={150} onChange={(e) => setTitulo(e.target.value)} />}
        </Campo>
        <Campo rotulo="Imagem">
          {(id) => <EntradaImagem id={id} arquivo={imagem} aoMudar={setImagem} atual={aviso.imagem} renderPreview={(url) => <img src={url} alt="" className="max-h-40 rounded-lg object-contain" />} />}
        </Campo>
        <Campo rotulo="Link ao clicar na imagem" opcional>
          {(id) => <input id={id} type="url" placeholder="https://" className={classeInput} value={link} onChange={(e) => setLink(e.target.value)} />}
        </Campo>
        <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
          <p className="text-sm font-medium text-gray-800">Ativo</p>
          <Toggle ligado={ativo} aoMudar={setAtivo} rotulo="Ativo" />
        </div>
        {erro && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">{erro}</p>}
      </form>
    </Modal>
  );
}

/** `base`: '/admin/avisos' (painel da T.I.) ou '/rh/avisos' (painel do RH). */
export default function Avisos({ base = '/admin/avisos' }) {
  const { dados, erro, carregando, recarregar, setDados } = useApi(base);
  const [editando, setEditando] = useState(null);
  const lista = dados ?? [];
  const acoes = useAcoesLista({ base, lista, setLista: setDados, recarregar });
  const emExibicao = lista.find((a) => a.ativo)?.id; // o ativo mais recente

  return (
    <>
      <CabecalhoPagina
        titulo="Avisos"
        descricao="Comunicados em popup na home. Só o aviso ativo mais recente é exibido."
        acoes={<Botao icone={Plus} onClick={() => setEditando({})}>Novo aviso</Botao>}
      />
      <EstadoCarregamento carregando={carregando} erro={erro} recarregar={recarregar}>
        <Cartao>
          {lista.length === 0 ? (
            <Vazio icone={Megaphone} titulo="Nenhum aviso" texto="Use avisos para campanhas, comunicados do RH ou manutenções programadas." acao={<Botao icone={Plus} onClick={() => setEditando({})}>Novo aviso</Botao>} />
          ) : (
            <ul className="divide-y divide-gray-100">
              {lista.map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-4 py-3">
                  <img src={a.imagem} alt="" className={`size-14 shrink-0 rounded-lg bg-gray-100 object-cover ${a.ativo ? '' : 'opacity-50 grayscale'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-gray-900">{a.titulo}</p>
                      {a.id === emExibicao && <Selo cor="verde">em exibição</Selo>}
                    </div>
                    <p className="text-xs text-gray-500">Criado em {data(a.criado_em)}</p>
                  </div>
                  <Toggle ligado={a.ativo} aoMudar={(v) => acoes.alternarAtivo(a, v)} rotulo={a.ativo ? 'Desativar aviso' : 'Ativar aviso'} />
                  <div className="flex">
                    <BotaoIcone icone={Pencil} rotulo="Editar aviso" onClick={() => setEditando(a)} />
                    <BotaoIcone icone={Trash2} perigo rotulo="Excluir aviso" onClick={() => acoes.excluir(a, { titulo: 'Excluir aviso?', mensagem: `"${a.titulo}" será excluído permanentemente.` })} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Cartao>
      </EstadoCarregamento>

      {editando && (
        <FormularioAviso
          base={base}
          aviso={editando}
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
