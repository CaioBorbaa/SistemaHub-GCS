import { useEffect, useState } from 'react';

const formatar = (data) => data.toLocaleTimeString('pt-BR', { hour12: false });

export default function Relogio() {
  const [agora, setAgora] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <time
      dateTime={agora.toISOString()}
      className={`rounded-lg bg-orange-800/30 px-3 py-1.5 font-mono text-lg font-bold tabular-nums sm:px-4 sm:py-2 sm:text-2xl`}
    >
      {formatar(agora)}
    </time>
  );
}
