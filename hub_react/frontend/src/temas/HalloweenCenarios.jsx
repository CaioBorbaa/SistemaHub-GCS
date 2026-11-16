import { useId } from 'react';
import Quadros from './Quadros';

// Halloween nos cantos inferiores da página (mesmos lugares da árvore e do
// saco de presentes do Natal): espantalho com corvo à esquerda e fardos de
// feno com abóboras à direita.

const LARANJA = '#f97316';
const PALHA = '#e9c46a';
const PALHA_ESCURA = '#c99a2e';

/** Tufinho de palha: fios saindo de um ponto, abertos em leque. */
function Palha({ x, y, giro = 0, tamanho = 10, fios = 5 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${giro})`} strokeWidth="1.6" strokeLinecap="round">
      {Array.from({ length: fios }, (_, i) => {
        const ang = ((i - (fios - 1) / 2) * 16 * Math.PI) / 180;
        const comp = tamanho * (0.75 + (i % 2) * 0.3);
        return <line key={i} x1="0" y1="0" x2={Math.sin(ang) * comp} y2={Math.cos(ang) * comp} stroke={i % 2 ? PALHA : PALHA_ESCURA} />;
      })}
    </g>
  );
}

/** `apagada`: luz mais fraca — alternando com a acesa (Quadros) dá o efeito de vela tremulando. */
function Abobrinha({ x, y, escala = 1, acesa = false, apagada = false }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      <ellipse cx="0" cy="0" rx="14" ry="11" fill={LARANJA} />
      <path d="M-5 -10.5 C-9 -4 -9 4 -5 10.5 M5 -10.5 C9 -4 9 4 5 10.5" stroke="#c2410c" strokeWidth="1.3" fill="none" opacity=".6" />
      <path d="M0 -10 C0 -14 2 -16 5 -16" stroke="#4d7c0f" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      {acesa && (
        <g opacity={apagada ? 0.72 : 1} fill="#fde047" style={{ filter: 'drop-shadow(0 0 2.5px #facc15)' }}>
          <path d="M-7 -3 L-3 -3 L-5 -7 Z M3 -3 L7 -3 L5 -7 Z" />
          <path d="M-8 2 Q0 9 8 2 L5 3 L3 5.5 L0 3.5 L-3 5.5 L-5 3 Z" />
        </g>
      )}
    </g>
  );
}

// --- Espantalho -------------------------------------------------------------

/**
 * Espantalho balançando ao vento (o invólucro HTML gira — roda na placa de vídeo)
 * e alternando duas poses: corvo de cabeça erguida / bicando e abóbora com a luz
 * forte / fraca. Nada é animado dentro do SVG (ver Quadros).
 */
export function Espantalho({ efeitos = true, className = '', style }) {
  return (
    <div className={className} style={style} aria-hidden>
      <div className={efeitos ? 'animate-vento motion-reduce:animate-none' : undefined} style={{ transformOrigin: '50% 96%' }}>
        <Quadros
          estatico={!efeitos}
          duracao={2.6}
          poses={[<DesenhoEspantalho key="a" pose={0} />, <DesenhoEspantalho key="b" pose={1} />]}
        />
      </div>
    </div>
  );
}

function DesenhoEspantalho({ pose }) {
  const id = useId().replace(/:/g, '');
  const sorriso = [96, 101, 106, 111, 115];
  return (
    <svg viewBox="0 0 210 236" className="block h-auto w-full">
      <defs>
        {/* camisa xadrez (flanela) */}
        <pattern id={`${id}-xadrez`} width="14" height="14" patternUnits="userSpaceOnUse">
          <rect width="14" height="14" fill="#b45309" />
          <rect width="14" height="5" fill="#7c2d12" opacity=".55" />
          <rect width="5" height="14" fill="#7c2d12" opacity=".55" />
          <rect width="14" height="1.2" y="9" fill="#fbbf24" opacity=".55" />
          <rect width="1.2" height="14" x="9" fill="#fbbf24" opacity=".55" />
        </pattern>
        <radialGradient id={`${id}-estopa`} cx=".4" cy=".35" r=".75">
          <stop offset="0" stopColor="#f1dcae" />
          <stop offset="1" stopColor="#c9a66b" />
        </radialGradient>
      </defs>

      {/* chão com tufos de capim */}
      <ellipse cx="105" cy="226" rx="96" ry="8" fill="#0f172a" opacity=".08" />
      {[[30, 226], [62, 228], [150, 228], [182, 226]].map(([x, y]) => (
        <path key={x} d={`M${x - 8} ${y} q4 -12 6 -2 q2 -14 4 0 q3 -11 6 2`} stroke="#65a30d" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      ))}

      {/* estaca */}
      <rect x="100" y="70" width="10" height="158" rx="2" fill="#8b5a2b" />

      {/* o boneco balança ao vento a partir da base da estaca */}
      <g>
        {/* travessa dos braços */}
        <rect x="22" y="92" width="166" height="8" rx="2" fill="#9a6331" />

        {/* mangas com palha saindo dos punhos */}
        <path d="M30 88 L84 86 L84 108 L30 104 Z" fill={`url(#${id}-xadrez)`} />
        <path d="M126 86 L180 88 L180 104 L126 108 Z" fill={`url(#${id}-xadrez)`} />
        <Palha x={30} y={96} giro={90} tamanho={13} fios={6} />
        <Palha x={180} y={96} giro={-90} tamanho={13} fios={6} />

        {/* camisa com remendo e cinto de corda */}
        <path d="M80 84 C92 80 118 80 130 84 L136 150 C120 156 90 156 74 150 Z" fill={`url(#${id}-xadrez)`} />
        <g transform="rotate(8 120 119)">
          <rect x="112" y="112" width="16" height="14" rx="2" fill="#4d7c0f" />
          <rect x="112" y="112" width="16" height="14" rx="2" fill="none" stroke="#fef3c7" strokeWidth="1" strokeDasharray="2 1.6" />
        </g>
        <path d="M78 140 Q105 147 132 140" stroke="#d6b48a" strokeWidth="4" fill="none" />
        <path d="M104 144 l-3 9 M106 144 l3 9" stroke="#d6b48a" strokeWidth="2.4" strokeLinecap="round" />
        {/* palha saindo da barra da camisa */}
        {[80, 92, 104, 116, 128].map((x, i) => <Palha key={x} x={x} y={152} giro={(i - 2) * 6} tamanho={12} />)}

        {/* cabeça de saco de estopa */}
        <Palha x={92} y={78} giro={150} tamanho={9} />
        <Palha x={118} y={78} giro={-150} tamanho={9} />
        <circle cx="105" cy="58" r="23" fill={`url(#${id}-estopa)`} />
        <path d="M86 50 Q105 44 124 50 M84 62 Q105 58 126 62" stroke="#b08a52" strokeWidth=".8" fill="none" opacity=".6" />
        {/* olho de botão, olho costurado em X, nariz e sorriso costurado */}
        <circle cx="96" cy="56" r="3.8" fill="#1f2937" />
        <circle cx="95" cy="55" r="1" fill="#fff" opacity=".6" />
        <path d="M110 52.5 L117 59.5 M117 52.5 L110 59.5" stroke="#1f2937" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M102 62 L108 62 L105 67 Z" fill={LARANJA} />
        <path d="M92 70 Q105 79 118 70" stroke="#5b3716" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {sorriso.map((x, i) => (
          <path key={x} d={`M${x} ${69 + Math.sin((i / (sorriso.length - 1)) * Math.PI) * 3.6} v5`} stroke="#5b3716" strokeWidth="1.3" strokeLinecap="round" />
        ))}
        {/* amarração do pescoço */}
        <path d="M92 79 Q105 85 118 79" stroke="#d6b48a" strokeWidth="3.4" fill="none" />

        {/* chapéu de palha remendado */}
        <ellipse cx="105" cy="38" rx="38" ry="7" fill="#a16207" />
        <path d="M84 37 C84 18 92 10 105 10 C118 10 126 18 126 37 Z" fill="#ca8a04" />
        <path d="M84.5 31 C98 34 112 34 125.5 31 L126 37 C112 39 98 39 84 37 Z" fill="#7c2d12" />
        <rect x="108" y="16" width="10" height="9" rx="1.5" fill="#9333ea" transform="rotate(-10 113 20)" />
        <path d="M89 18 l3 4 M119 17 l-2 5" stroke="#854d0e" strokeWidth="1.2" />

        {/* corvo pousado no braço */}
        <g transform="translate(160 78)">
          <path d="M-12 8 C-12 -2 -2 -6 6 -2 C10 0 12 6 10 12 C4 14 -6 14 -12 8 Z" fill="#1e1b2e" />
          <path d="M-12 8 L-22 12 L-14 4 Z" fill="#1e1b2e" />
          <path d="M-6 3 C-2 6 4 6 6 2" stroke="#3f3a56" strokeWidth="1.4" fill="none" />
          {/* cabeça erguida na pose 0, bicando na pose 1 */}
          <g transform={pose ? 'rotate(16 4 4)' : undefined}>
            <circle cx="9" cy="-4" r="6" fill="#1e1b2e" />
            <circle cx="11" cy="-5.5" r="1.7" fill="#fde047" />
            <circle cx="11.4" cy="-5.6" r=".7" fill="#1e1b2e" />
            <path d="M14 -4 L21 -2.5 L14 -1 Z" fill="#f59e0b" />
          </g>
          <path d="M-2 13 v4 M4 13 v4" stroke="#f59e0b" strokeWidth="1.4" />
        </g>
      </g>

      {/* aboborinhas no pé do espantalho */}
      <Abobrinha x={70} y={216} escala={1.15} acesa apagada={!!pose} />
      <Abobrinha x={142} y={219} escala={0.85} />
    </svg>
  );
}

// --- Fardos de feno ---------------------------------------------------------

function Fardo({ x, y, largura = 86, altura = 46, id }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={largura} height={altura} rx="7" fill={`url(#${id}-feno)`} />
      {/* fios de palha */}
      {Array.from({ length: 9 }, (_, i) => (
        <path
          key={i}
          d={`M${6 + (i * (largura - 12)) / 8} ${5 + (i % 3) * 3} q${i % 2 ? 4 : -4} ${altura / 3} 0 ${altura - 14 - (i % 3) * 3}`}
          stroke={PALHA_ESCURA}
          strokeWidth="1"
          fill="none"
          opacity=".55"
        />
      ))}
      <path d={`M4 ${altura * 0.33} H${largura - 4} M4 ${altura * 0.7} H${largura - 4}`} stroke="#fde68a" strokeWidth="1" opacity=".6" />
      {/* barbantes */}
      <rect x={largura * 0.27} y="0" width="3" height={altura} fill="#7c4a24" opacity=".85" />
      <rect x={largura * 0.7} y="0" width="3" height={altura} fill="#7c4a24" opacity=".85" />
      {/* palhas escapando */}
      <Palha x={3} y={altura * 0.45} giro={95} tamanho={8} fios={4} />
      <Palha x={largura - 3} y={altura * 0.55} giro={-95} tamanho={8} fios={4} />
      <Palha x={largura * 0.5} y={2} giro={180} tamanho={7} fios={4} />
    </g>
  );
}

/** Fardos de feno com a abóbora de cima tremulando (duas poses alternadas, ver Quadros). */
export function FardosDeFeno({ efeitos = true, estatico = false, className = '', style }) {
  return (
    <div className={`pointer-events-none ${className}`} style={style} aria-hidden>
      <Quadros
        estatico={estatico || !efeitos}
        duracao={1.4}
        poses={[<DesenhoFardos key="a" pose={0} />, <DesenhoFardos key="b" pose={1} />]}
      />
    </div>
  );
}

function DesenhoFardos({ pose }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 210 168" className="block h-auto w-full">
      <defs>
        <linearGradient id={`${id}-feno`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6d77a" />
          <stop offset=".6" stopColor="#e9c15a" />
          <stop offset="1" stopColor="#c99a2e" />
        </linearGradient>
      </defs>
      <ellipse cx="105" cy="160" rx="100" ry="7" fill="#0f172a" opacity=".1" />
      {/* palha solta no chão */}
      {[[18, 160, 70], [192, 159, -70], [104, 162, 90]].map(([x, y, g]) => <Palha key={x} x={x} y={y} giro={g} tamanho={11} />)}
      <Fardo x={14} y={110} id={id} />
      <Fardo x={108} y={110} id={id} />
      <Fardo x={60} y={66} id={id} />
      {/* abóbora acesa em cima e outra encostada */}
      <Abobrinha x={104} y={54} escala={1.3} acesa apagada={!!pose} />
      <Abobrinha x={188} y={102} escala={0.7} />
    </svg>
  );
}
