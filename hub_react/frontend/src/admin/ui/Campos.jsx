import { useId } from 'react';

export const classeInput =
  'block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-brand-dark focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 aria-invalid:ring-red-500';

/** Rótulo + controle + dica/erro. `children` recebe o id gerado. */
export function Campo({ rotulo, dica, erro, opcional = false, children }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
        {rotulo}
        {opcional && <span className="ml-1 font-normal text-gray-400">(opcional)</span>}
      </label>
      {children(id)}
      {erro ? (
        <p className="mt-1.5 text-xs text-red-600">{erro}</p>
      ) : (
        dica && <p className="mt-1.5 text-xs text-gray-500">{dica}</p>
      )}
    </div>
  );
}

/** Interruptor liga/desliga acessível. */
export function Toggle({ ligado, aoMudar, rotulo, disabled = false, mostrarTexto = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      aria-label={rotulo}
      title={rotulo}
      disabled={disabled}
      onClick={() => aoMudar(!ligado)}
      className="group inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors group-focus-visible:ring-2 group-focus-visible:ring-brand group-focus-visible:ring-offset-2 ${
          ligado ? 'bg-green-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${ligado ? 'translate-x-5' : ''}`}
        />
      </span>
      {mostrarTexto && <span className="text-sm text-gray-700">{ligado ? 'Ativo' : 'Inativo'}</span>}
    </button>
  );
}

export function Selo({ cor = 'cinza', children }) {
  const cores = {
    cinza: 'bg-gray-100 text-gray-700 ring-gray-500/20',
    laranja: 'bg-brand-soft text-brand-darker ring-brand/30',
    verde: 'bg-green-50 text-green-700 ring-green-600/20',
    azul: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    vermelho: 'bg-red-50 text-red-700 ring-red-600/20',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${cores[cor]}`}>
      {children}
    </span>
  );
}
