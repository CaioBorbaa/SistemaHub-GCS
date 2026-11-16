import { LoaderCircle } from 'lucide-react';

export default function Carregando({ tela = false, texto = 'Carregando...' }) {
  return (
    <div
      role="status"
      className={`flex items-center justify-center gap-3 text-gray-500 ${tela ? 'min-h-screen' : 'py-16'}`}
    >
      <LoaderCircle className="size-6 animate-spin text-brand" aria-hidden />
      <span>{texto}</span>
    </div>
  );
}
