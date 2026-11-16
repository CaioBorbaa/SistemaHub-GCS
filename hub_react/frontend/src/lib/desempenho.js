import { useCallback, useRef } from 'react';

/**
 * Computador modesto (até 4 núcleos ou até 4 GB de memória): os temas usam
 * menos partículas, mantendo os mesmos movimentos.
 */
export const modoLeve = (() => {
  if (typeof navigator === 'undefined') return false;
  const nucleos = navigator.hardwareConcurrency || 8;
  const memoria = navigator.deviceMemory || 8; // só alguns navegadores informam
  return nucleos <= 4 || memoria <= 4;
})();

/** Quantidade de enfeites ajustada ao computador. */
export const quantidadeLeve = (n) => (modoLeve ? Math.max(4, Math.round(n * 0.5)) : n);

/**
 * Pausa as animações do elemento enquanto ele não está visível na tela
 * (ex.: o personagem do topo quando a pessoa rolou até os ícones).
 * Funciona com o CSS `[data-pausado] * { animation-play-state: paused }`.
 * Devolve um callback ref, que funciona também com elementos que aparecem depois.
 */
export function usePausaForaDaTela() {
  const observador = useRef(null);
  return useCallback((el) => {
    observador.current?.disconnect();
    observador.current = null;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    observador.current = new IntersectionObserver(([entrada]) => {
      if (entrada.isIntersecting) el.removeAttribute('data-pausado');
      else el.setAttribute('data-pausado', '');
    });
    observador.current.observe(el);
  }, []);
}
