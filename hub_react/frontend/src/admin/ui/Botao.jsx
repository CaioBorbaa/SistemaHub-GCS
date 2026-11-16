import { LoaderCircle } from 'lucide-react';

const VARIANTES = {
  primario: 'bg-brand-dark text-white hover:bg-brand-darker shadow-sm',
  secundario: 'bg-white text-gray-700 ring-1 ring-gray-300 ring-inset hover:bg-gray-50',
  perigo: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  fantasma: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
};

export default function Botao({ variante = 'primario', icone: Icone, carregando = false, className = '', children, ...props }) {
  return (
    <button
      type="button"
      disabled={carregando || props.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTES[variante]} ${className}`}
      {...props}
    >
      {carregando ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : Icone && <Icone className="size-4" aria-hidden />}
      {children}
    </button>
  );
}

/** Botão quadrado só com ícone (ações das linhas). */
export function BotaoIcone({ icone: Icone, rotulo, perigo = false, className = '', ...props }) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      title={rotulo}
      className={`rounded-lg p-2 transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none ${
        perigo ? 'text-gray-400 hover:bg-red-50 hover:text-red-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
      } ${className}`}
      {...props}
    >
      <Icone className="size-[18px]" aria-hidden />
    </button>
  );
}
