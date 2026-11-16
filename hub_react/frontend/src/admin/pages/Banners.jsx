import { useState } from 'react';
import { Ban, ExternalLink, Images, Link2, Maximize2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { api, paraFormData } from '../../lib/api';
import { CabecalhoPagina, Cartao, EstadoCarregamento, Vazio } from '../ui/Pagina';
import Botao, { BotaoIcone } from '../ui/Botao';
import Modal from '../ui/Modal';
import EntradaImagem from '../ui/EntradaImagem';
import ListaOrdenavel from '../ui/ListaOrdenavel';
import { Campo, Toggle, classeInput } from '../ui/Campos';
import { useFeedback } from '../ui/Feedback';
import { useAcoesLista } from '../ui/useAcoesLista';

const ACOES_CLIQUE = [
  { id: 'nenhuma', titulo: 'Nada', texto: 'Banner só informativo.', icone: Ban },
  { id: 'link', titulo: 'Abre um link', texto: 'Em uma nova aba.', icone: Link2 },
  { id: 'popup', titulo: 'Mostra uma imagem', texto: 'No centro da tela.', icone: Maximize2 },
];

function FormularioBanner({ banner, aoFechar, aoSalvar }) {
  const novo = !banner.id;
  const { avisar } = useFeedback();
  const [acao, setAcao] = useState(banner.acao ?? 'nenhuma');
  const [link, setLink] = useState(banner.link_url ?? '');
  const [ativo, setAtivo] = useState(banner.ativo ?? true);
  const [imagem, setImagem] = useState(null);
  const [popup, setPopup] = useState(null);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar(e) {
    e.preventDefault();
    if (novo && !imagem) return setErro('Escolha a imagem do banner.');
    if (acao === 'link' && !link.trim()) return setErro('Informe o link que o banner deve abrir.');
    if (acao === 'popup' && !popup && !banner.popup) return setErro('Escolha a imagem que aparece ao clicar no banner.');
    setSalvando(true);
    setErro('');
    try {
      await api(novo ? '/admin/banners' : `/admin/banners/${banner.id}`, {
        method: novo ? 'POST' : 'PUT',
        form: paraFormData({ acao, link_url: acao === 'link' ? link : '', ativo, imagem, popup: acao === 'popup' ? popup : null }),
      });
      avisar(novo ? 'Banner adicionado.' : 'Banner atualizado.');
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
      titulo={novo ? 'Novo banner' : 'Editar banner'}
      descricao="Os banners ativos se alternam a cada 10 segundos no topo da home."
      aoFechar={aoFechar}
      largura="max-w-2xl"
      rodape={
        <>
          <Botao variante="secundario" onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" form="form-banner" carregando={salvando}>{novo ? 'Adicionar' : 'Salvar'}</Botao>
        </>
      }
    >
      <form id="form-banner" onSubmit={salvar} className="space-y-5" noValidate>
        <Campo rotulo="Imagem">
          {(id) => (
            <EntradaImagem
              id={id}
              arquivo={imagem}
              aoMudar={setImagem}
              atual={banner.imagem}
              dica="Formato bem largo, ex.: 1920×160 px. As bordas podem ser cortadas em telas menores."
              renderPreview={(url) => <img src={url} alt="" className="h-20 w-full rounded-lg object-cover sm:w-80" />}
            />
          )}
        </Campo>
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-gray-700">Ao clicar no banner</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {ACOES_CLIQUE.map(({ id: valor, titulo, texto, icone: Icone }) => (
              <label
                key={valor}
                className={`flex cursor-pointer gap-2.5 rounded-lg p-3 ring-1 ring-inset has-focus-visible:ring-2 has-focus-visible:ring-brand ${
                  acao === valor ? 'bg-brand-soft ring-brand/40' : 'ring-gray-200 hover:bg-gray-50'
                }`}
              >
                <input type="radio" name="acao" className="sr-only" checked={acao === valor} onChange={() => setAcao(valor)} />
                <Icone className={`mt-0.5 size-4 shrink-0 ${acao === valor ? 'text-brand-dark' : 'text-gray-400'}`} aria-hidden />
                <span>
                  <span className="block text-sm font-medium text-gray-900">{titulo}</span>
                  <span className="block text-xs text-gray-500">{texto}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        {acao === 'link' && (
          <Campo rotulo="Link">
            {(id) => <input id={id} type="url" placeholder="https://" className={classeInput} value={link} onChange={(e) => setLink(e.target.value)} />}
          </Campo>
        )}
        {acao === 'popup' && (
          <Campo rotulo="Imagem que aparece no centro da tela">
            {(id) => (
              <EntradaImagem
                id={id}
                arquivo={popup}
                aoMudar={setPopup}
                atual={banner.popup}
                dica="Ex.: a arte completa da campanha. Ela aparece inteira, sem cortes, no tamanho que couber na tela."
                renderPreview={(url) => <img src={url} alt="" className="h-28 max-w-40 rounded-lg object-contain shadow-sm" />}
              />
            )}
          </Campo>
        )}
        <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
          <p className="text-sm font-medium text-gray-800">Exibir na home</p>
          <Toggle ligado={ativo} aoMudar={setAtivo} rotulo="Exibir na home" />
        </div>
        {erro && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">{erro}</p>}
      </form>
    </Modal>
  );
}

export default function Banners() {
  const { dados, erro, carregando, recarregar, setDados } = useApi('/admin/banners');
  const [editando, setEditando] = useState(null);
  const lista = dados ?? [];
  const acoes = useAcoesLista({ base: '/admin/banners', lista, setLista: setDados, recarregar });

  return (
    <>
      <CabecalhoPagina
        titulo="Banners"
        descricao="Carrossel no topo da home. Arraste para definir a ordem de exibição."
        acoes={<Botao icone={Plus} onClick={() => setEditando({})}>Novo banner</Botao>}
      />
      <EstadoCarregamento carregando={carregando} erro={erro} recarregar={recarregar}>
        <Cartao>
          {lista.length === 0 ? (
            <Vazio icone={Images} titulo="Nenhum banner" texto="Sem banners, a home começa direto nas categorias." acao={<Botao icone={Plus} onClick={() => setEditando({})}>Novo banner</Botao>} />
          ) : (
            <ListaOrdenavel
              itens={lista}
              aoReordenar={acoes.reordenar}
              renderItem={(b) => (
                <>
                  <img src={b.imagem} alt="" className={`h-12 w-28 shrink-0 rounded-md bg-gray-100 object-cover sm:h-16 sm:w-64 ${b.ativo ? '' : 'opacity-50 grayscale'}`} />
                  <div className="min-w-0 flex-1 text-sm">
                    {b.acao === 'popup' ? (
                      <a href={b.popup} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-gray-700 hover:text-brand-dark">
                        <Maximize2 className="size-3.5 shrink-0" aria-hidden />
                        Ao clicar, mostra uma imagem
                      </a>
                    ) : b.link_url ? (
                      <a href={b.link_url} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1 text-gray-700 hover:text-brand-dark">
                        <span className="truncate">{b.link_url}</span>
                        <ExternalLink className="size-3 shrink-0" aria-hidden />
                      </a>
                    ) : (
                      <span className="text-gray-400">Sem ação ao clicar</span>
                    )}
                    <p className="truncate text-xs text-gray-400">{b.imagem_nome}</p>
                  </div>
                  <Toggle ligado={b.ativo} aoMudar={(v) => acoes.alternarAtivo(b, v)} rotulo={b.ativo ? 'Ocultar banner' : 'Exibir banner'} />
                  <div className="flex">
                    <BotaoIcone icone={Pencil} rotulo="Editar banner" onClick={() => setEditando(b)} />
                    <BotaoIcone
                      icone={Trash2}
                      perigo
                      rotulo="Excluir banner"
                      onClick={() => acoes.excluir(b, { titulo: 'Excluir banner?', mensagem: 'A imagem será apagada do servidor. Para apenas ocultar, desative o banner.' })}
                    />
                  </div>
                </>
              )}
            />
          )}
        </Cartao>
      </EstadoCarregamento>

      {editando && (
        <FormularioBanner
          banner={editando}
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
