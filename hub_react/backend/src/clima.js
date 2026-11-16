import { config } from './config.js';
import { HttpError } from './util.js';

// condition_slug da HG Brasil -> nome do ícone (lucide-react) usado no front-end
const ICONES = {
  storm: 'wind',
  snow: 'cloud-snow',
  hail: 'cloud-drizzle',
  rain: 'cloud-rain',
  fog: 'cloud-fog',
  clear_day: 'sun',
  clear_night: 'moon',
  cloud: 'cloud',
  cloudly_day: 'cloud-sun',
  cloudly_night: 'cloud-moon',
  none_day: 'sun',
  none_night: 'moon',
};

const cache = new Map(); // ip -> { dados, quando }

const IP_PRIVADO = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|fc|fd|fe80|localhost)/i;

async function buscarJson(url) {
  const resposta = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
  return resposta.json();
}

export function tamanhoCache() {
  return cache.size;
}

export async function climaPorIp(ipOriginal) {
  // IPs da rede interna não têm geolocalização: usa o IP público da empresa.
  const ip = !ipOriginal || IP_PRIVADO.test(ipOriginal) ? config.clima.ipPadrao : ipOriginal;

  const emCache = cache.get(ip);
  if (emCache && Date.now() - emCache.quando < config.clima.cacheSegundos * 1000) return emCache.dados;

  if (!config.clima.chaveHg) throw new HttpError(500, 'Chave da API de clima não configurada.');

  let cidade;
  try {
    const geo = await buscarJson(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,city`);
    cidade = geo.city;
  } catch (erro) {
    console.warn('Erro na API de geolocalização:', erro.message);
    throw new HttpError(503, 'Serviço de localização indisponível');
  }
  if (!cidade) throw new HttpError(404, 'Cidade indisponível');

  let resultado;
  try {
    const url = `https://api.hgbrasil.com/weather?key=${encodeURIComponent(config.clima.chaveHg)}&city_name=${encodeURIComponent(cidade)}`;
    resultado = (await buscarJson(url)).results ?? {};
  } catch (erro) {
    console.warn('Erro na API de clima:', erro.message);
    throw new HttpError(503, 'Serviço de clima indisponível');
  }

  const dados = {
    cidade: cidade.toUpperCase(),
    temperatura: resultado.temp,
    descricao: resultado.description,
    icone: ICONES[resultado.condition_slug] ?? 'cloud',
  };
  cache.set(ip, { dados, quando: Date.now() });
  return dados;
}
