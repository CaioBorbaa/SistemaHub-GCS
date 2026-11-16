import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatarCpf, somenteDigitos } from '../lib/cpf';

export default function Login() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const local = useLocation();
  const [cpf, setCpf] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to="/" replace />;

  async function entrar(e) {
    e.preventDefault();
    if (somenteDigitos(cpf).length !== 11) {
      setErro('Informe os 11 dígitos do CPF.');
      return;
    }
    setEnviando(true);
    setErro('');
    try {
      await login(cpf);
      navigate(local.state?.de && local.state.de !== '/login' ? local.state.de : '/', { replace: true });
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-lg animate-fade-in rounded-xl border-t-4 border-orange-500 bg-white p-6 shadow-2xl sm:p-10">
        <div className="mb-8 text-center">
          <img src="/images/logo_azul_laranja.png" alt="Tintomax" className="mx-auto mb-6 h-12" />
          <h1 className="text-3xl font-bold text-gray-800">Acesso ao Hub</h1>
          <p className="mt-2 text-gray-500">Por favor, utilize seu CPF para entrar.</p>
        </div>

        <form onSubmit={entrar} noValidate>
          <label htmlFor="cpf" className="mb-2 block font-bold text-gray-700">
            CPF
          </label>
          <input
            id="cpf"
            name="cpf"
            inputMode="numeric"
            autoComplete="username"
            autoFocus
            required
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(formatarCpf(e.target.value))}
            aria-invalid={Boolean(erro)}
            aria-describedby={erro ? 'erro-login' : undefined}
            className="mb-6 w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg transition-all focus:border-transparent focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />

          {erro && (
            <div id="erro-login" role="alert" className="mb-6 rounded-lg border-l-4 border-red-500 bg-red-100 px-4 py-3 text-red-700">
              <p className="font-bold">Acesso Negado</p>
              <p>{erro}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-3 text-lg font-bold text-white transition-opacity duration-300 hover:opacity-90 disabled:opacity-70"
          >
            <span>{enviando ? 'Entrando...' : 'Entrar'}</span>
            {enviando ? <LoaderCircle className="size-6 animate-spin" aria-hidden /> : <ArrowRight className="size-6" aria-hidden />}
          </button>
        </form>
      </div>
    </main>
  );
}
