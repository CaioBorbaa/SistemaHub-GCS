export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/**
 * Chamada à API com cookies de sessão. Envie `body` (JSON) ou `form` (FormData,
 * para uploads). Em 401 dispara o evento `auth:expirada`, que faz o
 * AuthProvider limpar o usuário e as rotas protegidas redirecionarem ao login.
 */
export async function api(caminho, { method = 'GET', body, form } = {}) {
  const opcoes = { method, credentials: 'same-origin', headers: {} };
  if (form) {
    opcoes.body = form;
  } else if (body !== undefined) {
    opcoes.headers['Content-Type'] = 'application/json';
    opcoes.body = JSON.stringify(body);
  }

  let resposta;
  try {
    resposta = await fetch(`/api${caminho}`, opcoes);
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor.', 0);
  }

  const dados = resposta.status === 204 ? null : await resposta.json().catch(() => null);
  if (!resposta.ok) {
    if (resposta.status === 401 && !caminho.startsWith('/auth/')) {
      window.dispatchEvent(new Event('auth:expirada'));
    }
    throw new ApiError(dados?.erro || `Erro inesperado (${resposta.status}).`, resposta.status);
  }
  return dados;
}

/** Monta um FormData a partir de um objeto, ignorando undefined/null. */
export function paraFormData(objeto) {
  const form = new FormData();
  for (const [chave, valor] of Object.entries(objeto)) {
    if (valor === undefined || valor === null) continue;
    if (Array.isArray(valor)) form.append(chave, JSON.stringify(valor));
    else if (typeof valor === 'boolean') form.append(chave, valor ? '1' : '0');
    else form.append(chave, valor);
  }
  return form;
}

/** Registra o clique sem atrasar a abertura do sistema. */
export function registrarClique(linkId) {
  fetch(`/api/links/${linkId}/clique`, { method: 'POST', credentials: 'same-origin', keepalive: true }).catch(() => {});
}
