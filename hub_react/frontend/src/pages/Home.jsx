import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import Carregando from '../components/Carregando';
import BannerCarrossel from '../components/BannerCarrossel';
import AvisoModal from '../components/AvisoModal';
import CardSistema, { GRADE_SISTEMAS } from '../components/CardSistema';

const GERAL = 'geral';
const ehGeral = (secao) => secao.nome.trim().toLowerCase() === GERAL;

function BotaoFiltro({ ativo, children, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      className={`rounded-lg px-5 py-3 text-base font-bold capitalize transition-all duration-200 sm:px-8 sm:py-4 sm:text-lg ${
        ativo ? 'scale-105 bg-blue-600 text-white shadow-lg' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
      }`}
      {...props}
    >
      {children}
    </button>
  );
}

function Secao({ titulo, links }) {
  return (
    <section className="mb-12 animate-fade-in">
      <h2 className="mb-8 text-2xl font-bold text-gray-800 capitalize sm:text-3xl">{titulo}</h2>
      <div className={GRADE_SISTEMAS}>
        {links.map((link) => (
          <CardSistema key={link.id} link={link} />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const { dados, erro, carregando } = useApi('/hub');
  const [filtro, setFiltro] = useState(GERAL);
  const [geralAberto, setGeralAberto] = useState(true);
  const [termo, setTermo] = useState('');
  const busca = useRef(null);

  const secoes = dados?.secoes ?? [];
  const geral = secoes.find(ehGeral);
  const categorias = secoes.filter((s) => !ehGeral(s));
  const categoriaAtiva = categorias.find((c) => c.id === filtro);

  const termoLimpo = termo.trim().toLowerCase();
  const pesquisando = termoLimpo.length >= 2;

  // Todos os sistemas sem repetição, guardando a 1ª categoria de cada um
  const todos = useMemo(() => {
    const vistos = new Map();
    for (const secao of secoes) {
      for (const link of secao.links) {
        if (!vistos.has(link.id)) vistos.set(link.id, { link, categoria: secao.nome });
      }
    }
    return [...vistos.values()];
  }, [secoes]);

  const resultados = pesquisando ? todos.filter(({ link }) => link.nome.toLowerCase().includes(termoLimpo)) : [];

  // Ctrl+K foca a pesquisa; Esc limpa
  useEffect(() => {
    const teclas = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        busca.current?.focus();
      } else if (e.key === 'Escape' && busca.current?.value) {
        setTermo('');
      }
    };
    document.addEventListener('keydown', teclas);
    return () => document.removeEventListener('keydown', teclas);
  }, []);

  function escolher(novoFiltro) {
    setTermo('');
    setFiltro(novoFiltro);
    setGeralAberto(novoFiltro === GERAL);
  }

  if (carregando) return <Carregando />;

  return (
    <>
      <BannerCarrossel banners={dados?.banners ?? []} />
      {dados?.aviso && <AvisoModal aviso={dados.aviso} />}

      <main className="container mx-auto flex-1 px-4 py-8 sm:px-6">
        {erro && (
          <div role="alert" className="mx-auto mb-8 max-w-2xl rounded-lg border-l-4 border-red-500 bg-red-100 px-4 py-3 text-red-700">
            Não foi possível carregar os sistemas: {erro.message}
          </div>
        )}

        {/* Botões de categoria */}
        <nav aria-label="Categorias" className="mb-8 flex flex-wrap justify-center gap-3 sm:gap-4">
          <BotaoFiltro ativo={!pesquisando && filtro === GERAL} onClick={() => escolher(GERAL)}>
            Geral
          </BotaoFiltro>
          {categorias.map((c) => (
            <BotaoFiltro key={c.id} ativo={!pesquisando && filtro === c.id} onClick={() => escolher(c.id)}>
              {c.nome}
            </BotaoFiltro>
          ))}
        </nav>

        {/* Pesquisa */}
        <div className="mx-auto mb-10 w-full max-w-2xl">
          <div className="relative">
            <input
              ref={busca}
              type="search"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder="Pesquisar links... (Ctrl+K)"
              aria-label="Pesquisar sistemas"
              className="w-full rounded-lg border-2 border-gray-300 bg-white px-5 py-3 pr-12 text-base transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none sm:px-6 sm:py-4 sm:text-lg [&::-webkit-search-cancel-button]:hidden"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              {termo ? (
                <button type="button" onClick={() => setTermo('')} aria-label="Limpar pesquisa" className="text-gray-400 hover:text-gray-600">
                  <X className="size-6" />
                </button>
              ) : (
                <Search className="size-6 text-gray-400" aria-hidden />
              )}
            </div>
          </div>
          {pesquisando && (
            <p className="mt-3 text-center text-gray-600" aria-live="polite">
              {resultados.length} resultado(s) encontrado(s) para "{termo.trim()}"
            </p>
          )}
        </div>

        {pesquisando ? (
          <section className="mb-12 animate-fade-in">
            <h2 className="mb-8 text-2xl font-bold text-gray-800 sm:text-3xl">Resultados da Pesquisa</h2>
            {resultados.length > 0 ? (
              <div className={GRADE_SISTEMAS}>
                {resultados.map(({ link, categoria }) => (
                  <CardSistema key={link.id} link={link} categoria={categoria} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Search className="mx-auto mb-4 size-14 text-gray-300" aria-hidden />
                <h3 className="mb-2 text-xl font-semibold text-gray-600">Nenhum link encontrado</h3>
                <p className="text-gray-500">Tente pesquisar por outro termo ou verifique a ortografia.</p>
              </div>
            )}
          </section>
        ) : categoriaAtiva ? (
          <div key={categoriaAtiva.id}>
            {/* "Geral" recolhível dentro das outras abas */}
            {geral && (
              <div className="mb-8">
                <button
                  type="button"
                  onClick={() => setGeralAberto((v) => !v)}
                  aria-expanded={geralAberto}
                  className="flex w-full items-center justify-between rounded-lg bg-gray-200 px-6 py-4 text-left transition-colors duration-200 hover:bg-gray-300"
                >
                  <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">Geral</h2>
                  <ChevronDown className={`size-6 transition-transform duration-200 ${geralAberto ? 'rotate-180' : ''}`} aria-hidden />
                </button>
                {geralAberto && (
                  <div className={`${GRADE_SISTEMAS} animate-fade-in pt-6`}>
                    {geral.links.map((link) => (
                      <CardSistema key={link.id} link={link} />
                    ))}
                  </div>
                )}
              </div>
            )}
            <Secao titulo={categoriaAtiva.nome} links={categoriaAtiva.links} />
          </div>
        ) : geral ? (
          <Secao titulo="Geral" links={geral.links} />
        ) : (
          !erro && <p className="py-12 text-center text-gray-500">Nenhum sistema cadastrado ainda.</p>
        )}
      </main>
    </>
  );
}
