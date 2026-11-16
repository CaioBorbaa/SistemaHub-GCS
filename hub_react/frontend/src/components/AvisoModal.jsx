import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const chave = (id) => `aviso-visto-${id}`;

function jaVisto(id) {
  try {
    return sessionStorage.getItem(chave(id)) === '1';
  } catch {
    return false;
  }
}

/** Popup com o aviso em destaque, exibido uma vez por sessão do navegador. */
export default function AvisoModal({ aviso }) {
  const [aberto, setAberto] = useState(() => Boolean(aviso) && !jaVisto(aviso.id));

  function fechar() {
    setAberto(false);
    try {
      sessionStorage.setItem(chave(aviso.id), '1');
    } catch {
      /* armazenamento indisponível: o aviso pode reaparecer, sem problema */
    }
  }

  useEffect(() => {
    if (!aberto) return;
    const esc = (e) => e.key === 'Escape' && fechar();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  });

  if (!aberto) return null;

  const imagem = <img src={aviso.imagem} alt={aviso.titulo} className="max-h-[70vh] w-full rounded-lg object-contain" />;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="aviso-titulo"
      onClick={(e) => e.target === e.currentTarget && fechar()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <div className="relative w-full max-w-3xl animate-pop-in rounded-xl bg-white p-4 shadow-2xl sm:p-6">
        <button
          type="button"
          onClick={fechar}
          autoFocus
          aria-label="Fechar aviso"
          className="absolute top-3 right-3 rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
        >
          <X className="size-6" />
        </button>
        <h2 id="aviso-titulo" className="mb-4 pr-10 text-xl font-bold text-gray-800 sm:text-2xl">
          {aviso.titulo}
        </h2>
        {aviso.link_url ? (
          <a href={aviso.link_url} target="_blank" rel="noopener noreferrer" onClick={fechar}>
            {imagem}
          </a>
        ) : (
          imagem
        )}
      </div>
    </div>
  );
}
