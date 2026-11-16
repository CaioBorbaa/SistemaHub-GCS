import { Link } from 'react-router';

export default function NaoEncontrada() {
  return (
    <main className="flex-1 px-6 py-16 text-center">
      <div className="mx-auto max-w-md">
        <img src="/images/logo_azul_laranja.png" alt="Tintomax" className="mx-auto mb-8 h-14 opacity-50" />
        <h1 className="mb-4 text-6xl font-bold text-gray-400">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-gray-700">Página não encontrada</h2>
        <p className="mb-8 text-gray-600">A página que você está procurando não existe ou foi movida.</p>
        <Link
          to="/"
          className="inline-block rounded-lg bg-brand px-6 py-3 text-white transition-colors duration-200 hover:bg-brand-dark"
        >
          Voltar ao Hub
        </Link>
        <p className="mt-4 text-sm text-gray-500">Se você acredita que isso é um erro, entre em contato com o setor de T.I.</p>
      </div>
    </main>
  );
}
