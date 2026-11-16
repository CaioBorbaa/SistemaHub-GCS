/** "05/11/26 14:32" — data e hora curtas de um acesso; null quando não houver. */
export const ultimoAcesso = (iso) =>
  iso ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : null;
