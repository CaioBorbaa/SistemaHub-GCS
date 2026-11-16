import { useEffect, useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';

const TIPOS = 'image/png,image/jpeg,image/gif,image/webp';
const MAX_MB = 5;

/**
 * Seleção de imagem com pré-visualização e arrastar-e-soltar.
 * `atual` é a URL da imagem já salva; `aoMudar(file|null)`.
 * `renderPreview(url)` permite mostrar a imagem no formato final (ex.: ícone).
 */
export default function EntradaImagem({ id, atual, arquivo, aoMudar, renderPreview, dica }) {
  const input = useRef(null);
  const [previa, setPrevia] = useState(null);
  const [arrastando, setArrastando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!arquivo) return setPrevia(null);
    const url = URL.createObjectURL(arquivo);
    setPrevia(url);
    return () => URL.revokeObjectURL(url);
  }, [arquivo]);

  function escolher(file) {
    setErro('');
    if (!file) return;
    if (!TIPOS.split(',').includes(file.type)) return setErro('Use PNG, JPG, GIF ou WEBP.');
    if (file.size > MAX_MB * 1024 * 1024) return setErro(`A imagem deve ter no máximo ${MAX_MB} MB.`);
    aoMudar(file);
  }

  const url = previa ?? atual;

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          escolher(e.dataTransfer.files?.[0]);
        }}
        className={`flex flex-col items-center gap-4 rounded-xl border-2 border-dashed p-4 transition-colors sm:flex-row ${
          arrastando ? 'border-brand bg-brand-soft' : 'border-gray-300 bg-gray-50'
        }`}
      >
        {url ? (
          renderPreview ? renderPreview(url) : <img src={url} alt="" className="h-24 rounded-lg object-cover" />
        ) : (
          <div className="flex size-20 items-center justify-center rounded-xl bg-gray-200 text-gray-400">
            <ImagePlus className="size-8" aria-hidden />
          </div>
        )}
        <div className="text-center text-sm sm:text-left">
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="font-semibold text-brand-dark hover:text-brand-darker focus-visible:underline focus-visible:outline-none"
          >
            {url ? 'Trocar imagem' : 'Escolher imagem'}
          </button>
          <span className="text-gray-500"> ou arraste até aqui</span>
          <p className="mt-1 text-xs text-gray-500">{dica ?? `PNG, JPG, GIF ou WEBP até ${MAX_MB} MB`}</p>
          {arquivo && <p className="mt-1 truncate text-xs text-gray-700">{arquivo.name}</p>}
        </div>
        <input
          ref={input}
          id={id}
          type="file"
          accept={TIPOS}
          className="sr-only"
          onChange={(e) => {
            escolher(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>
      {erro && <p className="mt-1.5 text-xs text-red-600">{erro}</p>}
    </div>
  );
}
