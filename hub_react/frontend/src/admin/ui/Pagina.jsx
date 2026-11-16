import { CircleAlert, RotateCw } from 'lucide-react';
import Carregando from '../../components/Carregando';
import Botao from './Botao';

export function CabecalhoPagina({ titulo, descricao, acoes }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{titulo}</h1>
        {descricao && <p className="mt-1 max-w-2xl text-sm text-gray-500">{descricao}</p>}
      </div>
      {acoes && <div className="flex shrink-0 flex-wrap gap-2">{acoes}</div>}
    </div>
  );
}

export function Cartao({ className = '', children }) {
  return <div className={`overflow-hidden rounded-xl bg-white shadow-xs ring-1 ring-gray-200 ${className}`}>{children}</div>;
}

/** Trata carregando/erro de uma chamada `useApi` e só renderiza o conteúdo com dados. */
export function EstadoCarregamento({ carregando, erro, recarregar, children }) {
  if (carregando) return <Carregando />;
  if (erro) {
    return (
      <Cartao className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <CircleAlert className="size-8 text-red-500" aria-hidden />
        <p className="text-gray-700">{erro.message}</p>
        <Botao variante="secundario" icone={RotateCw} onClick={recarregar}>Tentar novamente</Botao>
      </Cartao>
    );
  }
  return children;
}

export function Vazio({ icone: Icone, titulo, texto, acao }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {Icone && <Icone className="mb-3 size-10 text-gray-300" aria-hidden />}
      <p className="font-semibold text-gray-800">{titulo}</p>
      {texto && <p className="mt-1 max-w-sm text-sm text-gray-500">{texto}</p>}
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  );
}
