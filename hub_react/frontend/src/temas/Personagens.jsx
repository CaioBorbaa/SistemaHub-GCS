import Quadros from './Quadros';

// Personagens que atravessam o cabeçalho (estilo do coelho do hub antigo).
// O cabeçalho continua na cor da marca: eles só passam por ele, por trás
// do relógio, da logo e do clima.

/**
 * Faz o personagem cruzar o cabeçalho da esquerda para a direita.
 * Em `estatico` (miniatura do painel), fica parado no meio.
 */
export function Travessia({ duracao = 26, estatico = false, children }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-y-0 select-none ${estatico ? 'left-[68%]' : 'left-0 animate-atravessar will-change-transform motion-reduce:hidden'}`}
      style={estatico ? undefined : { animationDuration: `${duracao}s` }}
    >
      {children}
    </div>
  );
}

// --- Páscoa ---------------------------------------------------------------

/** O GIF tem 400×300 e o coelho ocupa ~18% dele, com os pés a ~65% da altura. */
export function CoelhoCorrendo({ estatico }) {
  return (
    <Travessia duracao={28} estatico={estatico}>
      <img
        src="/temas/pascoa/bunny.gif"
        alt=""
        className={
          estatico
            ? 'absolute -top-[30px] -left-[70px] w-[130px] max-w-none'
            : 'absolute top-[-62px] left-0 w-[220px] max-w-none sm:top-[-64px] sm:w-[300px]'
        }
      />
    </Travessia>
  );
}

// --- Natal ----------------------------------------------------------------

const MARROM = '#8b5a2b';
const MARROM_ESCURO = '#5b3716';
const CHIFRE = '#4a2c10';
const DOURADO = '#fcd34d';

/**
 * Uma rena de perfil (virada para a direita), ~62×56 no próprio sistema de coordenadas.
 * `pose` 0/1: pernas em posições opostas e corpo um pouco mais alto — as duas poses
 * alternando (componente Quadros) fazem o galope sem animar nada dentro do SVG.
 */
function Rena({ x, pose, rudolph = false }) {
  const perna = (px, grupo) => {
    const angulo = (grupo === 0) === (pose === 0) ? 24 : -24;
    return <path d={`M${px} 35 l1 14`} transform={`rotate(${angulo} ${px} 35)`} stroke={MARROM_ESCURO} strokeWidth="2.6" strokeLinecap="round" />;
  };
  return (
    <g transform={`translate(${x} ${16 - (pose ? 2.5 : 0)})`}>
      {/* pernas de trás ficam atrás do corpo */}
      {perna(18, 1)}
      {perna(38, 0)}
      {/* corpo, rabo, arreio */}
      <ellipse cx="30" cy="31" rx="17" ry="8.5" fill={MARROM} />
      <ellipse cx="34" cy="34" rx="10" ry="4" fill="#a87442" opacity="0.6" />
      <circle cx="13" cy="27" r="3" fill="white" />
      <path d="M40 23.5 q2 7.5 0 15" stroke="#b91c1c" strokeWidth="3" fill="none" />
      <circle cx="41.5" cy="38" r="2" fill={DOURADO} />
      {/* pescoço e cabeça */}
      <path d="M38 27 Q44 22 48 12 L54 14 Q50 24 44 31 Z" fill={MARROM} />
      <ellipse cx="53" cy="12" rx="7" ry="5" fill={MARROM} transform="rotate(12 53 12)" />
      <ellipse cx="47.5" cy="7.5" rx="2.4" ry="1.4" fill={MARROM_ESCURO} transform="rotate(-30 47.5 7.5)" />
      <circle cx="54.5" cy="10" r="1.1" fill="#1f1308" />
      {/* nariz (o do Rudolph pisca entre as poses) */}
      <circle
        cx="60"
        cy="14"
        r={rudolph ? 2.6 : 1.8}
        fill={rudolph ? '#ef4444' : '#1f1308'}
        opacity={rudolph && pose ? 0.45 : 1}
        style={rudolph && !pose ? { filter: 'drop-shadow(0 0 3px #fca5a5)' } : undefined}
      />
      {/* chifres */}
      <path
        d="M50 7 L46 -1 M47.8 2.6 L43.5 1.2 M46.8 0.6 L46 -3.5 M53 6.5 L56 -1.5 M54.4 2.8 L58.8 1.6 M55.4 0 L55 -4"
        stroke={CHIFRE}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      {/* pernas da frente na frente do corpo */}
      {perna(22, 0)}
      {perna(42, 1)}
    </g>
  );
}

function Estrelinha({ x, y, r, acesa }) {
  return (
    <path
      d={`M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r} Z`}
      fill={DOURADO}
      opacity={acesa ? 1 : 0.35}
    />
  );
}

/** Desenho completo do trenó numa das duas poses. */
function DesenhoTreno({ pose }) {
  return (
    <svg viewBox="-34 -4 334 84" className="h-full w-full overflow-visible" style={{ filter: 'drop-shadow(0 1.5px 1px rgba(0,0,0,0.3))' }}>
      {/* rastro de estrelinhas (piscam alternando entre as poses) */}
      <Estrelinha x={-26} y={58} r={3.5} acesa={!pose} />
      <Estrelinha x={-12} y={46} r={2.6} acesa={!!pose} />
      <Estrelinha x={-16} y={70} r={2.2} acesa={!pose} />

      {/* rédeas: da mão do Papai Noel até cada rena */}
      <path d="M93 40 Q120 46 147 34 Q177 40 207 34 Q237 40 267 34" stroke={DOURADO} strokeWidth="1.3" fill="none" />

      {/* a rena do meio fica no passo contrário, para o galope não parecer sincronizado */}
      <Rena x={105} pose={pose} />
      <Rena x={165} pose={1 - pose} />
      <Rena x={225} pose={pose} rudolph />

      {/* saco de presentes */}
      <path d="M20 47 Q13 25 32 20 Q47 17 50 30 L50 47 Z" fill="#7c2d12" />
      <rect x="27" y="11" width="11" height="10" rx="1" fill="#16a34a" />
      <rect x="31.5" y="11" width="2" height="10" fill="#fde047" />
      <rect x="38" y="15" width="9" height="8" rx="1" fill="#2563eb" />
      <rect x="38" y="18" width="9" height="1.8" fill="#f9fafb" />

      {/* Papai Noel */}
      <rect x="56" y="27" width="22" height="22" rx="7" fill="#dc2626" />
      <rect x="56" y="40" width="22" height="3.5" fill="#1f2937" />
      <rect x="64.5" y="40" width="5" height="3.5" fill={DOURADO} />
      <circle cx="67" cy="20" r="6.8" fill="#fcd9b6" />
      <path d="M60 19.5 Q59.5 33 67 34 Q74.5 33 74 19.5 Q71 25 67 25 Q63 25 60 19.5 Z" fill="white" />
      <circle cx="70" cy="18" r="0.9" fill="#1f2937" />
      <path d="M59.5 16.5 Q60 6 70 8 Q74 9 75 16.5 Z" fill="#dc2626" />
      <path d="M61 10 Q55 6 51.5 9" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="51" cy="9.5" r="2.7" fill="white" />
      <rect x="58.5" y="15" width="17" height="3.8" rx="1.9" fill="white" />
      <path d="M75 33 L89 39" stroke="#dc2626" strokeWidth="5" strokeLinecap="round" />
      <circle cx="91" cy="40" r="2.8" fill="#1f2937" />

      {/* trenó */}
      <path d="M8 44 Q5 66 25 67 L85 67 Q98 67 100 52 L100 45 Q92 50 85 48 L32 48 Q22 41 8 44 Z" fill="#b91c1c" />
      <path d="M8 44 Q22 41 32 48 L85 48 Q92 50 100 45" stroke={DOURADO} strokeWidth="1.8" fill="none" />
      <path d="M20 58 H80" stroke={DOURADO} strokeWidth="1.2" strokeDasharray="2 3" opacity="0.8" />
      <path d="M30 67 V75 M75 67 V75" stroke={DOURADO} strokeWidth="2" />
      <path d="M2 75 H90 Q103 75 104 64" stroke={DOURADO} strokeWidth="2.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Papai Noel no trenó com três renas (Rudolph na frente), voando para a direita. */
export function TrenoPapaiNoel({ estatico }) {
  return (
    <Travessia duracao={22} estatico={estatico}>
      <div
        className={
          estatico
            ? 'absolute top-1/2 -left-[56px] h-[38px] w-[112px] -translate-y-1/2'
            : 'absolute top-1/2 left-0 h-[52px] w-[206px] -translate-y-1/2 sm:h-[66px] sm:w-[262px]'
        }
      >
        <div className={`h-full w-full ${estatico ? '' : 'animate-voo'}`}>
          <Quadros
            estatico={estatico}
            duracao={0.5}
            className="h-full w-full"
            poses={[<DesenhoTreno key="a" pose={0} />, <DesenhoTreno key="b" pose={1} />]}
          />
        </div>
      </div>
    </Travessia>
  );
}
