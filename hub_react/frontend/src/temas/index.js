import { ESTAMPA_ANO_NOVO, ESTAMPA_HALLOWEEN, ESTAMPA_JULINA, ESTAMPA_JUNINA, ESTAMPA_NATAL, ESTAMPA_PASCOA } from './estampas';

/**
 * Temas comemorativos. O cabeçalho e o rodapé ficam sempre na cor da marca;
 * o tema muda o fundo da página, a mensagem do rodapé e pode ter um
 * personagem atravessando o cabeçalho.
 * As regras de data ficam no backend (backend/src/temas.js) — um tema novo
 * precisa existir nos dois lugares.
 *
 * - fundo: degradê bem claro (classes Tailwind)
 * - estampa: SVG repetido por cima do degradê (ver estampas.js)
 * - carregar(): busca os componentes do tema (pacote em ./pacotes) só quando ele vai
 *   aparecer — quem usa o hub não baixa as animações de todos os temas. O pacote exporta:
 *   - Efeito: enfeites caindo devagar atrás do conteúdo, se "efeitos" estiver ligado
 *   - Personagem: animação no cabeçalho (coelho, trenó, fogos), se "efeitos" estiver ligado
 *   - Pendentes: enfeites pendurados logo abaixo do cabeçalho (ovos, bandeirinhas, aranhas)
 *   - Cenario / CenarioDireita: ilustrações nos cantos inferiores, em telas largas
 *     (árvore à esquerda, saco de presentes clicável à direita)
 */
export const TEMAS = {
  pascoa: {
    nome: 'Páscoa',
    emoji: '🐰',
    descricao: 'Coelho correndo no topo, ovos pendurados que balançam ao passar o mouse e fundo pastel.',
    periodoAuto: 'Calculado todo ano: 2 semanas antes do domingo de Páscoa até a segunda-feira seguinte.',
    mensagemPadrao: '🐰 Feliz Páscoa! 🥚',
    fundo: 'bg-linear-to-b from-pink-50 via-violet-50 to-sky-50',
    estampa: ESTAMPA_PASCOA,
    carregar: () => import('./pacotes/pascoa'),
  },
  'festa-junina': {
    nome: 'Festa Junina',
    emoji: '🌽',
    descricao: 'Bandeirinhas balançando, balões juninos cruzando o topo, fogueira com fagulhas e confete de papel.',
    periodoAuto: 'Todo ano de 01/06 a 30/06.',
    mensagemPadrao: '🌽 Arraiá do Hub! Viva São João! 🔥',
    fundo: 'bg-linear-to-b from-amber-50 via-orange-50 to-yellow-50',
    estampa: ESTAMPA_JUNINA,
    carregar: () => import('./pacotes/festa-junina'),
  },
  'festa-julina': {
    nome: 'Festa Julina',
    emoji: '🎉',
    descricao: 'Bandeirinhas triangulares, balões coloridos, fogueira e pipocas caindo no fundo.',
    periodoAuto: 'Todo ano de 01/07 a 31/07.',
    mensagemPadrao: '🎉 Arraiá Julino do Hub! 🌽',
    fundo: 'bg-linear-to-b from-sky-50 via-amber-50 to-rose-50',
    estampa: ESTAMPA_JULINA,
    carregar: () => import('./pacotes/festa-julina'),
  },
  halloween: {
    nome: 'Halloween',
    emoji: '🎃',
    descricao: 'Abóbora de chapéu de bruxa correndo no topo, aranhas que sobem ao passar o mouse, espantalho com corvo, fardos de feno e folhas de outono.',
    periodoAuto: 'Todo ano de 24/10 a 31/10.',
    mensagemPadrao: '🎃 Feliz Halloween! 👻',
    fundo: 'bg-linear-to-b from-orange-50 via-violet-50 to-slate-100',
    estampa: ESTAMPA_HALLOWEEN,
    carregar: () => import('./pacotes/halloween'),
  },
  natal: {
    nome: 'Natal',
    emoji: '🎄',
    descricao: 'Papai Noel no trenó cruzando o topo, árvore com galões Lukscolor e Futura, saco de presentes surpresa e neve no fundo.',
    periodoAuto: 'Todo ano de 01/12 a 26/12.',
    mensagemPadrao: '🎄 Feliz Natal! 🎅',
    fundo: 'bg-linear-to-b from-sky-50 via-slate-50 to-rose-50',
    estampa: ESTAMPA_NATAL,
    carregar: () => import('./pacotes/natal'),
  },
  'ano-novo': {
    nome: 'Ano Novo',
    emoji: '🎆',
    descricao: 'Fogos de artifício estourando no topo e brilhos dourados no fundo.',
    periodoAuto: 'Todo ano de 27/12 a 06/01.',
    mensagemPadrao: '🎆 Feliz Ano Novo! 🥂',
    fundo: 'bg-linear-to-b from-amber-50 via-white to-violet-50',
    estampa: ESTAMPA_ANO_NOVO,
    carregar: () => import('./pacotes/ano-novo'),
  },
};

/** Visual normal do hub, sem tema. */
export const TEMA_PADRAO = {};

/** Carrega os componentes de todos os temas (usado nas miniaturas do painel). */
export async function carregarTodosOsTemas() {
  const pares = await Promise.all(Object.entries(TEMAS).map(async ([id, t]) => [id, { ...(await t.carregar()) }]));
  return Object.fromEntries(pares);
}
