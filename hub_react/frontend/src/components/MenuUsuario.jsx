import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { IdCard, LogOut, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/** Botão flutuante (canto inferior direito) com nome, nível e "Sair". */
export default function MenuUsuario() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e) => !ref.current?.contains(e.target) && setAberto(false);
    const esc = (e) => e.key === 'Escape' && setAberto(false);
    document.addEventListener('mousedown', fora);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', fora);
      document.removeEventListener('keydown', esc);
    };
  }, [aberto]);

  async function sair() {
    await logout();
    navigate('/login', { replace: true });
  }

  const item = 'flex w-full items-center gap-3 px-4 py-3 text-left text-gray-700 transition-colors hover:bg-gray-100';

  return (
    <div ref={ref} className="fixed right-5 bottom-5 z-30">
      {aberto && (
        <div className="absolute right-0 bottom-16 w-64 origin-bottom-right animate-pop-in overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl">
          <div className="border-b border-gray-200 px-4 py-3">
            <p className="truncate font-bold text-gray-800">{usuario.nome}</p>
            <p className="text-sm text-gray-500 capitalize">{usuario.nivel}</p>
          </div>
          {usuario.podeAdministrar && (
            <Link to="/admin" className={item}>
              <ShieldCheck className="size-5" aria-hidden />
              Painel administrativo
            </Link>
          )}
          {usuario.podeRh && (
            <Link to="/rh" className={item}>
              <IdCard className="size-5" aria-hidden />
              Painel do RH
            </Link>
          )}
          <button type="button" onClick={sair} className={item}>
            <LogOut className="size-5" aria-hidden />
            Sair
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-label={`Menu do usuário ${usuario.nome}`}
        title={usuario.nome}
        className="flex size-14 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-all duration-200 hover:scale-110 hover:opacity-90"
      >
        <User className="size-8" aria-hidden />
      </button>
    </div>
  );
}
