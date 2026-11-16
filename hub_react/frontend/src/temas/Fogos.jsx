import { modoLeve } from '../lib/desempenho';

// Fogos de artifício no cabeçalho (Ano Novo): um foguete sobe e estoura em
// faíscas, em pontos e tempos diferentes. Cores claras para aparecer bem
// sobre o laranja da marca.
//
// DESEMPENHO: cada estouro é UM desenho pronto (o anel de faíscas) que cresce
// e some — só transform/opacity, na placa de vídeo. Antes cada faísca era um
// elemento animado (176 no total), o que pesava em computadores modestos.

const FOGOS = [
  { x: '4%', y: '40%', cor: '#fef08a', duracao: 3.2, atraso: 0, raio: 30 },
  { x: '16%', y: '30%', cor: '#f9a8d4', duracao: 3.8, atraso: -1.4, raio: 26, soDesktop: true },
  { x: '27%', y: '52%', cor: '#a5f3fc', duracao: 3.5, atraso: -2.6, raio: 24 },
  { x: '38%', y: '28%', cor: '#ffffff', duracao: 4.2, atraso: -0.9, raio: 22, soDesktop: true },
  { x: '62%', y: '30%', cor: '#c4b5fd', duracao: 3.6, atraso: -2.0, raio: 24, soDesktop: true },
  { x: '73%', y: '50%', cor: '#fef08a', duracao: 3.3, atraso: -0.4, raio: 28 },
  { x: '84%', y: '32%', cor: '#bbf7d0', duracao: 3.9, atraso: -3.1, raio: 26, soDesktop: true },
  { x: '96%', y: '44%', cor: '#f9a8d4', duracao: 3.4, atraso: -1.7, raio: 30 },
];

const FAISCAS = modoLeve ? 10 : 14;

/** Anel de faíscas (desenho estático em coordenadas -1..1): raios coloridos + anel branco interno. */
function Anel({ cor }) {
  const raios = Array.from({ length: FAISCAS }, (_, i) => {
    const a = ((360 / FAISCAS) * i + (i % 2 ? 6 : 0)) * (Math.PI / 180);
    const fim = i % 3 === 0 ? 0.96 : 0.8;
    return { x1: Math.cos(a) * (fim - 0.32), y1: Math.sin(a) * (fim - 0.32), x2: Math.cos(a) * fim, y2: Math.sin(a) * fim };
  });
  const internos = Array.from({ length: 6 }, (_, i) => {
    const a = (60 * i + 30) * (Math.PI / 180);
    return { x1: Math.cos(a) * 0.2, y1: Math.sin(a) * 0.2, x2: Math.cos(a) * 0.42, y2: Math.sin(a) * 0.42 };
  });
  return (
    <svg viewBox="-1 -1 2 2" className="block size-full overflow-visible" style={{ filter: `drop-shadow(0 0 2px ${cor})` }}>
      {raios.map((r, i) => (
        <line key={i} {...r} stroke={cor} strokeWidth="0.085" strokeLinecap="round" />
      ))}
      {!modoLeve && internos.map((r, i) => <line key={`i${i}`} {...r} stroke="white" strokeWidth="0.06" strokeLinecap="round" />)}
    </svg>
  );
}

function Fogo({ fogo, estatico }) {
  const tempo = { animationDuration: `${fogo.duracao}s`, animationDelay: `${fogo.atraso}s` };
  const lado = fogo.raio * 2;

  return (
    <div className={`absolute ${fogo.soDesktop && !estatico ? 'hidden md:block' : ''}`} style={{ left: fogo.x, top: fogo.y }}>
      {!estatico && (
        <>
          {/* foguete subindo */}
          <span className="absolute -left-px top-0 h-3.5 w-0.5 animate-foguete rounded-full bg-linear-to-t from-transparent to-white" style={tempo} />
          {/* clarão no estouro */}
          <span className="absolute -top-2 -left-2 size-4 animate-clarao rounded-full" style={{ ...tempo, background: `radial-gradient(circle, ${fogo.cor}, transparent 70%)` }} />
        </>
      )}
      {/* estouro: o anel inteiro cresce e some */}
      <span
        className={`absolute ${estatico ? '' : 'animate-estourar'}`}
        style={{
          left: -fogo.raio,
          top: -fogo.raio,
          width: lado,
          height: lado,
          ...(estatico ? { transform: 'scale(0.75)' } : tempo),
        }}
      >
        <Anel cor={fogo.cor} />
      </span>
    </div>
  );
}

export default function FogosCabecalho({ estatico = false }) {
  const lista = estatico ? [FOGOS[0], FOGOS[2], FOGOS[4]].map((f, i) => ({ ...f, x: `${60 + i * 14}%`, y: '50%', raio: 14 })) : FOGOS;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 select-none motion-reduce:hidden">
      {lista.map((f) => (
        <Fogo key={f.x} fogo={f} estatico={estatico} />
      ))}
    </div>
  );
}
