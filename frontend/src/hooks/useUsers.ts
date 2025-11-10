import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '../lib/toast'
import { useApiQuery } from './useApiQuery'
import { useApiMutation } from './useApiMutation'

export type AdminUser = {
  id: string
  fullName: string
  email: string
  matricula: string
  role: 'user' | 'admin'
  department?: string | null
  avatar_url?: string | null
}

export type CreateUserPayload = {
  fullName: string
  email: string
  matricula: string
  password: string
  role: 'user' | 'admin'
  department?: string | null
}

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, 'password'>> & { avatar_url?: never }

export function useUsers() {
  return useApiQuery<unknown, AdminUser[]>({
    path: '/api/users',
    queryKey: ['users'],
    select: (data) => Array.isArray(data) ? (data as AdminUser[]) : [],
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useApiMutation<CreateUserPayload>({
    method: 'POST',
    path: '/api/users',
    invalidate: [ ['users'] ],
    onSuccess: () => {
      toast.success('Usuário cadastrado com sucesso')
    }
  })
}

export function useUpdateUser() {
  return useApiMutation<{ id: string; data: UpdateUserPayload }>({
    method: 'PUT',
    makePath: ({ id }) => `/api/users/${id}`,
    invalidate: [ ['users'] ],
    onSuccess: () => {
      toast.success('Dados do usuário atualizados')
    }
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  // Mantém as otimizações de onMutate específicas aqui, pois são customizadas
  return useMutation({
    mutationFn: async (args: { id: string; force?: boolean }) => {
      const { id, force } = args
      const qs = force ? '?force=true' : ''
      return fetch(`/api/users/${id}${qs}`, { method: 'DELETE' })
    },
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: ['users'] })
      const snapshots = qc.getQueriesData<AdminUser[]>({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'users' })
      snapshots.forEach(([key, data]) => {
        if (Array.isArray(data)) {
          qc.setQueryData<AdminUser[]>(key as any, data.filter(u => u.id !== id))
        }
      })
      return { snapshots }
    },
    onError: (err: any, _variables, context) => {
      const snapshots = (context as any)?.snapshots as [readonly unknown[], AdminUser[] | undefined][] | undefined
      if (snapshots) {
        snapshots.forEach(([key, data]) => {
          qc.setQueryData(key as any, data)
        })
      }
      const msg = String(err?.message || '')
      if (msg.includes('Usuário possui reservas associadas')) {
        return
      }
      toast.error(msg || 'Erro ao excluir usuário')
    },
    onSuccess: async (_data, variables) => {
      if (variables?.force) {
        toast.success('Usuário e reservas excluídos!')
      } else {
        toast.success('Usuário excluído!')
      }
      await qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'users' })
    },
    onSettled: async () => {
      await qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'users' })
    }
  })
}
