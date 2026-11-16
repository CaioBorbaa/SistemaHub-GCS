import Particulas from './Particulas';

// Enfeites que caem devagar no fundo (só quando "efeitos animados" está ligado).

const PASTEIS = ['#fbcfe8', '#ddd6fe', '#bbf7d0', '#fef08a', '#bae6fd'];

export function EfeitoPascoa() {
  return (
    <Particulas
      quantidade={16}
      duracao={[22, 38]}
      tamanho={[7, 11]}
      giro={90}
      renderizar={(i) => (
        <span className="block h-full w-[78%] rounded-[50%_50%_50%_50%/60%_60%_40%_40%]" style={{ background: PASTEIS[i % PASTEIS.length] }} />
      )}
    />
  );
}

export function EfeitoNatal() {
  return (
    <Particulas
      quantidade={32}
      duracao={[16, 30]}
      tamanho={[4, 8]}
      renderizar={() => <span className="block size-full rounded-full bg-sky-200/80" />}
    />
  );
}

export function EfeitoAnoNovo() {
  return (
    <Particulas
      quantidade={18}
      duracao={[20, 34]}
      tamanho={[8, 13]}
      giro={180}
      renderizar={(i) => (
        <svg viewBox="-10 -10 20 20" className="size-full">
          <path d="M0 -10 Q0 0 10 0 Q0 0 0 10 Q0 0 -10 0 Q0 0 0 -10 Z" fill={i % 3 ? '#fcd34d' : '#c4b5fd'} opacity="0.75" />
        </svg>
      )}
    />
  );
}

const PAPEIS = ['#fca5a5', '#fde047', '#93c5fd', '#86efac', '#fdba74', '#f9a8d4'];

/** Festa Junina: pedacinhos de papel colorido caindo devagar. */
export function EfeitoJunina() {
  return (
    <Particulas
      quantidade={18}
      duracao={[20, 34]}
      tamanho={[6, 9]}
      giro={240}
      renderizar={(i) => <span className="block h-full w-full rounded-[1px] opacity-80" style={{ background: PAPEIS[i % PAPEIS.length] }} />}
    />
  );
}

/** Festa Julina: pipocas caindo. */
export function EfeitoJulina() {
  return (
    <Particulas
      quantidade={16}
      duracao={[18, 30]}
      tamanho={[10, 14]}
      giro={160}
      renderizar={() => (
        <svg viewBox="-7 -8 14 14" className="size-full">
          <g fill="#fffbeb" stroke="#fcd34d" strokeWidth=".9">
            <circle cx="-2.6" cy="0" r="3.2" /><circle cx="2.6" cy="-0.8" r="3" /><circle cx="0" cy="-3.6" r="2.9" /><circle cx="0.8" cy="2.2" r="2.7" />
          </g>
        </svg>
      )}
    />
  );
}

const FOLHAS = ['#ea580c', '#c2410c', '#d97706', '#9f1239', '#a16207'];

/** Halloween: folhas de outono caindo e girando. */
export function EfeitoHalloween() {
  return (
    <Particulas
      quantidade={16}
      duracao={[18, 30]}
      tamanho={[11, 16]}
      giro={300}
      renderizar={(i) => (
        <svg viewBox="-8 -9 16 18" className="size-full opacity-60">
          <path d="M0 -8 C5 -6 7 -1 5 4 C3 7 1 8 0 9 C-1 8 -3 7 -5 4 C-7 -1 -5 -6 0 -8 Z" fill={FOLHAS[i % FOLHAS.length]} />
          <path d="M0 -6 V9 M0 -1 L3 -3 M0 3 L-3 1" stroke="#fff7ed" strokeWidth=".7" opacity=".6" fill="none" />
        </svg>
      )}
    />
  );
}
