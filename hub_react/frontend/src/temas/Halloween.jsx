import { useId, useState } from 'react';
import { Travessia } from './Personagens';
import Quadros from './Quadros';

// Halloween: boneco de abóbora correndo pelo topo (com chapéu de bruxa, capa e
// baldinho de doces), perseguido por um morceguinho; aranhas penduradas
// abaixo do cabeçalho que sobem ao passar o mouse.

const ROXO = '#4c1d95';
const ROXO_ESCURO = '#2e1065';
const LARANJA = '#f97316';

/**
 * Morceguinho, ~44×26 a partir de (0, 0). `pose` 0/1: asas para cima / para baixo
 * e corpo um pouco mais alto (alternadas pelo componente Quadros).
 */
function Morcego({ x, y, escala = 1, pose = 0 }) {
  const asa = 'M0 0 C-6 -8 -16 -10 -22 -4 C-18 -4 -16 -1 -17 2 C-13 0 -10 1 -9 4 C-6 1 -3 1 0 3 Z';
  const giroAsa = pose ? 20 : -26;
  return (
    <g transform={`translate(${x} ${y - (pose ? 2 : 0)}) scale(${escala})`}>
      <g transform={`translate(-5 0) rotate(${giroAsa})`}>
        <path d={asa} fill={ROXO_ESCURO} />
      </g>
      <g transform={`translate(5 0) scale(-1 1) rotate(${giroAsa})`}>
        <path d={asa} fill={ROXO_ESCURO} />
      </g>
      <ellipse cx="0" cy="1" rx="6" ry="7" fill={ROXO_ESCURO} />
      <path d="M-5 -4 L-6 -10 L-2 -6 Z M5 -4 L6 -10 L2 -6 Z" fill={ROXO_ESCURO} />
      <circle cx="-2.2" cy="-0.5" r="1.6" fill="#fde047" />
      <circle cx="2.2" cy="-0.5" r="1.6" fill="#fde047" />
      <path d="M-1.6 3.5 L-0.8 5.2 L0 3.8 L0.8 5.2 L1.6 3.5" stroke="white" strokeWidth=".8" fill="none" />
    </g>
  );
}

/**
 * O boneco de abóbora correndo para a direita, numa das duas poses do passo:
 * pernas e braços em posições opostas, corpo quicando, capa ondulando e o
 * rosto aceso tremulando. Nada é animado dentro do SVG (ver Quadros).
 */
function DesenhoAbobora({ pose = 0 }) {
  const id = useId().replace(/:/g, '');
  const angulo = (grupo) => ((grupo === 0) === (pose === 0) ? 26 : -26);
  // perna + tênis giram juntos a partir do quadril
  const perna = (x, grupo) => (
    <g transform={`rotate(${angulo(grupo)} ${x} 82)`}>
      <path d={`M${x} 82 l1 15`} stroke={ROXO_ESCURO} strokeWidth="4.2" strokeLinecap="round" />
      <path d={`M${x - 2.5} 96 h7.5 a3.4 3.4 0 0 1 0 6.4 h-8.5 a2.6 2.6 0 0 1 1 -6.4 Z`} fill="white" stroke="#1f2937" strokeWidth=".8" />
      <path d={`M${x - 2.8} 101.2 h11`} stroke={LARANJA} strokeWidth="1.4" />
    </g>
  );
  const braco = (x, grupo, comBalde) => (
    <g transform={`rotate(${angulo(grupo)} ${x} 68)`}>
      <path d={`M${x} 68 l2 14`} stroke={ROXO} strokeWidth="3.6" strokeLinecap="round" />
      <circle cx={x + 2} cy="83.5" r="2.8" fill="white" />
      {comBalde && (
        <g transform={`translate(${x + 2} 84)`}>
          {/* baldinho de doces em forma de abóbora */}
          <path d="M-7 0 Q0 -8 7 0" stroke="#1f2937" strokeWidth="1.2" fill="none" />
          <path d="M-8 1 Q-8 11 0 11 Q8 11 8 1 Z" fill={LARANJA} />
          <path d="M-4 4 L-2.5 6 M2.5 4 L4 6 M-3 8 Q0 9.5 3 8" stroke="#7c2d12" strokeWidth="1.1" strokeLinecap="round" fill="none" />
          <circle cx="-3" cy="-0.5" r="2" fill="#ec4899" />
          <circle cx="2" cy="-1.2" r="2" fill="#22c55e" />
          <circle cx="5" cy="0" r="1.6" fill="#facc15" />
        </g>
      )}
    </g>
  );

  return (
    <svg viewBox="0 0 176 112" className="h-full w-full overflow-visible" style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }}>
      <defs>
        <radialGradient id={`${id}-ab`} cx=".38" cy=".35" r=".75">
          <stop offset="0" stopColor="#fdba74" />
          <stop offset=".5" stopColor="#f97316" />
          <stop offset="1" stopColor="#c2410c" />
        </radialGradient>
        <radialGradient id={`${id}-luz`}>
          <stop offset="0" stopColor="#fef9c3" />
          <stop offset="1" stopColor="#facc15" />
        </radialGradient>
      </defs>

      {/* morceguinho vindo atrás */}
      <Morcego x={22} y={30} escala={1.15} pose={pose} />

      <g transform={`translate(0 ${pose ? -2.5 : 0})`}>
        {/* capa voando para trás (ondula entre as poses) */}
        <path
          d={pose
            ? 'M98 66 C82 66 70 70 61 80 C71 79 77 83 83 88 C88 82 94 79 104 78 Z'
            : 'M98 66 C82 68 70 74 62 86 C72 84 78 88 84 92 C88 84 94 80 104 78 Z'}
          fill="#7e22ce"
        />
        {/* perna e braço de trás */}
        {perna(98, 1)}
        {braco(97, 0, false)}
        {/* tronco */}
        <rect x="94" y="64" width="20" height="21" rx="8" fill={ROXO} />
        <rect x="94" y="76" width="20" height="3" fill={LARANJA} />
        {/* perna e braço da frente (com o balde) */}
        {perna(108, 0)}
        {braco(111, 1, true)}

        {/* cabeça de abóbora */}
        <g transform="translate(104 40)">
          <ellipse cx="0" cy="0" rx="28" ry="23" fill={`url(#${id}-ab)`} />
          <path d="M-9 -22 C-15 -10 -15 10 -9 22 M9 -22 C15 -10 15 10 9 22 M0 -23 V23" stroke="#c2410c" strokeWidth="1.6" fill="none" opacity=".55" />
          {/* rosto entalhado, aceso por dentro (tremula entre as poses) */}
          <g opacity={pose ? 0.78 : 1} style={{ filter: 'drop-shadow(0 0 3px #fde047)' }}>
            <path d="M-15 -6 L-7 -6 L-11 -14 Z" fill={`url(#${id}-luz)`} />
            <path d="M5 -6 L13 -6 L9 -14 Z" fill={`url(#${id}-luz)`} />
            <path d="M-2 -1 L2 -1 L0 -5 Z" fill={`url(#${id}-luz)`} />
            <path d="M-17 4 Q0 18 17 4 L13 5 L10 9 L6 6 L2 11 L-2 6 L-6 11 L-10 6 L-13 7 Z" fill={`url(#${id}-luz)`} />
          </g>
          {/* chapéu de bruxa inclinado */}
          <g transform="rotate(-12) translate(-2 -19)">
            <ellipse cx="0" cy="0" rx="24" ry="5" fill={ROXO_ESCURO} />
            <path d="M-13 -1 C-10 -14 -4 -28 6 -34 C3 -27 8 -22 14 -24 C8 -18 10 -8 13 -1 Z" fill={ROXO} />
            <path d="M-12.5 -3 C-4 -1 4 -1 12.8 -3 L12.4 -7 C4 -5 -4 -5 -11.6 -7 Z" fill={LARANJA} />
            <path d="M14 -24 l2 -1.2 l-0.6 2.2 l1.8 1.3 l-2.2 0.1 l-0.8 2.1 l-0.6 -2.2 l-2.2 -0.3 l1.9 -1.2 l-0.4 -2.2 Z" fill="#fde047" />
          </g>
        </g>
      </g>
    </svg>
  );
}

export function AboboraCorrendo({ estatico }) {
  return (
    <Travessia duracao={20} estatico={estatico}>
      <div
        className={
          estatico
            ? 'absolute top-1/2 -left-[44px] h-[40px] w-[64px] -translate-y-1/2'
            : 'absolute bottom-0.5 left-0 h-[54px] w-[85px] sm:h-[74px] sm:w-[116px]' // pés apoiados na base do cabeçalho
        }
      >
        <Quadros
          estatico={estatico}
          duracao={0.42}
          className="h-full w-full"
          poses={[<DesenhoAbobora key="a" pose={0} />, <DesenhoAbobora key="b" pose={1} />]}
        />
      </div>
    </Travessia>
  );
}

// --- Aranhas penduradas -----------------------------------------------------

function DesenhoAranha() {
  const pernas = [-1, 1].map((lado) => (
    <g key={lado} transform={`scale(${lado} 1)`} stroke="#1c1427" strokeWidth="1.6" strokeLinecap="round" fill="none">
      <path d="M5 -2 L12 -9 L16 -4" />
      <path d="M6 0 L14 -3 L18 2" />
      <path d="M6 2 L13 4 L16 10" />
      <path d="M5 4 L10 9 L11 15" />
    </g>
  ));
  return (
    <svg viewBox="-20 -14 40 32" className="h-full w-full overflow-visible" style={{ filter: 'drop-shadow(0 2px 1.5px rgba(0,0,0,0.25))' }}>
      {pernas}
      <ellipse cx="0" cy="3" rx="7.5" ry="8" fill="#2a1d3a" />
      <circle cx="0" cy="-5" r="5.2" fill="#3b2a52" />
      <path d="M-1.6 4 L1.6 4 L0 7 Z M-1.6 10 L1.6 10 L0 7 Z" fill={LARANJA} />
      <circle cx="-2" cy="-5.5" r="1.9" fill="white" />
      <circle cx="2" cy="-5.5" r="1.9" fill="white" />
      <circle cx="-1.7" cy="-5.1" r=".9" fill="#1c1427" />
      <circle cx="2.3" cy="-5.1" r=".9" fill="#1c1427" />
      <path d="M-1.8 -2.2 Q0 -0.8 1.8 -2.2" stroke="white" strokeWidth=".7" fill="none" />
    </svg>
  );
}

function AranhaPendurada({ aranha, efeitos, mini }) {
  const [subindo, setSubindo] = useState(false);
  const fio = mini ? aranha.fio / 3 : aranha.fio;
  const tamanho = mini ? 14 : 34;
  const assustar = () => !subindo && setSubindo(true);
  return (
    <div className="absolute top-0" style={{ left: mini ? aranha.mini : aranha.left }}>
      <div
        className={subindo ? 'animate-recolher' : efeitos ? 'animate-ioio' : ''}
        style={{ '--sobe': `${-(fio + tamanho + 14)}px`, animationDelay: subindo ? '0s' : `${aranha.atraso}s` }}
        onAnimationEnd={() => setSubindo(false)}
      >
        <div className="mx-auto w-px bg-slate-400/80" style={{ height: fio }} />
        <div
          className="pointer-events-auto -mt-1 -translate-x-[calc(50%-0.5px)] cursor-pointer"
          style={{ width: tamanho, height: tamanho * 0.8 }}
          onMouseEnter={assustar}
          onClick={assustar}
        >
          <DesenhoAranha />
        </div>
      </div>
    </div>
  );
}

// mesmas regras dos ovos de Páscoa: longe das setas e do texto do banner
const ARANHAS = [
  { left: '5%', fio: 22, atraso: 0, onde: 'desktop', mini: '6%' },
  { left: '13%', fio: 52, atraso: -1.2, onde: 'desktop', mini: '14%' },
  { left: '88%', fio: 40, atraso: -2.1, onde: 'desktop', mini: '88%' },
  { left: '95%', fio: 16, atraso: -0.6, onde: 'desktop', mini: '95%' },
  { left: '22%', fio: 12, atraso: -0.9, onde: 'celular' },
  { left: '78%', fio: 18, atraso: -1.8, onde: 'celular' },
];
const VISIBILIDADE = { desktop: 'hidden sm:block', celular: 'sm:hidden' };

/** Fica logo abaixo do cabeçalho; o recorte faz a aranha "entrar" no cabeçalho ao subir. */
export function AranhasPenduradas({ efeitos = true, mini = false }) {
  const lista = mini ? ARANHAS.filter((a) => a.mini) : ARANHAS;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-20 h-0 select-none"
      style={{ clipPath: 'inset(0 -100vw -100vh -100vw)' }}
    >
      {lista.map((a) => (
        <div key={a.left} className={mini ? '' : VISIBILIDADE[a.onde]}>
          <AranhaPendurada aranha={a} efeitos={efeitos && !mini} mini={mini} />
        </div>
      ))}
    </div>
  );
}
