import { useId } from 'react';
import Quadros from './Quadros';

// Árvore de Natal no canto inferior esquerdo da página, com galões das marcas
// parceiras (Lukscolor e Futura) de presente.
//
// As latas são as fotos dos produtos, recortadas e sem fundo, em
// frontend/public/temas/natal/. Para trocar o modelo, substitua o PNG
// (de preferência com fundo transparente) e ajuste `proporcao` (altura/largura).
export const LATAS = {
  lukscolor: { imagem: '/temas/natal/lukscolor.png', proporcao: 268 / 260, nome: 'Lukscolor' },
  futura: { imagem: '/temas/natal/futura.png', proporcao: 275 / 260, nome: 'Futura' },
};

/** Galão (foto do produto) com sombra no chão e laço de presente na tampa. */
function Galao({ x, y, largura, marca }) {
  const lata = LATAS[marca];
  const altura = largura * lata.proporcao;
  const laco = largura / 58; // o laço foi desenhado para uma lata de 58 de largura
  return (
    <g>
      <ellipse cx={x + largura / 2} cy={y + altura - 1} rx={largura * 0.48} ry={largura * 0.07} fill="#0f172a" opacity="0.12" />
      <image href={lata.imagem} x={x} y={y} width={largura} height={altura} preserveAspectRatio="xMidYMid meet">
        <title>{lata.nome}</title>
      </image>
      {/* laço de presente apoiado na tampa (acima do rótulo, sem cobrir a marca) */}
      <g transform={`translate(${x + largura / 2} ${y + 1}) scale(${laco * 0.85})`}>
        <path d="M0 0 C-10 -10 -17 -1 -8 3 Z" fill="#ef4444" />
        <path d="M0 0 C10 -10 17 -1 8 3 Z" fill="#ef4444" />
        <path d="M-1 1 L-5 4.5 M1 1 L5 4.5" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" />
        <circle r="2.6" fill="#b91c1c" />
      </g>
    </g>
  );
}

const ENFEITES = [
  [104, 60, '#ef4444'], [134, 66, '#fbbf24'], [96, 100, '#3b82f6'], [128, 104, '#ef4444'], [150, 96, '#fbbf24'],
  [86, 146, '#fbbf24'], [112, 140, '#3b82f6'], [140, 150, '#ef4444'], [162, 138, '#3b82f6'],
];
const LUZES = [
  [118, 44], [110, 80], [140, 84], [88, 122], [118, 120], [146, 124], [78, 154], [100, 158], [128, 160], [158, 158],
];

/**
 * Árvore com as luzinhas piscando: duas poses (metade das luzes acesa em cada uma)
 * alternadas pelo componente Quadros — nada é animado dentro do SVG.
 */
export default function ArvoreNatal({ efeitos = true, className = '', style }) {
  return (
    <div className={className} style={style} aria-hidden>
      <Quadros estatico={!efeitos} duracao={1.2} poses={[<DesenhoArvore key="a" pose={0} />, <DesenhoArvore key="b" pose={1} />]} />
    </div>
  );
}

function DesenhoArvore({ pose }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 250 222" className="block h-auto w-full">
      <defs>
        <linearGradient id={`${id}-folha`} x1="0" x2="1">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="55%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <radialGradient id={`${id}-neve`}>
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* chão de neve */}
      <ellipse cx="125" cy="208" rx="122" ry="12" fill={`url(#${id}-neve)`} />

      {/* tronco */}
      <rect x="113" y="168" width="20" height="26" rx="2" fill="#8b5a2b" />

      {/* copa em três camadas */}
      <path d="M123 92 L54 172 Q123 186 192 172 Z" fill={`url(#${id}-folha)`} />
      <path d="M123 54 L70 128 Q123 140 176 128 Z" fill={`url(#${id}-folha)`} />
      <path d="M123 22 L86 82 Q123 92 160 82 Z" fill={`url(#${id}-folha)`} />
      {/* luz lateral para dar volume */}
      <path d="M123 22 L86 82 Q100 86 112 87 Z M123 54 L70 128 Q90 134 108 135 Z M123 92 L54 172 Q78 179 102 180 Z" fill="white" opacity="0.08" />

      {/* festão dourado */}
      <path d="M94 76 Q123 90 152 72 M80 120 Q122 136 166 116 M66 164 Q124 182 182 160" stroke="#fcd34d" strokeWidth="2" strokeDasharray="1 3.5" strokeLinecap="round" fill="none" />

      {/* bolinhas */}
      {ENFEITES.map(([x, y, cor]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="5" fill={cor} />
          <circle cx={x - 1.6} cy={y - 1.6} r="1.5" fill="white" opacity="0.7" />
        </g>
      ))}

      {/* luzinhas */}
      {LUZES.map(([x, y], i) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r="2"
          fill="#fef9c3"
          opacity={i % 2 === pose ? 1 : 0.35}
          style={{ filter: 'drop-shadow(0 0 2px #fde047)' }}
        />
      ))}

      {/* estrela */}
      <path
        d="M123 2 L127.5 13 L139 13.5 L130 20.5 L133 32 L123 25.5 L113 32 L116 20.5 L107 13.5 L118.5 13 Z"
        fill="#facc15"
        stroke="#f59e0b"
        strokeWidth="1"
        strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 0 4px rgba(250,204,21,0.7))' }}
      />

      {/* presentes: galões das marcas parceiras */}
      <Galao x={2} y={144} largura={62} marca="lukscolor" />
      <Galao x={186} y={142} largura={62} marca="futura" />
      <Galao x={82} y={168} largura={38} marca="futura" />
      <Galao x={130} y={171} largura={36} marca="lukscolor" />
    </svg>
  );
}
