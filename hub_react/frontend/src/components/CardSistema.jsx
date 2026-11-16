import { useState } from 'react';
import { registrarClique } from '../lib/api';

export const GRADE_SISTEMAS =
  'grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] justify-items-center gap-x-6 gap-y-8 sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] lg:gap-x-14';

const TAMANHO = 'size-[100px] sm:size-[130px] lg:size-[150px] xl:size-[170px]';

function iniciais(nome) {
  return nome.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

/** Ícone quadrado arredondado (20%) que abre o sistema em nova aba. */
export default function CardSistema({ link, categoria, aoClicar = registrarClique }) {
  const [semImagem, setSemImagem] = useState(false);

  return (
    <div className="flex flex-col items-center text-center">
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => aoClicar?.(link.id)}
        className={`${TAMANHO} block rounded-[20%] transition-transform duration-500 hover:scale-110 focus-visible:scale-110 focus-visible:ring-4 focus-visible:ring-brand/50 focus-visible:outline-none`}
      >
        {semImagem ? (
          <span className="flex size-full items-center justify-center rounded-[20%] bg-brand text-3xl font-bold text-white">
            {iniciais(link.nome)}
          </span>
        ) : (
          <img
            src={link.imagem ?? `/api/links/${link.id}/imagem`}
            alt=""
            loading="lazy"
            decoding="async"
            width="170"
            height="170"
            onError={() => setSemImagem(true)}
            className="size-full rounded-[20%] object-cover"
          />
        )}
      </a>
      <h3 className="mt-3 max-w-[170px] text-base font-bold text-gray-800 sm:text-lg">{link.nome}</h3>
      {categoria && <p className="text-xs text-gray-500 capitalize">{categoria}</p>}
    </div>
  );
}
