import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api('/auth/me')
      .then((d) => setUsuario(d.usuario))
      .catch(() => setUsuario(null))
      .finally(() => setCarregando(false));

    const expirou = () => setUsuario(null);
    window.addEventListener('auth:expirada', expirou);
    return () => window.removeEventListener('auth:expirada', expirou);
  }, []);

  const login = useCallback(async (cpf) => {
    const d = await api('/auth/login', { method: 'POST', body: { cpf } });
    setUsuario(d.usuario);
    return d.usuario;
  }, []);

  const loginAdmin = useCallback(async (cpf, senha) => {
    const d = await api('/auth/admin/login', { method: 'POST', body: { cpf, senha } });
    setUsuario(d.usuario);
    return d.usuario;
  }, []);

  const loginRh = useCallback(async (cpf, senha) => {
    const d = await api('/auth/rh/login', { method: 'POST', body: { cpf, senha } });
    setUsuario(d.usuario);
    return d.usuario;
  }, []);

  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, carregando, login, loginAdmin, loginRh, logout }),
    [usuario, carregando, login, loginAdmin, loginRh, logout],
  );
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
