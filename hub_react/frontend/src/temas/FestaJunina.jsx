import { useId } from 'react';
import { Travessia } from './Personagens';
import Quadros from './Quadros';

// Festa Junina / Julina: bandeirinhas abaixo do cabeçalho, balões juninos
// cruzando o topo e uma fogueira no canto inferior esquerdo.
//
// DESEMPENHO: nada é animado dentro dos SVGs. O balanço das bandeirinhas, a
// chama dos balões e o fogo da fogueira são poses prontas alternadas pelo
// componente Quadros; as fagulhas são elementos HTML (placa de vídeo).

const PALETAS = {
  junina: {
    bandeiras: ['#ef4444', '#facc15', '#3b82f6', '#22c55e', '#f97316', '#ec4899'],
    baloes: [['#ef4444', '#facc15'], ['#3b82f6', '#f8fafc'], ['#22c55e', '#f97316']],
  },
  julina: {
    bandeiras: ['#a855f7', '#f97316', '#14b8a6', '#f43f5e', '#eab308', '#0ea5e9'],
    baloes: [['#a855f7', '#fde047'], ['#14b8a6', '#fb7185'], ['#f97316', '#0ea5e9']],
  },
};

// --- Bandeirinhas -----------------------------------------------------------

const LARGURA_VARAL = 260;
const BANDEIRAS_POR_VARAL = 8;

/**
 * SVG de um trecho do varal, repetido na horizontal como fundo.
 * `pose` 0/1: cada bandeira levemente inclinada para um lado ou para o outro.
 */
function varal(variante, pose) {
  const cores = PALETAS[variante].bandeiras;
  const yCurva = (t) => (1 - t) ** 2 * 3 + 2 * (1 - t) * t * 37 + t ** 2 * 3; // mesma curva da corda (Q com controle em y=37)
  const bandeiras = Array.from({ length: BANDEIRAS_POR_VARAL }, (_, i) => {
    const t = (i + 0.5) / BANDEIRAS_POR_VARAL;
    const x = LARGURA_VARAL * t;
    const balanco = (i % 2 === pose ? 1 : -1) * 4; // vizinhas balançam em sentidos opostos
    const inclinacao = (t - 0.5) * -30 + balanco; // acompanha a inclinação da corda
    const cor = cores[i % cores.length];
    const forma = variante === 'junina'
      ? `<path d="M-9 0 H9 V24 L0 17 L-9 24 Z" fill="${cor}"/><path d="M-9 0 H9 V3 H-9 Z" fill="#000" opacity=".12"/>`
      : `<path d="M-10 0 H10 L0 27 Z" fill="${cor}"/><circle cx="-3" cy="6" r="1.4" fill="#fff" opacity=".8"/><circle cx="3" cy="11" r="1.4" fill="#fff" opacity=".8"/><circle cx="0" cy="17" r="1.2" fill="#fff" opacity=".8"/>`;
    return `<g transform="translate(${x.toFixed(1)} ${yCurva(t).toFixed(1)}) rotate(${inclinacao.toFixed(1)})">${forma}</g>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${LARGURA_VARAL}" height="50" viewBox="0 0 ${LARGURA_VARAL} 50">
    <path d="M0 3 Q${LARGURA_VARAL / 2} 37 ${LARGURA_VARAL} 3" stroke="#8b5a2b" stroke-width="1.4" fill="none"/>${bandeiras}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function Bandeirinhas({ variante, efeitos = true, mini = false }) {
  const escala = mini ? 0.42 : 1;
  const camada = (pose) => (
    <div
      key={pose}
      className="h-full w-full"
      style={{
        backgroundImage: varal(variante, pose),
        backgroundRepeat: 'repeat-x',
        backgroundSize: `${LARGURA_VARAL * escala}px ${50 * escala}px`,
      }}
    />
  );
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-20 select-none"
      style={{ height: 50 * escala, filter: 'drop-shadow(0 2px 1.5px rgba(0,0,0,0.12))' }}
    >
      <Quadros estatico={!efeitos || mini} duracao={1.6} className="h-full w-full" poses={[camada(0), camada(1)]} />
    </div>
  );
}

export const BandeirinhasJuninas = (props) => <Bandeirinhas variante="junina" {...props} />;
export const BandeirinhasJulinas = (props) => <Bandeirinhas variante="julina" {...props} />;

// --- Balões juninos ---------------------------------------------------------

const FORMA_BALAO = 'M20 2 C31 2 38 11 38 21 C38 31 30 39 25 46 L15 46 C10 39 2 31 2 21 C2 11 9 2 20 2 Z';

/** Balão de papel; `pose` 0/1: chaminha maior / menor (alternadas dão o tremular). */
function Balao({ cores, pose = 0 }) {
  const id = useId().replace(/:/g, '');
  const [a, b] = cores;
  return (
    <svg viewBox="0 0 40 58" className="h-full w-full overflow-visible" style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.25))' }}>
      <defs>
        <clipPath id={`${id}-f`}><path d={FORMA_BALAO} /></clipPath>
        <linearGradient id={`${id}-luz`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".18" />
        </linearGradient>
      </defs>
      {/* gomos de papel colorido */}
      <g clipPath={`url(#${id}-f)`}>
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={i * 8} y="0" width="8" height="48" fill={i % 2 ? b : a} />)}
        <rect x="0" y="17" width="40" height="4" fill="#fff" opacity=".55" />
        <rect x="0" y="0" width="40" height="48" fill={`url(#${id}-luz)`} />
      </g>
      <path d={FORMA_BALAO} fill="none" stroke="#000" strokeOpacity=".15" strokeWidth=".8" />
      {/* boca e chaminha */}
      <rect x="15" y="45.5" width="10" height="3" rx="1" fill="#92400e" />
      <g transform={pose ? 'translate(20 48.5) scale(0.82 0.78) translate(-20 -48.5)' : undefined}>
        <path d="M20 48.5 C24 51.5 23.5 56 20 57.5 C16.5 56 16 51.5 20 48.5 Z" fill="#f59e0b" />
        <path d="M20 50.5 C22 52.5 21.8 55 20 56 C18.2 55 18 52.5 20 50.5 Z" fill="#fef08a" />
      </g>
    </svg>
  );
}

function Baloes({ variante, estatico = false }) {
  const cores = PALETAS[variante].baloes;
  const baloes = [
    { cor: cores[0], w: 30, h: 44, x: 0, top: '8%', atraso: 0 },
    { cor: cores[1], w: 22, h: 32, x: 40, top: '38%', atraso: -0.8 },
    { cor: cores[2], w: 26, h: 38, x: 72, top: '14%', atraso: -1.6 },
  ];
  return (
    <Travessia duracao={36} estatico={estatico}>
      <div className={estatico ? 'absolute inset-y-0 -left-[50px] w-[100px] scale-[0.62]' : 'absolute inset-y-0 left-0 w-[110px]'}>
        {baloes.map((b) => (
          <div
            key={b.x}
            className={`absolute ${estatico ? '' : 'animate-voo'}`}
            style={{ left: b.x, top: b.top, width: b.w, height: b.h, animationDelay: `${b.atraso}s` }}
          >
            <Quadros
              estatico={estatico}
              duracao={0.5}
              className="h-full w-full"
              poses={[<Balao key="a" cores={b.cor} pose={0} />, <Balao key="b" cores={b.cor} pose={1} />]}
            />
          </div>
        ))}
      </div>
    </Travessia>
  );
}

export const BaloesJuninos = (props) => <Baloes variante="junina" {...props} />;
export const BaloesJulinos = (props) => <Baloes variante="julina" {...props} />;

// --- Fogueira ---------------------------------------------------------------

const CHAMA = 'M0 0 C-38 -4 -42 -40 -16 -72 C-17 -50 -4 -52 0 -92 C9 -62 32 -60 25 -30 C36 -42 38 -20 33 -8 C27 0 13 2 0 0 Z';

// Variação de cada camada de chama em cada uma das 3 poses: [escala X, escala Y, inclinação]
const POSES_CHAMA = [
  [1, 1, 0],
  [0.94, 1.08, -3],
  [1.05, 0.94, 3],
];

// Fagulhas: posição em % da área da fogueira (viewBox 200×172)
const FAGULHAS = [
  [46, 41, 0], [54, 37, -0.7], [50, 34, -1.4], [43, 43, -2.1], [58, 42, -0.35], [48, 38, -1.75], [52, 44, -2.6],
];

/** Desenho da fogueira numa das 3 poses de chama. */
function DesenhoFogueira({ pose = 0 }) {
  const id = useId().replace(/:/g, '');
  const [sx, sy, giro] = POSES_CHAMA[pose];
  const chama = (escala, cor, i) => {
    // cada camada varia um pouco diferente, para o fogo não pulsar "em bloco"
    const k = i % 2 ? 1 : -1;
    return (
      <g key={cor} transform={`scale(${escala}) rotate(${giro * k}) scale(${sx} ${sy})`}>
        <path d={CHAMA} fill={cor} />
      </g>
    );
  };
  return (
    <svg viewBox="0 0 200 172" className="block h-auto w-full">
      <defs>
        <radialGradient id={`${id}-brilho`}>
          <stop offset="0" stopColor="#fb923c" stopOpacity=".45" />
          <stop offset="1" stopColor="#fb923c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-tora`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9a6331" />
          <stop offset="1" stopColor="#5b3716" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="140" rx="98" ry="40" fill={`url(#${id}-brilho)`} opacity={pose === 1 ? 0.7 : 1} />

      {/* pedras */}
      {[[38, 160], [58, 165], [80, 168], [102, 169], [124, 168], [146, 165], [164, 160]].map(([x, y], i) => (
        <ellipse key={x} cx={x} cy={y} rx={11 - (i % 2) * 2} ry="6" fill={i % 2 ? '#9ca3af' : '#78716c'} />
      ))}

      {/* toras cruzadas */}
      <g transform="rotate(-15 100 146)">
        <rect x="40" y="138" width="120" height="16" rx="8" fill={`url(#${id}-tora)`} />
        <ellipse cx="156" cy="146" rx="5" ry="8" fill="#d6a46a" />
      </g>
      <g transform="rotate(15 100 146)">
        <rect x="40" y="138" width="120" height="16" rx="8" fill={`url(#${id}-tora)`} />
        <ellipse cx="44" cy="146" rx="5" ry="8" fill="#d6a46a" />
      </g>

      {/* chamas em quatro camadas */}
      <g transform="translate(100 140)">
        {chama(1, '#f97316', 0)}
        {chama(0.72, '#fb923c', 1)}
        {chama(0.56, '#fbbf24', 2)}
        {chama(0.42, '#fef08a', 3)}
      </g>
    </svg>
  );
}

export function Fogueira({ efeitos = true, className = '', style }) {
  return (
    <div className={`relative ${className}`} style={style} aria-hidden>
      <Quadros
        estatico={!efeitos}
        duracao={0.45}
        poses={[0, 1, 2].map((p) => <DesenhoFogueira key={p} pose={p} />)}
      />
      {/* fagulhas subindo (elementos HTML: animação na placa de vídeo) */}
      {efeitos &&
        FAGULHAS.map(([x, y, atraso], i) => (
          <span
            key={i}
            className="absolute rounded-full motion-reduce:hidden"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: 4 + (i % 2) * 2,
              height: 4 + (i % 2) * 2,
              background: i % 2 ? '#fde047' : '#fb923c',
              animation: `${i % 2 ? 'subir-2' : 'subir'} ${2.2 + (i % 3) * 0.5}s linear ${atraso}s infinite`,
            }}
          />
        ))}
    </div>
  );
}
