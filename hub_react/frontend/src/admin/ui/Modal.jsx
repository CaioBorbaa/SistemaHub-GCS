import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

/** Diálogo modal: fecha com Esc, clique no fundo ou botão X. */
export default function Modal({ aberto, titulo, descricao, aoFechar, children, rodape, largura = 'max-w-lg' }) {
  const id = useId();
  const caixa = useRef(null);
  const aoFecharRef = useRef(aoFechar);
  aoFecharRef.current = aoFechar;

  useEffect(() => {
    if (!aberto) return;
    const anterior = document.activeElement;
    const esc = (e) => e.key === 'Escape' && aoFecharRef.current?.();
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    // Foca o primeiro campo do formulário (ou a própria caixa), salvo se algo já tem autoFocus
    if (!caixa.current?.contains(document.activeElement)) {
      const primeiro = caixa.current?.querySelector('input:not([type=hidden]):not([type=file]), select, textarea');
      (primeiro ?? caixa.current)?.focus();
    }
    return () => {
      document.removeEventListener('keydown', esc);
      document.body.style.overflow = '';
      anterior?.focus?.();
    };
  }, [aberto]);

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/50 p-0 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && aoFechar?.()}
    >
      <div
        ref={caixa}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-titulo`}
        tabIndex={-1}
        className={`flex max-h-[92vh] w-full ${largura} animate-pop-in flex-col rounded-t-2xl bg-white shadow-2xl outline-none sm:rounded-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4 sm:px-6">
          <div>
            <h2 id={`${id}-titulo`} className="text-lg font-semibold text-gray-900">{titulo}</h2>
            {descricao && <p className="mt-0.5 text-sm text-gray-500">{descricao}</p>}
          </div>
          <button type="button" onClick={aoFechar} aria-label="Fechar" className="-m-1.5 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {rodape && <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-5 py-3 sm:rounded-b-2xl sm:px-6">{rodape}</div>}
      </div>
    </div>
  );
}
