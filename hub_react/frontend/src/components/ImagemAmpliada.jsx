import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/** Mostra uma imagem no centro da tela (ex.: arte de campanha ao clicar num banner). */
export default function ImagemAmpliada({ src, alt = '', aoFechar }) {
  const fechar = useRef(null);

  useEffect(() => {
    const anterior = document.activeElement;
    fechar.current?.focus();
    const esc = (e) => e.key === 'Escape' && aoFechar();
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', esc);
      document.body.style.overflow = '';
      anterior?.focus?.();
    };
  }, [aoFechar]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt || 'Imagem ampliada'}
      onClick={(e) => e.target === e.currentTarget && aoFechar()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-[2px] sm:p-8"
    >
      <div className="relative animate-pop-in">
        <img src={src} alt={alt} className="block max-h-[85vh] max-w-[92vw] rounded-xl object-contain shadow-2xl" />
        <button
          ref={fechar}
          type="button"
          onClick={aoFechar}
          aria-label="Fechar"
          className="absolute -top-3 -right-3 flex size-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg ring-1 ring-black/5 transition-transform hover:scale-110 focus-visible:ring-4 focus-visible:ring-brand/50 focus-visible:outline-none"
        >
          <X className="size-5" />
        </button>
      </div>
    </div>
  );
}
