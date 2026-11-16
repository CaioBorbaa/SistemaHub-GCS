// Estampas de fundo dos temas: SVGs pequenos que se repetem pela página.
// As cores são tons 100–200 do Tailwind e a opacidade é baixa, para o tema
// ficar só "no clima", sem competir com os ícones dos sistemas.

const comoUrl = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

const tile = (tamanho, opacidade, conteudo) =>
  comoUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='${tamanho}' height='${tamanho}' viewBox='0 0 ${tamanho} ${tamanho}'><g opacity='${opacidade}'>${conteudo}</g></svg>`);

// --- Páscoa: ovinhos pastel com detalhes brancos ---------------------------

const ovo = (x, y, giro, escala, cor, detalhe) =>
  `<g transform='translate(${x} ${y}) rotate(${giro}) scale(${escala})'>
     <path d='M0 -15 C8 -15 12 -3 12 4 C12 11 7 15 0 15 C-7 15 -12 11 -12 4 C-12 -3 -8 -15 0 -15 Z' fill='${cor}'/>
     ${detalhe}
   </g>`;
const zigue = `<path d='M-11 1 l3.7 -3 3.7 3 3.7 -3 3.7 3 3.7 -3 3.7 3' stroke='white' stroke-width='1.8' fill='none' stroke-linejoin='round'/>`;
const faixa = `<path d='M-11.5 5 H11.5' stroke='white' stroke-width='2.4'/><circle cy='-5' r='1.8' fill='white'/>`;
const pontos = `<circle cx='-4' cy='-2' r='1.6' fill='white'/><circle cx='4' cy='2' r='1.6' fill='white'/><circle cx='-2' cy='8' r='1.4' fill='white'/>`;

export const ESTAMPA_PASCOA = tile(200, 0.6, [
  ovo(40, 44, -14, 1, '#fbcfe8', zigue),
  ovo(148, 104, 12, 0.9, '#ddd6fe', faixa),
  ovo(70, 160, 6, 0.85, '#bbf7d0', pontos),
  ovo(168, 26, -8, 0.7, '#fef08a', faixa),
  `<circle cx='104' cy='40' r='2.5' fill='#f9a8d4'/><circle cx='20' cy='112' r='2' fill='#c4b5fd'/>`,
  `<circle cx='124' cy='176' r='2.5' fill='#fde68a'/><circle cx='190' cy='160' r='2' fill='#86efac'/>`,
].join(''));

// --- Natal: flocos de neve e estrelinhas -----------------------------------

const floco = (x, y, r, cor) => {
  const bracos = [0, 60, 120]
    .map((g) => `<g transform='rotate(${g})'><path d='M0 ${-r} V${r} M${-r * 0.3} ${-r * 0.75} L0 ${-r * 0.5} L${r * 0.3} ${-r * 0.75} M${-r * 0.3} ${r * 0.75} L0 ${r * 0.5} L${r * 0.3} ${r * 0.75}'/></g>`)
    .join('');
  return `<g transform='translate(${x} ${y})' stroke='${cor}' stroke-width='1.5' stroke-linecap='round' fill='none'>${bracos}</g>`;
};
const estrela = (x, y, r, cor) =>
  `<path transform='translate(${x} ${y})' d='M0 ${-r} L${r * 0.3} ${-r * 0.3} L${r} 0 L${r * 0.3} ${r * 0.3} L0 ${r} L${-r * 0.3} ${r * 0.3} L${-r} 0 L${-r * 0.3} ${-r * 0.3} Z' fill='${cor}'/>`;

export const ESTAMPA_NATAL = tile(220, 0.85, [
  floco(44, 48, 13, '#bfdbfe'),
  floco(160, 120, 10, '#c7d2fe'),
  floco(80, 178, 8, '#bfdbfe'),
  estrela(150, 34, 6, '#fecaca'),
  estrela(26, 140, 5, '#bbf7d0'),
  estrela(198, 196, 5, '#fecaca'),
  `<circle cx='112' cy='78' r='2' fill='#bfdbfe'/><circle cx='200' cy='64' r='1.8' fill='#bbf7d0'/><circle cx='130' cy='210' r='1.8' fill='#fecaca'/>`,
].join(''));

// --- Ano Novo: brilhos dourados e lilás ------------------------------------

const brilho = (x, y, r, cor) =>
  `<path transform='translate(${x} ${y})' d='M0 ${-r} Q0 0 ${r} 0 Q0 0 0 ${r} Q0 0 ${-r} 0 Q0 0 0 ${-r} Z' fill='${cor}'/>`;

export const ESTAMPA_ANO_NOVO = tile(200, 0.85, [
  brilho(40, 40, 11, '#fde68a'),
  brilho(150, 96, 8, '#ddd6fe'),
  brilho(72, 150, 9, '#fde68a'),
  brilho(176, 22, 5, '#fbcfe8'),
  brilho(20, 104, 4, '#c7d2fe'),
  `<circle cx='110' cy='44' r='2' fill='#fcd34d'/><circle cx='186' cy='170' r='2.2' fill='#ddd6fe'/><circle cx='124' cy='186' r='1.6' fill='#fde68a'/>`,
].join(''));

// --- Festa Junina: milho, fogueirinha e bandeirinha -------------------------

const milho = (x, y, giro) =>
  `<g transform='translate(${x} ${y}) rotate(${giro})'>
     <path d='M0 -14 C6 -14 7 -4 6 6 C5 12 -5 12 -6 6 C-7 -4 -6 -14 0 -14 Z' fill='#fde68a'/>
     <path d='M-3 -8 H3 M-4 -3 H4 M-4 2 H4 M-3 7 H3' stroke='#fbbf24' stroke-width='1.2'/>
     <path d='M-6 4 C-12 0 -12 -10 -9 -14 C-8 -6 -5 0 -2 10 Z M6 4 C12 0 12 -10 9 -14 C8 -6 5 0 2 10 Z' fill='#bbf7d0'/>
   </g>`;
const fogueirinha = (x, y) =>
  `<g transform='translate(${x} ${y})'>
     <path d='M-9 6 L9 2 M-9 2 L9 6' stroke='#d6b896' stroke-width='3' stroke-linecap='round'/>
     <path d='M0 3 C-7 2 -7 -5 -2 -12 C-2 -6 1 -7 1 -14 C4 -8 8 -5 5 2 C4 4 2 4 0 3 Z' fill='#fed7aa'/>
   </g>`;
const bandeirinha = (x, y, cor) => `<path transform='translate(${x} ${y})' d='M-5 0 H5 V12 L0 8 L-5 12 Z' fill='${cor}'/>`;

export const ESTAMPA_JUNINA = tile(210, 0.85, [
  milho(42, 48, -18),
  fogueirinha(150, 110),
  milho(84, 168, 14),
  bandeirinha(160, 30, '#fecaca'), bandeirinha(176, 34, '#bfdbfe'),
  bandeirinha(24, 128, '#bbf7d0'), bandeirinha(40, 132, '#fef08a'),
  `<circle cx='110' cy='72' r='2' fill='#fdba74'/><circle cx='196' cy='176' r='2' fill='#fca5a5'/><circle cx='12' cy='198' r='1.8' fill='#93c5fd'/>`,
].join(''));

// --- Festa Julina: chapéu de palha, pipoca e estrelinha ---------------------

const chapeu = (x, y, giro) =>
  `<g transform='translate(${x} ${y}) rotate(${giro})'>
     <ellipse cx='0' cy='4' rx='17' ry='5' fill='#fde68a'/>
     <path d='M-9 3 C-9 -8 9 -8 9 3 Z' fill='#fcd34d'/>
     <path d='M-9 1 H9 V3.5 H-9 Z' fill='#fca5a5'/>
     <path d='M-13 5 L-11 3 M-6 7 L-5 5 M2 7 L3 5 M10 6 L11 4' stroke='#f59e0b' stroke-width='.9'/>
   </g>`;
const pipoca = (x, y) =>
  `<g transform='translate(${x} ${y})' fill='#fffbeb' stroke='#fde68a' stroke-width='.8'>
     <circle cx='-3' cy='0' r='3.6'/><circle cx='3' cy='-1' r='3.4'/><circle cx='0' cy='-4' r='3.2'/><circle cx='1' cy='2.5' r='3'/>
   </g>`;

export const ESTAMPA_JULINA = tile(210, 0.85, [
  chapeu(48, 46, -12),
  chapeu(150, 150, 10),
  pipoca(150, 54), pipoca(166, 64),
  pipoca(44, 150), pipoca(60, 162), pipoca(30, 168),
  estrela(110, 100, 6, '#bfdbfe'),
  estrela(196, 20, 5, '#fbcfe8'),
  estrela(96, 196, 5, '#ddd6fe'),
].join(''));

// --- Halloween: morceguinhos, abóboras e fantasminhas -----------------------

const morceguinho = (x, y, escala, cor) =>
  `<path transform='translate(${x} ${y}) scale(${escala})' d='M0 2 C-2 -2 -6 -2 -8 -5 C-10 -1 -14 -1 -16 -4 C-15 2 -10 5 -5 4 C-3 6 -1 6 0 8 C1 6 3 6 5 4 C10 5 15 2 16 -4 C14 -1 10 -1 8 -5 C6 -2 2 -2 0 2 Z' fill='${cor}'/>`;
const abobrinha = (x, y) =>
  `<g transform='translate(${x} ${y})'>
     <ellipse cx='0' cy='0' rx='11' ry='9' fill='#fed7aa'/>
     <path d='M-4 -9 C-7 -3 -7 3 -4 9 M4 -9 C7 -3 7 3 4 9' stroke='#fdba74' stroke-width='1.2' fill='none'/>
     <path d='M0 -9 C0 -12 1 -13 3 -14' stroke='#bbf7d0' stroke-width='2' stroke-linecap='round' fill='none'/>
   </g>`;
const fantasminha = (x, y) =>
  `<g transform='translate(${x} ${y})'>
     <path d='M-9 10 L-9 -2 C-9 -9 9 -9 9 -2 L9 10 L6 7 L3 10 L0 7 L-3 10 L-6 7 Z' fill='#f1f5f9'/>
     <circle cx='-3' cy='-1' r='1.3' fill='#cbd5e1'/><circle cx='3' cy='-1' r='1.3' fill='#cbd5e1'/>
   </g>`;

export const ESTAMPA_HALLOWEEN = tile(220, 0.9, [
  morceguinho(46, 40, 1, '#ddd6fe'),
  abobrinha(160, 70),
  fantasminha(70, 150),
  morceguinho(178, 176, 0.75, '#e9d5ff'),
  abobrinha(26, 206),
  `<circle cx='120' cy='22' r='2' fill='#fdba74'/><circle cx='206' cy='118' r='1.8' fill='#c4b5fd'/><circle cx='120' cy='120' r='1.6' fill='#fed7aa'/>`,
].join(''));
