import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CircleAlert, CircleCheck, TriangleAlert, X } from 'lucide-react';
import Modal from './Modal';
import Botao from './Botao';

const FeedbackContext = createContext(null);

/**
 * Fornece `avisar(mensagem, tipo)` (toasts) e `confirmar({...})` (diálogo que
 * devolve uma Promise<boolean>) para as páginas do painel.
 */
export function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialogo, setDialogo] = useState(null);
  const proximoId = useRef(0);

  const avisar = useCallback((mensagem, tipo = 'sucesso') => {
    const id = ++proximoId.current;
    setToasts((t) => [...t, { id, mensagem, tipo }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tipo === 'erro' ? 6000 : 3500);
  }, []);

  const confirmar = useCallback(
    (opcoes) => new Promise((resolver) => setDialogo({ textoConfirmar: 'Confirmar', perigo: false, ...opcoes, resolver })),
    [],
  );

  function responder(valor) {
    dialogo?.resolver(valor);
    setDialogo(null);
  }

  return (
    <FeedbackContext.Provider value={{ avisar, confirmar }}>
      {children}

      <Modal
        aberto={Boolean(dialogo)}
        titulo={dialogo?.titulo}
        aoFechar={() => responder(false)}
        largura="max-w-md"
        rodape={
          <>
            <Botao variante="secundario" onClick={() => responder(false)}>Cancelar</Botao>
            <Botao variante={dialogo?.perigo ? 'perigo' : 'primario'} onClick={() => responder(true)} autoFocus>
              {dialogo?.textoConfirmar}
            </Botao>
          </>
        }
      >
        <div className="flex gap-4">
          {dialogo?.perigo && (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100">
              <TriangleAlert className="size-5 text-red-600" aria-hidden />
            </div>
          )}
          <p className="text-sm text-gray-600">{dialogo?.mensagem}</p>
        </div>
      </Modal>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:right-4 sm:left-auto sm:items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tipo === 'erro' ? 'alert' : 'status'}
            className="pointer-events-auto flex w-full max-w-sm animate-pop-in items-start gap-3 rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-xl"
          >
            {t.tipo === 'erro' ? (
              <CircleAlert className="mt-0.5 size-5 shrink-0 text-red-400" aria-label="Erro" />
            ) : (
              <CircleCheck className="mt-0.5 size-5 shrink-0 text-green-400" aria-label="Sucesso" />
            )}
            <span className="flex-1">{t.mensagem}</span>
            <button
              type="button"
              onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))}
              aria-label="Fechar notificação"
              className="text-gray-400 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  return useContext(FeedbackContext);
}
