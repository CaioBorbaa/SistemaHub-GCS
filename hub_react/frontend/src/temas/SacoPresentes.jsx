import { useEffect, useId, useRef, useState } from 'react';
import { api } from '../lib/api';

// Saco de presentes do Papai Noel (tema de Natal), no canto inferior direito.
// Clicar sorteia um produto, que pula para fora do saco. Regras:
// - um presente por carregamento da página (recarregar libera outro);
// - o sorteio evita repetir os últimos presentes que ESTA pessoa já viu.
// Os produtos são cadastrados no painel: Temas → Saco de presentes.

const CHAVE_VISTOS = 'saco-presentes-vistos';
const TEMPO_EXIBINDO_MS = 7000;

// Vale para a página inteira: navegar entre telas não libera outro presente,
// só recarregar.
let presenteJaAberto = false;

function lerVistos() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_VISTOS)) ?? [];
  } catch {
    return [];
  }
}

function sortear(presentes) {
  const vistos = lerVistos();
  // evita os últimos vistos, mas sempre deixa pelo menos um candidato
  const evitar = new Set(vistos.slice(-Math.min(3, presentes.length - 1)));
  const candidatos = presentes.filter((p) => !evitar.has(p.id));
  const escolhido = candidatos[Math.floor(Math.random() * candidatos.length)];
  try {
    localStorage.setItem(CHAVE_VISTOS, JSON.stringify([...vistos, escolhido.id].slice(-10)));
  } catch {
    /* sem armazenamento: o sorteio só fica menos esperto */
  }
  return escolhido;
}

/** Desenho do saco. `espiando` são até 3 imagens de produtos saindo pela boca. */
function DesenhoSaco({ espiando = [] }) {
  const id = useId().replace(/:/g, '');
  const posicoes = [
    { x: 72, y: 26, w: 34, giro: -14 },
    { x: 116, y: 18, w: 36, giro: 10 },
    { x: 96, y: 34, w: 30, giro: -2 },
  ];
  return (
    <svg viewBox="0 0 220 214" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <radialGradient id={`${id}-veludo`} cx="38%" cy="40%" r="75%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="55%" stopColor="#c81e1e" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </radialGradient>
        <linearGradient id={`${id}-boca`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
      </defs>

      {/* sombra no chão */}
      <ellipse cx="110" cy="206" rx="84" ry="7" fill="#0f172a" opacity="0.13" />

      {/* interior escuro da boca do saco */}
      <ellipse cx="110" cy="62" rx="44" ry="11" fill="#450a0a" />

      {/* produtos espiando */}
      {espiando.slice(0, 3).map((p, i) => {
        const pos = posicoes[i];
        return (
          <image
            key={p.id}
            href={p.imagem}
            x={pos.x}
            y={pos.y}
            width={pos.w}
            height={pos.w * 1.3}
            preserveAspectRatio="xMidYMax meet"
            transform={`rotate(${pos.giro} ${pos.x + pos.w / 2} ${pos.y + pos.w})`}
          />
        );
      })}

      {/* corpo do saco */}
      <path d="M70 84 Q30 104 26 152 Q24 200 110 202 Q196 200 194 152 Q190 104 150 84 Z" fill={`url(#${id}-veludo)`} />
      {/* estampa: estrelinhas douradas */}
      {[[62, 130], [150, 118], [96, 168], [160, 170], [118, 140]].map(([x, y]) => (
        <path
          key={`${x}-${y}`}
          d={`M${x} ${y - 6} L${x + 1.8} ${y - 1.8} L${x + 6} ${y} L${x + 1.8} ${y + 1.8} L${x} ${y + 6} L${x - 1.8} ${y + 1.8} L${x - 6} ${y} L${x - 1.8} ${y - 1.8} Z`}
          fill="#fcd34d"
          opacity="0.75"
        />
      ))}
      {/* remendo costurado */}
      <rect x="128" y="140" width="26" height="22" rx="3" fill="#15803d" transform="rotate(-8 141 151)" />
      <rect x="128" y="140" width="26" height="22" rx="3" fill="none" stroke="#fef3c7" strokeWidth="1.2" strokeDasharray="2.5 2" transform="rotate(-8 141 151)" />
      {/* brilho do veludo */}
      <path d="M52 118 Q44 146 52 172" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.13" fill="none" />

      {/* babado da boca (na frente dos produtos) */}
      <path d="M64 62 Q60 76 70 86 Q110 98 150 86 Q160 76 156 62 Q134 76 110 72 Q86 76 64 62 Z" fill={`url(#${id}-boca)`} />
      {/* cordão dourado amarrado */}
      <path d="M68 84 Q110 98 152 84" stroke="#fbbf24" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d="M110 92 q-10 10 -6 26 M110 92 q9 12 4 28" stroke="#f59e0b" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <circle cx="104" cy="119" r="3.6" fill="#fbbf24" />
      <circle cx="114" cy="121" r="3.6" fill="#fbbf24" />
      <circle cx="110" cy="92" r="4.5" fill="#f59e0b" />
    </svg>
  );
}

function Brilhos() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {/* direção num invólucro estático; o brilho anima só transform/opacity (keyframes "estouro") */}
      {Array.from({ length: 10 }, (_, i) => (
        <span key={i} className="absolute top-1/2 left-1/2" style={{ transform: `rotate(${i * 36}deg)` }}>
          <span
            className="absolute top-0 left-0 size-2 rounded-full bg-yellow-300 shadow-[0_0_6px_#fde047]"
            style={{ animation: `estouro ${0.9 + (i % 3) * 0.12}s cubic-bezier(0.15, 0.75, 0.3, 1) forwards` }}
          />
        </span>
      ))}
    </div>
  );
}

export default function SacoPresentes({ efeitos = true, className = '', style, estatico = false }) {
  const [presentes, setPresentes] = useState([]);
  const [premio, setPremio] = useState(null);
  const [chacoalhando, setChacoalhando] = useState(0);
  const voo = useRef(null);
  const timers = useRef([]);

  useEffect(() => {
    if (estatico) return;
    api('/presentes')
      .then((lista) => {
        setPresentes(lista);
        lista.forEach((p) => { new Image().src = p.imagem; }); // pré-carrega para o pulo ser instantâneo
      })
      .catch(() => setPresentes([]));
    return () => timers.current.forEach(clearTimeout);
  }, [estatico]);

  const depois = (ms, fn) => timers.current.push(setTimeout(fn, ms));

  function guardar() {
    const el = voo.current;
    if (!el) return setPremio(null);
    el.animate(
      [
        { transform: 'translate(-50%, 0) scale(1)', opacity: 1 },
        { transform: 'translate(-50%, 70%) scale(0.2)', opacity: 0 },
      ],
      { duration: 450, easing: 'ease-in', fill: 'forwards' },
    ).onfinish = () => setPremio(null);
  }

  function abrir() {
    setChacoalhando((n) => n + 1);
    if (presenteJaAberto || presentes.length === 0) return; // segundo clique: só chacoalha
    presenteJaAberto = true;
    const escolhido = sortear(presentes);
    depois(320, () => setPremio(escolhido));
    depois(320 + TEMPO_EXIBINDO_MS, guardar);
  }

  // Pulo do produto para fora do saco, em arco
  useEffect(() => {
    if (!premio || !voo.current) return;
    voo.current.animate(
      [
        { transform: 'translate(-50%, 85%) scale(0.15) rotate(0deg)', opacity: 0 },
        { transform: 'translate(-50%, 40%) scale(0.5) rotate(-8deg)', opacity: 1, offset: 0.2 },
        { transform: 'translate(-62%, -18%) scale(1.08) rotate(-14deg)', offset: 0.6 },
        { transform: 'translate(-50%, 0) scale(1) rotate(0deg)', opacity: 1 },
      ],
      { duration: efeitos ? 900 : 1, easing: 'cubic-bezier(0.22, 0.9, 0.35, 1)', fill: 'forwards' },
    );
  }, [premio, efeitos]);

  if (estatico) {
    return (
      <div className={className} style={style} aria-hidden>
        <DesenhoSaco />
      </div>
    );
  }
  if (presentes.length === 0) return null;

  return (
    <div className={className} style={style}>
      <div className="relative">
        {/* produto sorteado, saindo pela boca do saco */}
        {premio && (
          <div
            ref={voo}
            className="absolute bottom-[62%] left-1/2 z-30 flex w-full cursor-pointer flex-col items-center"
            style={{ transform: 'translate(-50%, 85%) scale(0.15)', opacity: 0 }}
            onClick={guardar}
            title="Clique para guardar"
          >
            <div className="relative mb-2 rounded-xl bg-white px-3 py-2 text-center shadow-lg ring-1 ring-red-100">
              <p className="text-[11px] font-semibold tracking-wide text-red-600 uppercase">🎁 Surpresa!</p>
              <p className="text-sm leading-tight font-bold text-gray-800">{premio.nome}</p>
              <span className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 bg-white" />
            </div>
            <div className="relative">
              {efeitos && <Brilhos />}
              <img src={premio.imagem} alt={premio.nome} className="relative max-h-[130px] max-w-[110px] object-contain drop-shadow-lg" />
            </div>
          </div>
        )}

        <button
          key={chacoalhando}
          type="button"
          onClick={abrir}
          aria-label="Saco de presentes do Papai Noel: clique para uma surpresa"
          title="O que será que tem aqui?"
          className={`block w-full cursor-pointer rounded-3xl focus-visible:ring-4 focus-visible:ring-red-300 focus-visible:outline-none ${
            chacoalhando ? 'animate-chacoalhar' : efeitos ? 'animate-cutucar' : ''
          } origin-bottom`}
        >
          <DesenhoSaco espiando={presentes} />
        </button>

        <p className="sr-only" aria-live="polite">{premio ? `Você tirou do saco: ${premio.nome}` : ''}</p>
      </div>
    </div>
  );
}
