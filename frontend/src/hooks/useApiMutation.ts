import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

// Hook genérico para POST/PUT/PATCH/DELETE com invalidation opcional
// - method: método HTTP
// - path: endpoint relativo com placeholders (ex: '/rooms/:id')
// - makePath: função para construir path a partir do payload ({id})
// - invalidate: chaves (ou predicado) para invalidar após sucesso

export type HttpMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface UseApiMutationParams<TVars = any, TData = any> {
  method: HttpMethod
  path?: string
  makePath?: (vars: TVars) => string
  invalidate?: Array<readonly unknown[] | ((qk: readonly unknown[]) => boolean)> | ((qk: readonly unknown[]) => boolean)
  successMessage?: string
  onSuccess?: (data: TData, vars: TVars) => void
}

export function useApiMutation<TVars = any, TData = any>(params: UseApiMutationParams<TVars, TData>) {
  const { method, path, makePath, invalidate, successMessage, onSuccess } = params
  const queryClient = useQueryClient()

  return useMutation<TData, Error, TVars>({
    mutationFn: async (vars: TVars) => {
      const finalPath = makePath ? makePath(vars) : (path as string)
      switch (method) {
        case 'POST': return api.post<TData>(finalPath, vars)
        case 'PUT': return api.put<TData>(finalPath, vars)
        case 'PATCH': return api.patch<TData>(finalPath, vars)
        case 'DELETE': return api.delete<TData>(finalPath)
      }
    },
    onSuccess: async (data, vars) => {
      if (onSuccess) onSuccess(data, vars)
      if (invalidate) {
        if (typeof invalidate === 'function') {
          await queryClient.invalidateQueries({ predicate: (q) => invalidate(q.queryKey) })
        } else if (Array.isArray(invalidate)) {
          for (const it of invalidate) {
            if (typeof it === 'function') {
              await queryClient.invalidateQueries({ predicate: (q) => it(q.queryKey) })
            } else {
              await queryClient.invalidateQueries({ queryKey: it })
            }
          }
        }
      }
      // mensagens de sucesso ficam por conta do chamador (toast)
    },
  })
}
