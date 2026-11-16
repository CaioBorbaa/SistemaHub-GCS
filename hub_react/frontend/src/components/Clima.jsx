import { useEffect, useState } from 'react';
import { Cloud, CloudDrizzle, CloudFog, CloudMoon, CloudRain, CloudSnow, CloudSun, Moon, Sun, Wind } from 'lucide-react';
import { api } from '../lib/api';

const ICONES = {
  sun: Sun,
  moon: Moon,
  cloud: Cloud,
  'cloud-sun': CloudSun,
  'cloud-moon': CloudMoon,
  'cloud-rain': CloudRain,
  'cloud-snow': CloudSnow,
  'cloud-drizzle': CloudDrizzle,
  'cloud-fog': CloudFog,
  wind: Wind,
};

const ATUALIZAR_A_CADA_MS = 30 * 60 * 1000;

export default function Clima() {
  const [clima, setClima] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const buscar = () =>
      api('/clima')
        .then((d) => {
          setClima(d);
          setErro(null);
        })
        .catch((e) => setErro(e.message));
    buscar();
    const id = setInterval(buscar, ATUALIZAR_A_CADA_MS);
    return () => clearInterval(id);
  }, []);

  const caixa = `rounded-lg bg-orange-800/30 px-3 py-1.5 text-right sm:px-4 sm:py-2`;

  if (erro) {
    return (
      <div className={caixa}>
        <p className="text-sm font-bold sm:text-base">Clima indisponível</p>
        <p className="hidden text-xs sm:block">{erro}</p>
      </div>
    );
  }
  if (!clima) return <div className={`${caixa} h-10 w-24 animate-pulse sm:h-14 sm:w-40`} aria-hidden />;

  const Icone = ICONES[clima.icone] ?? Cloud;
  return (
    <div className={`${caixa} flex items-center gap-3`}>
      <div>
        <p className="hidden font-bold sm:block sm:text-lg">{clima.cidade}</p>
        <p className="text-sm">
          <span className="font-bold sm:font-normal">{clima.temperatura}°C</span>
          <span className="hidden sm:inline"> – {clima.descricao}</span>
        </p>
      </div>
      <Icone className="size-6 shrink-0 sm:size-8" aria-label={clima.descricao} />
    </div>
  );
}
