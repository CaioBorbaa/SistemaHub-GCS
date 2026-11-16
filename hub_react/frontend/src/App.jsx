import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router';
import { useAuth } from './context/AuthContext';
import Carregando from './components/Carregando';
import PublicLayout from './components/PublicLayout';
import Login from './pages/Login';
import Home from './pages/Home';
import NaoEncontrada from './pages/NaoEncontrada';

// O painel administrativo é um pacote à parte: quem só usa o hub nunca baixa esse código.
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const AdminLogin = lazy(() => import('./admin/AdminLogin'));
const Dashboard = lazy(() => import('./admin/pages/Dashboard'));
const Sistemas = lazy(() => import('./admin/pages/Sistemas'));
const Categorias = lazy(() => import('./admin/pages/Categorias'));
const Banners = lazy(() => import('./admin/pages/Banners'));
const Usuarios = lazy(() => import('./admin/pages/Usuarios'));
const Avisos = lazy(() => import('./admin/pages/Avisos'));
const Temas = lazy(() => import('./admin/pages/Temas'));
// Painel do RH (mesmo layout, menu próprio)
const RhInicio = lazy(() => import('./rh/pages/Inicio'));
const RhColaboradores = lazy(() => import('./rh/pages/Colaboradores'));
const RhHistorico = lazy(() => import('./rh/pages/Historico'));
const RhFactorial = lazy(() => import('./rh/pages/Factorial'));

function ExigeLogin() {
  const { usuario, carregando } = useAuth();
  const local = useLocation();
  if (carregando) return <Carregando tela />;
  if (!usuario) return <Navigate to="/login" replace state={{ de: local.pathname }} />;
  return <Outlet />;
}

/** Protege um painel: `campo` é "admin" (T.I.) ou "rh". */
function ExigePainel({ campo, login }) {
  const { usuario, carregando } = useAuth();
  const local = useLocation();
  if (carregando) return <Carregando tela />;
  if (!usuario?.[campo]) return <Navigate to={login} replace state={{ de: local.pathname }} />;
  return (
    <Suspense fallback={<Carregando tela />}>
      <Outlet />
    </Suspense>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<Login />} />
        <Route element={<ExigeLogin />}>
          <Route index element={<Home />} />
        </Route>
        <Route path="*" element={<NaoEncontrada />} />
      </Route>

      <Route
        path="/admin/login"
        element={
          <Suspense fallback={<Carregando tela />}>
            <AdminLogin />
          </Suspense>
        }
      />
      <Route path="/admin" element={<ExigePainel campo="admin" login="/admin/login" />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="sistemas" element={<Sistemas />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="banners" element={<Banners />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="avisos" element={<Avisos />} />
          <Route path="temas" element={<Temas />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Route>

      <Route
        path="/rh/login"
        element={
          <Suspense fallback={<Carregando tela />}>
            <AdminLogin painel="rh" />
          </Suspense>
        }
      />
      <Route path="/rh" element={<ExigePainel campo="rh" login="/rh/login" />}>
        <Route element={<AdminLayout painel="rh" />}>
          <Route index element={<RhInicio />} />
          <Route path="colaboradores" element={<RhColaboradores />} />
          <Route path="avisos" element={<Avisos base="/rh/avisos" />} />
          <Route path="historico" element={<RhHistorico />} />
          <Route path="factorial" element={<RhFactorial />} />
          <Route path="*" element={<Navigate to="/rh" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
