import { useMemo } from 'react';
import { quantidadeLeve } from '../lib/desempenho';

// Trajetórias fixas definidas no CSS (cair-1..4): animações só de transform,
// sem variáveis, para rodarem na placa de vídeo.
const SEM_GIRO = ['cair-1', 'cair-2'];
const COM_GIRO = ['cair-1', 'cair-3', 'cair-2', 'cair-4'];

/**
 * Enfeites caindo devagar no FUNDO da página: ficam atrás dos ícones e de
 * todo o conteúdo (-z-10), não capturam cliques e somem para quem prefere
 * menos movimento. Em computadores modestos a quantidade cai pela metade.
 * `renderizar(i)` devolve o conteúdo de cada enfeite.
 */
export default function Particulas({ quantidade = 20, duracao = [18, 32], tamanho = [5, 9], giro = 0, renderizar }) {
  const itens = useMemo(
    () =>
      Array.from({ length: quantidadeLeve(quantidade) }, (_, i) => {
        const r = () => Math.random();
        const trajetorias = giro ? COM_GIRO : SEM_GIRO;
        return {
          i,
          left: `${r() * 100}%`,
          size: tamanho[0] + r() * (tamanho[1] - tamanho[0]),
          duration: duracao[0] + r() * (duracao[1] - duracao[0]),
          delay: -r() * duracao[1], // negativo: já começa espalhado pela tela
          trajetoria: trajetorias[i % trajetorias.length],
        };
      }),
    [quantidade, duracao, tamanho, giro],
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden motion-reduce:hidden">
      {itens.map((p) => (
        <span
          key={p.i}
          className="absolute top-0"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animation: `${p.trajetoria} ${p.duration}s linear ${p.delay}s infinite`,
          }}
        >
          {renderizar(p.i, p.size)}
        </span>
      ))}
    </div>
  );
}
