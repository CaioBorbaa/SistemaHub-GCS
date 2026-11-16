import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { ArrowLeft, Eye, EyeOff, LoaderCircle, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatarCpf, somenteDigitos } from '../lib/cpf';
import { classeInput } from './ui/Campos';

const PAINEIS = {
  admin: { raiz: '/admin', titulo: 'Painel administrativo', subtitulo: 'Acesso restrito ao setor de T.I.', liberado: (u) => u?.admin },
  rh: { raiz: '/rh', titulo: 'Painel do RH', subtitulo: 'Acesso restrito ao setor de Recursos Humanos.', liberado: (u) => u?.rh },
};

export default function AdminLogin({ painel: tipo = 'admin' }) {
  const painel = PAINEIS[tipo];
  const { usuario, loginAdmin, loginRh } = useAuth();
  const navigate = useNavigate();
  const local = useLocation();
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (painel.liberado(usuario)) return <Navigate to={painel.raiz} replace />;

  async function entrar(e) {
    e.preventDefault();
    if (somenteDigitos(cpf).length !== 11 || !senha) {
      setErro('Informe o CPF e a senha.');
      return;
    }
    setEnviando(true);
    setErro('');
    try {
      await (tipo === 'rh' ? loginRh : loginAdmin)(cpf, senha);
      const destino = local.state?.de?.startsWith(painel.raiz) ? local.state.de : painel.raiz;
      navigate(destino, { replace: true });
    } catch (e) {
      setErro(e.message);
      setSenha('');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-8 text-center">
          <img src="/images/logo_azul_laranja.png" alt="Tintomax" className="mx-auto h-10" />
          <h1 className="mt-6 text-2xl font-bold text-gray-900">{painel.titulo}</h1>
          <p className="mt-1 text-sm text-gray-500">{painel.subtitulo}</p>
        </div>

        <form onSubmit={entrar} noValidate className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
          <div>
            <label htmlFor="cpf" className="mb-1.5 block text-sm font-medium text-gray-700">CPF</label>
            <input
              id="cpf"
              inputMode="numeric"
              autoComplete="username"
              autoFocus
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(formatarCpf(e.target.value))}
              className={`${classeInput} py-2.5`}
            />
          </div>
          <div>
            <label htmlFor="senha" className="mb-1.5 block text-sm font-medium text-gray-700">Senha</label>
            <div className="relative">
              <input
                id="senha"
                type={verSenha ? 'text' : 'password'}
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className={`${classeInput} py-2.5 pr-10`}
              />
              <button
                type="button"
                onClick={() => setVerSenha((v) => !v)}
                aria-label={verSenha ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
              >
                {verSenha ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {erro && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-dark px-4 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-brand-darker disabled:opacity-70"
          >
            {enviando ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Lock className="size-4" aria-hidden />}
            {enviando ? 'Entrando...' : 'Entrar no painel'}
          </button>
        </form>

        <Link to="/" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft className="size-4" aria-hidden />
          Voltar ao hub
        </Link>
      </div>
    </div>
  );
}
