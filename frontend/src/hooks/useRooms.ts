
import { useQueryClient } from '@tanstack/react-query'
import type { Room } from '../types/database'
import { toast } from '../lib/toast'
import { useApiQuery } from './useApiQuery'
import { useApiMutation } from './useApiMutation'

export function useRooms(options?: { includeInactive?: boolean }) {
  return useApiQuery<Room[]>({
    path: '/rooms',
    queryKey: ['rooms', options?.includeInactive ?? false],
    params: options?.includeInactive ? { includeInactive: true } : undefined,
  })
}

export function useRoom(id: string) {
  return useApiQuery<Room>({
    path: `/rooms/${id}`,
    queryKey: ['room', id],
    enabled: !!id,
  })
}

export function useCreateRoom() {
  const queryClient = useQueryClient()
  return useApiMutation<Omit<Room, 'id'>, Room>({
    method: 'POST',
    path: '/rooms',
    invalidate: [ ['rooms'] ],
    onSuccess: () => {
      toast.success('Sala criada com sucesso!')
    }
  })
}

export function useUpdateRoom() {
  return useApiMutation<{ id: string } & Partial<Room>, Room>({
    method: 'PUT',
    makePath: (vars) => `/rooms/${vars.id}`,
    invalidate: [ ['rooms'], (qk) => qk[0] === 'room' ],
    onSuccess: (_d, vars) => {
      toast.success('Sala atualizada com sucesso!')
    }
  })
}

export function useDeleteRoom() {
  const queryClient = useQueryClient()
  return useApiMutation<{ id: string; force?: boolean }, void>({
    method: 'DELETE',
    makePath: ({ id, force }) => `/rooms/${id}${force ? '?force=true' : ''}`,
    invalidate: [ (qk) => qk[0] === 'rooms' ],
    onSuccess: (_d, vars) => {
      toast.success(vars.force ? 'Sala e reservas excluídas!' : 'Sala removida com sucesso!')
    }
  })
}