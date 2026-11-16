import { useId, useState } from 'react';

// Ovos de Páscoa pendurados logo abaixo do cabeçalho, nas laterais (fora do
// caminho das setas do banner). Ao passar o mouse — ou tocar, no celular —
// o ovo balança como um pêndulo.

const PALETAS = {
  rosa: { base: '#f472b6', claro: '#fbcfe8', escuro: '#db2777', detalhe: '#fff7fb', fita: '#a78bfa' },
  lilas: { base: '#a78bfa', claro: '#ddd6fe', escuro: '#7c3aed', detalhe: '#fef9c3', fita: '#f472b6' },
  menta: { base: '#34d399', claro: '#bbf7d0', escuro: '#059669', detalhe: '#ffffff', fita: '#fbbf24' },
  amarelo: { base: '#fbbf24', claro: '#fef3c7', escuro: '#d97706', detalhe: '#ffffff', fita: '#38bdf8' },
  azul: { base: '#38bdf8', claro: '#e0f2fe', escuro: '#0284c7', detalhe: '#fff1f2', fita: '#34d399' },
};

// Contorno do ovo (mais estreito em cima), 44×56, com o topo em (22, 6)
const FORMA = 'M22 6 C33 6 41 22 41 36 C41 49 32.5 58 22 58 C11.5 58 3 49 3 36 C3 22 11 6 22 6 Z';

const PADROES = {
  zigue: (c) => (
    <>
      <path d="M2 30 l5 -5 5 5 5 -5 5 5 5 -5 5 5 5 -5 5 5" stroke={c.detalhe} strokeWidth="2.6" fill="none" strokeLinejoin="round" />
      <path d="M3 41 H41" stroke={c.claro} strokeWidth="3.5" />
      <circle cx="22" cy="49" r="2" fill={c.detalhe} />
    </>
  ),
  bolinhas: (c) => (
    <>
      {[[14, 22], [27, 20], [10, 35], [22, 32], [34, 35], [15, 47], [29, 47]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.6" fill={c.detalhe} />
      ))}
    </>
  ),
  faixas: (c) => (
    <>
      <path d="M4 26 Q22 32 40 26" stroke={c.detalhe} strokeWidth="3" fill="none" />
      <path d="M3 36 Q22 42 41 36" stroke={c.claro} strokeWidth="4.5" fill="none" />
      <path d="M4 46 Q22 52 40 46" stroke={c.detalhe} strokeWidth="3" fill="none" />
    </>
  ),
  flores: (c) => (
    <>
      {[[22, 24], [12, 40], [32, 40]].map(([x, y]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
          {[0, 72, 144, 216, 288].map((g) => (
            <ellipse key={g} cx="0" cy="-3.2" rx="1.9" ry="3" fill={c.detalhe} transform={`rotate(${g})`} />
          ))}
          <circle r="1.6" fill={c.escuro} />
        </g>
      ))}
    </>
  ),
};

function Ovo({ paleta, padrao }) {
  const id = useId().replace(/:/g, '');
  const c = PALETAS[paleta];
  return (
    <svg viewBox="0 0 44 60" className="block h-full w-full overflow-visible" style={{ filter: 'drop-shadow(0 3px 3px rgba(0,0,0,0.18))' }}>
      <defs>
        <radialGradient id={`${id}-cor`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor={c.claro} />
          <stop offset="45%" stopColor={c.base} />
          <stop offset="100%" stopColor={c.escuro} />
        </radialGradient>
        <clipPath id={`${id}-forma`}>
          <path d={FORMA} />
        </clipPath>
      </defs>
      <path d={FORMA} fill={`url(#${id}-cor)`} />
      <g clipPath={`url(#${id}-forma)`} opacity="0.95">{PADROES[padrao](c)}</g>
      {/* brilho */}
      <ellipse cx="14" cy="20" rx="4" ry="7" fill="white" opacity="0.45" transform="rotate(20 14 20)" />
      {/* laço de fita no topo */}
      <g transform="translate(22 6)">
        <path d="M0 0 C-7 -7 -12 -1 -6 2 Z" fill={c.fita} />
        <path d="M0 0 C7 -7 12 -1 6 2 Z" fill={c.fita} />
        <path d="M-1 1 L-4 7 M1 1 L4 7" stroke={c.fita} strokeWidth="1.6" strokeLinecap="round" />
        <circle r="2" fill={c.fita} stroke="white" strokeWidth="0.6" />
      </g>
    </svg>
  );
}

function OvoPendurado({ ovo, efeitos, mini }) {
  const [balancando, setBalancando] = useState(0); // muda a key para reiniciar a animação

  const balancar = () => setBalancando((n) => (n > 0 ? n : n + 1));
  const animacao = balancando ? 'animate-pendulo' : efeitos ? 'animate-balanco-suave' : '';

  return (
    <div
      className={`absolute top-0 origin-top ${animacao}`}
      style={{ left: mini ? ovo.mini : ovo.left, animationDelay: balancando ? '0s' : `${ovo.atraso}s` }}
      onAnimationEnd={() => setBalancando(0)}
    >
      {/* fita que segura o ovo */}
      <div className="mx-auto w-px bg-linear-to-b from-white/90 to-pink-200" style={{ height: mini ? ovo.fio / 3 : ovo.fio }} />
      <div
        className={`pointer-events-auto -mt-0.5 -translate-x-[calc(50%-0.5px)] ${mini ? 'h-[22px] w-4' : 'h-[50px] w-[36px] sm:h-[58px] sm:w-[42px]'}`}
        onMouseEnter={balancar}
        onClick={balancar}
      >
        <Ovo paleta={ovo.paleta} padrao={ovo.padrao} />
      </div>
    </div>
  );
}

// Posições escolhidas para não cobrir o texto do banner nem as setas dele.
// onde: 'desktop' (sm+), 'celular' (< sm) ou 'sempre'; mini = posição na miniatura do painel.
const OVOS = [
  { left: '5%', fio: 16, paleta: 'rosa', padrao: 'zigue', atraso: 0, onde: 'desktop', mini: '5%' },
  { left: '13%', fio: 46, paleta: 'menta', padrao: 'flores', atraso: -1.3, onde: 'desktop', mini: '12%' },
  { left: '87%', fio: 40, paleta: 'azul', padrao: 'bolinhas', atraso: -0.9, onde: 'desktop', mini: '88%' },
  { left: '95%', fio: 18, paleta: 'lilas', padrao: 'faixas', atraso: -2.1, onde: 'desktop', mini: '95%' },
  { left: '22%', fio: 10, paleta: 'amarelo', padrao: 'bolinhas', atraso: -0.6, onde: 'celular' },
  { left: '78%', fio: 10, paleta: 'rosa', padrao: 'flores', atraso: -1.7, onde: 'celular' },
];

const VISIBILIDADE = { desktop: 'hidden sm:block', celular: 'sm:hidden', sempre: '' };

/** Fica logo abaixo do cabeçalho (precisa de um pai `relative`). */
export default function OvosPendurados({ efeitos = true, mini = false }) {
  const lista = mini ? OVOS.filter((o) => o.mini) : OVOS;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-20 h-0 select-none">
      {lista.map((o) => (
        <div key={o.left} className={mini ? '' : VISIBILIDADE[o.onde]}>
          <OvoPendurado ovo={o} efeitos={efeitos && !mini} mini={mini} />
        </div>
      ))}
    </div>
  );
}
