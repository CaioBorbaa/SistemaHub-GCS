import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ImagemAmpliada from './ImagemAmpliada';

const INTERVALO_MS = 10_000;

/** Carrossel de banners com troca automática a cada 10 s e transição em fade. */
export default function BannerCarrossel({ banners }) {
  const [ativo, setAtivo] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [ampliada, setAmpliada] = useState(null); // imagem aberta ao clicar num banner
  const total = banners.length;
  // só baixa a imagem do banner visível e do próximo (os demais carregam conforme o carrossel anda)
  const [carregados, setCarregados] = useState(() => new Set([0, 1]));
  useEffect(() => {
    setCarregados((atual) => (atual.has(ativo) && atual.has((ativo + 1) % total) ? atual : new Set([...atual, ativo, (ativo + 1) % total])));
  }, [ativo, total]);

  const ir = useCallback((passo) => setAtivo((a) => (a + passo + total) % total), [total]);

  // `ativo` nas dependências reinicia a contagem após um clique manual
  useEffect(() => {
    if (total < 2 || pausado || ampliada) return;
    const id = setTimeout(() => ir(1), INTERVALO_MS);
    return () => clearTimeout(id);
  }, [ativo, total, pausado, ampliada, ir]);

  const fecharAmpliada = useCallback(() => setAmpliada(null), []);

  if (total === 0) return null;

  const botao = 'pointer-events-auto rounded-full bg-black/30 p-2 text-white transition-colors hover:bg-black/50';

  return (
    <>
      <section
        aria-roledescription="carrossel"
        aria-label="Banners"
        onMouseEnter={() => setPausado(true)}
        onMouseLeave={() => setPausado(false)}
        className="relative mt-6 h-28 w-full overflow-hidden bg-gray-200 shadow-lg sm:h-40"
      >
        {banners.map((banner, i) => {
          const imagem = carregados.has(i) ? <img src={banner.imagem} alt="Banner" decoding="async" className="size-full object-cover" /> : null;
          return (
            <div
              key={banner.id}
              aria-hidden={i !== ativo}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${i === ativo ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            >
              {banner.popup ? (
                <button
                  type="button"
                  onClick={() => setAmpliada(banner.popup)}
                  tabIndex={i === ativo ? 0 : -1}
                  aria-label="Ver imagem do banner"
                  className="block size-full cursor-zoom-in"
                >
                  {imagem}
                </button>
              ) : banner.link ? (
                <a href={banner.link} target="_blank" rel="noopener noreferrer" tabIndex={i === ativo ? 0 : -1}>
                  {imagem}
                </a>
              ) : (
                imagem
              )}
            </div>
          );
        })}

        {total > 1 && (
          <>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-4">
              <button type="button" onClick={() => ir(-1)} className={botao} aria-label="Banner anterior">
                <ChevronLeft className="size-6" />
              </button>
              <button type="button" onClick={() => ir(1)} className={botao} aria-label="Próximo banner">
                <ChevronRight className="size-6" />
              </button>
            </div>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
              {banners.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setAtivo(i)}
                  aria-label={`Ir para o banner ${i + 1}`}
                  aria-current={i === ativo}
                  className={`h-2 rounded-full transition-all ${i === ativo ? 'w-6 bg-white' : 'w-2 bg-white/60 hover:bg-white/80'}`}
                />
              ))}
            </div>
          </>
        )}
      </section>
      {ampliada && <ImagemAmpliada src={ampliada} alt="Banner" aoFechar={fecharAmpliada} />}
    </>
  );
}
