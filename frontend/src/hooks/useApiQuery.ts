import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { api } from '../lib/api'

// Hook genérico para GET simples com cache por chave
// - path: endpoint relativo (ex: '/rooms') ou absoluto
// - queryKey: chave base de cache (ex: ['rooms'])
// - select: transformação opcional do resultado antes de retornar
// - enabled: controla disparo inicial
// - params: objeto simples convertido para query string
export interface UseApiQueryParams<TData = any, TSelect = TData> {
  path: string
  queryKey: (string | number | boolean | null | undefined)[]
  enabled?: boolean
  params?: Record<string, string | number | boolean | undefined>
  select?: (data: TData) => TSelect
  staleTimeMs?: number
}

export function useApiQuery<TData = any, TSelect = TData>(cfg: UseApiQueryParams<TData, TSelect>) {
  const { path, queryKey, enabled = true, params, select, staleTimeMs } = cfg

  const finalPath = params ? buildUrlWithParams(path, params) : path

  return useQuery<TData, Error, TSelect>({
    queryKey,
    enabled,
    queryFn: async () => api.get<TData>(finalPath),
    select: select,
    staleTime: typeof staleTimeMs === 'number' ? staleTimeMs : undefined,
  })
}

function buildUrlWithParams(path: string, params: Record<string, string | number | boolean | undefined>): string {
  const usp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    usp.set(k, String(v))
  })
  const qs = usp.toString()
  if (!qs) return path
  return path.includes('?') ? `${path}&${qs}` : `${path}?${qs}`
}
