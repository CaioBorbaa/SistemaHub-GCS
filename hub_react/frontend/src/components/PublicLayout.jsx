import { useEffect, useRef, useState } from 'react';
import { Link, Outlet } from 'react-router';
import { Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TemaProvider, useTema } from '../temas/TemaContext';
import { usePausaForaDaTela } from '../lib/desempenho';
import Relogio from './Relogio';
import Clima from './Clima';
import MenuUsuario from './MenuUsuario';

/** Fundo do tema comemorativo: degradê claro + estampa + enfeites (atrás de tudo). */
function FundoTema({ tema }) {
  if (!tema.fundo) return null;
  const { Efeito } = tema;
  return (
    <>
      <div aria-hidden className={`pointer-events-none fixed inset-0 -z-20 ${tema.fundo}`}>
        <div className="absolute inset-0" style={{ backgroundImage: tema.estampa }} />
      </div>
      {Efeito && tema.efeitos && <Efeito />}
    </>
  );
}

const MARGEM_CENARIO = 32; // 16px da borda da tela + 16px de folga até o conteúdo
const CENARIO_MIN = 140;
const CENARIO_MAX = 240;

const SEM_ESPACO = { esquerda: 0, direita: 0 };
const caber = (livre) => (livre >= CENARIO_MIN ? Math.min(livre, CENARIO_MAX) : 0);

/**
 * Largura disponível para as ilustrações do tema nas faixas livres à esquerda
 * e à direita do conteúdo (`<main>`). Cada lado vale 0 quando não há espaço,
 * para nunca cobrir os ícones em telas menores.
 */
function useLarguraCenario(ativo) {
  const areaConteudo = useRef(null);
  const [largura, setLargura] = useState(SEM_ESPACO);

  useEffect(() => {
    const area = areaConteudo.current;
    if (!ativo || !area) return setLargura(SEM_ESPACO);
    const medir = () => {
      const main = area.querySelector('main');
      if (!main) return setLargura(SEM_ESPACO);
      const m = main.getBoundingClientRect();
      const a = area.getBoundingClientRect();
      const estilo = getComputedStyle(main);
      const esquerda = caber(m.left - a.left + parseFloat(estilo.paddingLeft) - MARGEM_CENARIO);
      const direita = caber(a.right - m.right + parseFloat(estilo.paddingRight) - MARGEM_CENARIO);
      setLargura((atual) => (atual.esquerda === esquerda && atual.direita === direita ? atual : { esquerda, direita }));
    };
    medir();
    const tamanho = new ResizeObserver(medir); // tela redimensionada
    tamanho.observe(area);
    const conteudo = new MutationObserver(medir); // página terminou de carregar / trocou
    conteudo.observe(area, { childList: true });
    return () => {
      tamanho.disconnect();
      conteudo.disconnect();
    };
  }, [ativo]);

  return [areaConteudo, largura];
}

function Estrutura() {
  const { usuario } = useAuth();
  const tema = useTema();
  // o que fica à direita (saco de presentes) mostra produtos, então só para quem entrou
  const CenarioDireita = usuario ? tema.CenarioDireita : null;
  const [areaConteudo, larguraCenario] = useLarguraCenario(Boolean(tema.Cenario || CenarioDireita));
  // animações fora da tela ficam pausadas (economiza CPU em computadores modestos)
  const pausaTopo = usePausaForaDaTela();
  const pausaCantoEsquerdo = usePausaForaDaTela();
  const pausaCantoDireito = usePausaForaDaTela();

  return (
    <div className="relative isolate flex min-h-screen flex-col">
      <FundoTema tema={tema} />

      {tema.previa && (
        <div className="flex items-center justify-center gap-2 bg-gray-900 px-4 py-2 text-sm text-white">
          <Eye className="size-4" aria-hidden />
          Pré-visualização do tema {tema.nome} — só você está vendo.
          <Link to="/" className="font-semibold underline underline-offset-2">Sair da prévia</Link>
        </div>
      )}

      {/* Cabeçalho e rodapé ficam sempre na cor da marca, com ou sem tema */}
      <div ref={pausaTopo}>
        <header className="relative overflow-hidden bg-brand text-white shadow-lg">
          {/* Personagem do tema cruzando o topo, por trás do relógio/logo/clima */}
          {tema.Personagem && tema.efeitos && <tema.Personagem />}
          <div className="relative mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-2 sm:px-6">
            <div className="justify-self-start">
              <Relogio />
            </div>
            <Link to={usuario ? '/' : '/login'} className="justify-self-center">
              <img src="/images/logo.png" alt="Tintomax" className="h-9 sm:h-12" />
            </Link>
            <div className="justify-self-end">
              <Clima />
            </div>
          </div>
        </header>

        {/* Enfeites pendurados logo abaixo do cabeçalho (ex.: ovos de Páscoa) */}
        {tema.Pendentes && (
          <div className="relative">
            <tema.Pendentes efeitos={tema.efeitos} />
          </div>
        )}
      </div>

      <div ref={areaConteudo} className="relative flex flex-1 flex-col">
        <Outlet />
        {/* Ilustrações do tema: uma no canto inferior esquerdo (ex.: árvore de Natal)... */}
        {tema.Cenario && larguraCenario.esquerda > 0 && (
          <div ref={pausaCantoEsquerdo} className="pointer-events-none absolute bottom-4 left-4 -z-[5]" style={{ width: larguraCenario.esquerda }}>
            <tema.Cenario efeitos={tema.efeitos} className="block h-auto w-full" />
          </div>
        )}
        {/* ...e outra no canto inferior direito (ex.: saco de presentes, clicável) */}
        {CenarioDireita && larguraCenario.direita > 0 && (
          // acima do botão flutuante do usuário, que fica no canto
          <div ref={pausaCantoDireito} className="absolute right-4 bottom-20 z-10" style={{ width: Math.min(larguraCenario.direita, 210) }}>
            <CenarioDireita efeitos={tema.efeitos} className="block w-full" />
          </div>
        )}
      </div>

      <footer className="mt-auto w-full bg-brand py-4 text-center text-sm font-bold text-white">
        Desenvolvido pelo Setor de T.I.
        {tema.mensagem && <p className="mt-1 text-base">{tema.mensagem}</p>}
      </footer>

      {usuario && <MenuUsuario />}
    </div>
  );
}

export default function PublicLayout() {
  return (
    <TemaProvider>
      <Estrutura />
    </TemaProvider>
  );
}
