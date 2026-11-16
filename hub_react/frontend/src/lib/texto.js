/** 'comercial' -> 'Comercial' (para <option>, onde CSS capitalize não funciona bem). */
export const capitalizar = (texto) => String(texto ?? '').charAt(0).toUpperCase() + String(texto ?? '').slice(1);

export const plural = (n, singular, pluralTexto = singular + 's') => `${n} ${n === 1 ? singular : pluralTexto}`;
