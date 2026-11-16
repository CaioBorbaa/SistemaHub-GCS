import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import {
  ExternalLink, History, Images, RefreshCw, LayoutDashboard, LayoutGrid, LogOut, Megaphone, Menu, Sparkles, Tags, Users, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FeedbackProvider } from './ui/Feedback';
import Carregando from '../components/Carregando';

// Os dois painéis (T.I. e RH) usam este mesmo layout; muda o menu e o selo.
const PAINEIS = {
  admin: {
    nome: 'Painel administrativo',
    selo: 'Admin',
    login: '/admin/login',
    menu: [
      { para: '/admin', rotulo: 'Visão geral', icone: LayoutDashboard, fim: true },
      { para: '/admin/sistemas', rotulo: 'Sistemas', icone: LayoutGrid },
      { para: '/admin/categorias', rotulo: 'Categorias', icone: Tags },
      { para: '/admin/banners', rotulo: 'Banners', icone: Images },
      { para: '/admin/avisos', rotulo: 'Avisos', icone: Megaphone },
      { para: '/admin/temas', rotulo: 'Temas', icone: Sparkles },
      { para: '/admin/usuarios', rotulo: 'Usuários', icone: Users },
    ],
  },
  rh: {
    nome: 'Painel do RH',
    selo: 'RH',
    login: '/rh/login',
    menu: [
      { para: '/rh', rotulo: 'Visão geral', icone: LayoutDashboard, fim: true },
      { para: '/rh/colaboradores', rotulo: 'Colaboradores', icone: Users },
      { para: '/rh/avisos', rotulo: 'Avisos', icone: Megaphone },
      { para: '/rh/factorial', rotulo: 'Factorial', icone: RefreshCw },
      { para: '/rh/historico', rotulo: 'Histórico', icone: History },
    ],
  },
};

function Navegacao({ painel, aoNavegar }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3" aria-label={painel.nome}>
      {painel.menu.map(({ para, rotulo, icone: Icone, fim }) => (
        <NavLink
          key={para}
          to={para}
          end={fim}
          onClick={aoNavegar}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive ? 'bg-brand-soft text-brand-darker' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icone className={`size-5 ${isActive ? 'text-brand-dark' : 'text-gray-400'}`} aria-hidden />
              {rotulo}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function Lateral({ painel, aoNavegar }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  async function sair() {
    await logout();
    navigate(painel.login, { replace: true });
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-6">
        <img src="/images/logo_azul_laranja.png" alt="Tintomax" className="h-7" />
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">{painel.selo}</span>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto py-4">
        <Navegacao painel={painel} aoNavegar={aoNavegar} />
        <div className="mt-4 px-3">
          <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
            <ExternalLink className="size-5 text-gray-400" aria-hidden />
            Ver o hub
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-3 border-t border-gray-100 p-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
          {usuario.iniciais}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">{usuario.nome}</p>
          <p className="text-xs text-gray-500 capitalize">{usuario.nivel}</p>
        </div>
        <button type="button" onClick={sair} aria-label="Sair" title="Sair" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
          <LogOut className="size-5" />
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ painel: tipo = 'admin' }) {
  const painel = PAINEIS[tipo];
  const [menuAberto, setMenuAberto] = useState(false);
  const local = useLocation();

  useEffect(() => setMenuAberto(false), [local.pathname]);

  return (
    <FeedbackProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Lateral fixa (desktop) */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-gray-200 lg:block">
          <Lateral painel={painel} />
        </aside>

        {/* Gaveta (mobile) */}
        {menuAberto && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-gray-900/50" onClick={() => setMenuAberto(false)} />
            <aside className="relative h-full w-72 max-w-[85vw] shadow-xl">
              <button
                type="button"
                onClick={() => setMenuAberto(false)}
                aria-label="Fechar menu"
                className="absolute top-4 -right-12 rounded-lg p-2 text-white"
              >
                <X className="size-6" />
              </button>
              <Lateral painel={painel} aoNavegar={() => setMenuAberto(false)} />
            </aside>
          </div>
        )}

        <div className="lg:pl-64">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-gray-200 bg-white/90 px-4 backdrop-blur lg:hidden">
            <button type="button" onClick={() => setMenuAberto(true)} aria-label="Abrir menu" className="-ml-1 rounded-lg p-2 text-gray-600 hover:bg-gray-100">
              <Menu className="size-6" />
            </button>
            <img src="/images/logo_azul_laranja.png" alt="Tintomax" className="h-6" />
          </header>
          <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Suspense fallback={<Carregando />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </FeedbackProvider>
  );
}
