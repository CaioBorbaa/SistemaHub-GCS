import { api } from '../../lib/api';
import { useFeedback } from './Feedback';

/**
 * Ações comuns das listas do painel, com atualização otimista e rollback:
 * ativar/desativar, reordenar e excluir. `base` é o caminho da API
 * (ex.: "/admin/links"); `setLista` atualiza o array exibido.
 */
export function useAcoesLista({ base, lista, setLista, recarregar }) {
  const { avisar, confirmar } = useFeedback();

  async function alternarAtivo(item, ativo) {
    const anterior = lista;
    setLista(lista.map((i) => (i.id === item.id ? { ...i, ativo } : i)));
    try {
      await api(`${base}/${item.id}/ativo`, { method: 'PATCH', body: { ativo } });
      avisar(ativo ? 'Ativado.' : 'Desativado.');
    } catch (e) {
      setLista(anterior);
      avisar(e.message, 'erro');
    }
  }

  async function reordenar(novaLista) {
    const anterior = lista;
    setLista(novaLista);
    try {
      await api(`${base}/ordem`, { method: 'PUT', body: { ids: novaLista.map((i) => i.id) } });
      avisar('Ordem salva.');
    } catch (e) {
      setLista(anterior);
      avisar(e.message, 'erro');
    }
  }

  async function excluir(item, { titulo, mensagem }) {
    const ok = await confirmar({ titulo, mensagem, textoConfirmar: 'Excluir', perigo: true });
    if (!ok) return false;
    try {
      await api(`${base}/${item.id}`, { method: 'DELETE' });
      avisar('Excluído.');
      await recarregar();
      return true;
    } catch (e) {
      avisar(e.message, 'erro');
      return false;
    }
  }

  return { alternarAtivo, reordenar, excluir };
}
