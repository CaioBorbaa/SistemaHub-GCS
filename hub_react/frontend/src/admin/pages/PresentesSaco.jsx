import { useState } from 'react';
import { Gift, Pencil, Plus, Trash2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { api, paraFormData } from '../../lib/api';
import { Cartao, EstadoCarregamento, Vazio } from '../ui/Pagina';
import Botao, { BotaoIcone } from '../ui/Botao';
import Modal from '../ui/Modal';
import EntradaImagem from '../ui/EntradaImagem';
import { Campo, Toggle, classeInput } from '../ui/Campos';
import { useFeedback } from '../ui/Feedback';
import { useAcoesLista } from '../ui/useAcoesLista';

function FormularioPresente({ presente, aoFechar, aoSalvar }) {
  const novo = !presente.id;
  const { avisar } = useFeedback();
  const [nome, setNome] = useState(presente.nome ?? '');
  const [ativo, setAtivo] = useState(presente.ativo ?? true);
  const [imagem, setImagem] = useState(null);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar(e) {
    e.preventDefault();
    if (novo && !imagem) return setErro('Escolha a foto do produto.');
    setSalvando(true);
    setErro('');
    try {
      await api(novo ? '/admin/presentes' : `/admin/presentes/${presente.id}`, {
        method: novo ? 'POST' : 'PUT',
        form: paraFormData({ nome, ativo, imagem }),
      });
      avisar(novo ? 'Presente adicionado ao saco.' : 'Presente atualizado.');
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
      titulo={novo ? 'Novo presente' : 'Editar presente'}
      descricao="Produto que pode sair do saco de presentes no tema de Natal."
      aoFechar={aoFechar}
      rodape={
        <>
          <Botao variante="secundario" onClick={aoFechar}>Cancelar</Botao>
          <Botao type="submit" form="form-presente" carregando={salvando}>{novo ? 'Adicionar' : 'Salvar'}</Botao>
        </>
      }
    >
      <form id="form-presente" onSubmit={salvar} className="space-y-5" noValidate>
        <Campo rotulo="Nome do produto" dica="Aparece na etiqueta quando o produto sai do saco.">
          {(id) => <input id={id} className={classeInput} maxLength={100} value={nome} onChange={(e) => setNome(e.target.value)} />}
        </Campo>
        <Campo rotulo="Foto">
          {(id) => (
            <EntradaImagem
              id={id}
              arquivo={imagem}
              aoMudar={setImagem}
              atual={presente.id ? presente.imagem : null}
              dica="PNG com fundo transparente fica melhor (sem caixa branca em volta)."
              renderPreview={(url) => <img src={url} alt="" className="h-24 max-w-28 object-contain" />}
            />
          )}
        </Campo>
        <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-800">No saco</p>
            <p className="text-xs text-gray-500">Desligado, o produto não é sorteado.</p>
          </div>
          <Toggle ligado={ativo} aoMudar={setAtivo} rotulo="No saco" />
        </div>
        {erro && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">{erro}</p>}
      </form>
    </Modal>
  );
}

/** Seção da tela Temas: produtos do saco de presentes (tema de Natal). */
export default function PresentesSaco() {
  const { dados, erro, carregando, recarregar, setDados } = useApi('/admin/presentes');
  const [editando, setEditando] = useState(null);
  const lista = dados ?? [];
  const acoes = useAcoesLista({ base: '/admin/presentes', lista, setLista: setDados, recarregar });
  const ativos = lista.filter((p) => p.ativo).length;

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900">🎁 Saco de presentes (Natal)</h2>
          <p className="mt-0.5 max-w-2xl text-sm text-gray-500">
            Ao clicar no saco, um destes produtos é sorteado e pula para fora. Cada pessoa ganha um por vez que abre o hub,
            e o sorteio evita repetir os últimos que ela já viu.
          </p>
        </div>
        <Botao icone={Plus} onClick={() => setEditando({})}>Novo presente</Botao>
      </div>

      <EstadoCarregamento carregando={carregando} erro={erro} recarregar={recarregar}>
        <Cartao>
          {lista.length === 0 ? (
            <Vazio icone={Gift} titulo="O saco está vazio" texto="Sem produtos, o saco de presentes não aparece no hub." acao={<Botao icone={Plus} onClick={() => setEditando({})}>Novo presente</Botao>} />
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-px bg-gray-100 sm:grid-cols-3 lg:grid-cols-6">
                {lista.map((p) => (
                  <li key={p.id} className="flex flex-col items-center bg-white p-4 text-center">
                    <img src={p.imagem} alt="" className={`h-24 w-full object-contain ${p.ativo ? '' : 'opacity-40 grayscale'}`} />
                    <p className="mt-3 line-clamp-2 min-h-10 text-sm font-medium text-gray-800">{p.nome}</p>
                    <div className="mt-2 flex items-center gap-1">
                      <Toggle ligado={p.ativo} aoMudar={(v) => acoes.alternarAtivo(p, v)} rotulo={`${p.ativo ? 'Tirar do saco' : 'Colocar no saco'}: ${p.nome}`} />
                      <BotaoIcone icone={Pencil} rotulo={`Editar ${p.nome}`} onClick={() => setEditando(p)} />
                      <BotaoIcone
                        icone={Trash2}
                        perigo
                        rotulo={`Excluir ${p.nome}`}
                        onClick={() => acoes.excluir(p, { titulo: 'Excluir presente?', mensagem: `"${p.nome}" será removido do saco de presentes.` })}
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <p className="border-t border-gray-100 px-4 py-2.5 text-xs text-gray-500">
                {ativos} de {lista.length} produtos no saco.
              </p>
            </>
          )}
        </Cartao>
      </EstadoCarregamento>

      {editando && (
        <FormularioPresente
          presente={editando}
          aoFechar={() => setEditando(null)}
          aoSalvar={() => {
            setEditando(null);
            recarregar();
          }}
        />
      )}
    </section>
  );
}
