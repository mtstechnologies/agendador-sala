// Cliente de API centralizado
// - Usa VITE_API_URL como base
// - Injeta Authorization Bearer se houver token no localStorage
// - Normaliza erros e respostas JSON

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// Em projetos Vite, import.meta.env é tipado no contexto do cliente. Para evitar reclamação de TS aqui,
// fazemos um acesso seguro usando any. Em runtime, Vite injeta as variáveis corretamente.
const VITE = (import.meta as any)?.env ?? {}
const BASE_URL: string = VITE.VITE_API_URL ?? 'http://localhost:4000'
const DEBUG = String(VITE.VITE_DEBUG_API || '').toLowerCase() === 'true'

// Conversão snake_case -> camelCase
function toCamel(s: string) {
  return s.replace(/[_.-](\w|$)/g, (_, x: string) => x.toUpperCase())
}
function isObject(o: any) {
  return o && typeof o === 'object' && !Array.isArray(o)
}
function camelize(obj: any): any {
  if (Array.isArray(obj)) return obj.map(camelize)
  if (!isObject(obj)) return obj
  const out: any = {}
  for (const [k, v] of Object.entries(obj)) {
    const nk = toCamel(k)
    out[nk] = camelize(v)
  }
  return out
}

function getToken() {
  try {
    return localStorage.getItem('token') || undefined
  } catch {
    return undefined
  }
}


// Handler opcional para 401 centralizado pelo AuthContext
let unauthorizedHandler: (() => void) | null = null
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit & { parse?: 'json' | 'text' } = {}
): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`

  const headers = new Headers(options.headers || {})
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getToken()
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(url, { ...options, headers })

  if (res.status === 401) {
    // Se enviamos um token (rota protegida), tratamos como sessão expirada/sem permissão.
    const hadToken = !!token
    if (hadToken) {
      if (unauthorizedHandler) unauthorizedHandler()
      throw new Error('Não autorizado')
    }
    // Sem token (ex.: login falhou) — tente extrair mensagem amigável do backend
    try {
      const data = await res.json()
      const msg = (data && (data.error || data.message)) || 'Credenciais inválidas'
      throw new Error(msg)
    } catch {
      throw new Error('Credenciais inválidas')
    }
  }

  if (res.status === 403) {
    let message = 'Você não tem permissão para realizar esta ação.'
    try {
      const data = await res.json()
      message = (data && (data.error || data.message)) || message
    } catch {
      // ignore
    }
    throw new Error(message)
  }

  if (!res.ok) {
    let message = res.statusText
    try {
      const data = await res.json()
      message = (data && (data.error || data.message)) || message
    } catch {
      // ignore
    }
    throw new Error(message || 'Erro ao comunicar com a API')
  }

  // Trata respostas sem conteúdo (ex.: 204 No Content)
  if (res.status === 204) {
    return undefined as unknown as T
  }

  const parse = options.parse ?? 'json'
  if (parse === 'text') {
    return (await res.text()) as unknown as T
  }

  // Para json: tente ler como texto e só parsear se não for vazio (evita erro em 204 ou corpos vazios)
  const raw = await res.text()
  if (!raw) {
    return undefined as unknown as T
  }
  try {
    const json = JSON.parse(raw)
    const normalized = camelize(json)
    if (DEBUG) {
      // Log leve com shape pós-normalização (evitar vazamento de dados sensíveis)
      const sample = Array.isArray(normalized) ? normalized.slice(0, 1) : normalized
      console.debug('[apiFetch] normalized', path, { sample })
    }
    return normalized as T
  } catch {
    // Se não for JSON válido, retorna como texto bruto (fallback) ou lança erro
    // Aqui optamos por retornar texto para não quebrar fluxos DELETE 204 edge-cases
    return raw as unknown as T
  }
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => apiFetch<T>(path, { ...init, method: 'GET' }),
  post: <T>(path: string, body?: unknown, init?: RequestInit) =>
    apiFetch<T>(path, { ...init, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown, init?: RequestInit) =>
    apiFetch<T>(path, { ...init, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown, init?: RequestInit) =>
    apiFetch<T>(path, { ...init, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, init?: RequestInit) => apiFetch<T>(path, { ...init, method: 'DELETE' }),
}
