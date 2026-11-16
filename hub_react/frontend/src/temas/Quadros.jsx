/**
 * Animação quadro a quadro, como desenho animado: N poses ESTÁTICAS empilhadas,
 * mostradas uma de cada vez trocando a opacidade em degraus.
 *
 * DESEMPENHO: animar partes de dentro de um SVG (pernas, chamas, luzinhas) roda
 * no processador e força o navegador a recalcular todas as animações da página
 * a cada quadro — pesado em computadores modestos. Já a troca de opacidade de
 * camadas prontas roda na placa de vídeo, com custo praticamente zero.
 *
 * Use poses diferentes do mesmo desenho (ex.: perna para frente / para trás).
 */
export default function Quadros({ poses, duracao = 0.5, estatico = false, className = '', style }) {
  if (estatico || poses.length < 2) {
    return <div className={className} style={style}>{poses[0]}</div>;
  }
  const n = poses.length;
  return (
    <div className={`relative ${className}`} style={style}>
      {poses.map((pose, i) => (
        <div
          key={i}
          // a 1ª pose ocupa o espaço; as outras ficam por cima. Com "menos movimento", só a 1ª aparece.
          className={i === 0 ? 'relative h-full w-full motion-reduce:animate-none!' : 'absolute inset-0 motion-reduce:hidden'}
          style={{ animation: `quadros-${n} ${duracao}s steps(1, end) ${-(((n - i) % n) * duracao) / n}s infinite` }}
        >
          {pose}
        </div>
      ))}
    </div>
  );
}
