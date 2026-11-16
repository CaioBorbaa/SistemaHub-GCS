import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { TEMAS, TEMA_PADRAO } from '.';

const TemaContext = createContext(TEMA_PADRAO);

/**
 * Busca o tema do dia na API. Admins podem testar qualquer tema com
 * `?previa=natal&mensagem=...&efeitos=0` (usado pelo botão "Pré-visualizar").
 */
export function TemaProvider({ children }) {
  const { usuario } = useAuth();
  const [params] = useSearchParams();
  const [doServidor, setDoServidor] = useState(null);

  useEffect(() => {
    api('/tema')
      .then((d) => setDoServidor(d.tema))
      .catch(() => setDoServidor(null));
  }, []);

  const previa = usuario?.podeAdministrar && TEMAS[params.get('previa')]
    ? {
        id: params.get('previa'),
        mensagem: params.get('mensagem') ?? TEMAS[params.get('previa')].mensagemPadrao,
        efeitos: params.get('efeitos') !== '0',
        previa: true,
      }
    : null;
  const ativo = previa ?? doServidor;

  // Baixa só os componentes (animações) do tema no ar; o fundo e as cores já aparecem antes.
  const [pacote, setPacote] = useState({ id: null, componentes: {} });
  useEffect(() => {
    const id = ativo?.id;
    if (!id || !TEMAS[id] || pacote.id === id) return;
    let vivo = true;
    TEMAS[id]
      .carregar()
      .then((m) => vivo && setPacote({ id, componentes: { ...m } }))
      .catch(() => {}); // sem rede para o pacote: o tema fica só com fundo e mensagem
    return () => {
      vivo = false;
    };
  }, [ativo?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const componentes = pacote.id === ativo?.id ? pacote.componentes : {};
  const valor = useMemo(
    () => (ativo && TEMAS[ativo.id] ? { ...TEMA_PADRAO, ...TEMAS[ativo.id], ...componentes, ...ativo } : TEMA_PADRAO),
    [ativo?.id, ativo?.mensagem, ativo?.efeitos, ativo?.previa, componentes], // eslint-disable-line react-hooks/exhaustive-deps
  );
  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>;
}

export function useTema() {
  return useContext(TemaContext);
}
