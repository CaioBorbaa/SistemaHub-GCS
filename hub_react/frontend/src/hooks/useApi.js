import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';

/** Carrega `caminho` da API e expõe { dados, erro, carregando, recarregar, setDados }. */
export function useApi(caminho) {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    setErro(null);
    try {
      setDados(await api(caminho));
    } catch (e) {
      setErro(e);
    } finally {
      setCarregando(false);
    }
  }, [caminho]);

  useEffect(() => {
    setCarregando(true);
    recarregar();
  }, [recarregar]);

  return { dados, erro, carregando, recarregar, setDados };
}
