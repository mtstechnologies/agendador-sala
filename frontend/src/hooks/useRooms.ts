
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Room } from '../types/database'

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/rooms')
      if (!res.ok) throw new Error('Erro ao buscar salas')
      const data = await res.json()
      return data as Room[]
    }
  })
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: ['room', id],
    queryFn: async () => {
      const res = await fetch(`http://localhost:4000/rooms/${id}`)
      if (!res.ok) throw new Error('Erro ao buscar sala')
      const data = await res.json()
      return data as Room
    },
    enabled: !!id
  })
}

export function useCreateRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (room: Omit<Room, 'id' | 'created_at' | 'updated_at'>) => {
      const res = await fetch('http://localhost:4000/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(room)
      })
      if (!res.ok) throw new Error('Erro ao criar sala')
      return await res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
    }
  })
}

export function useUpdateRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Room> & { id: string }) => {
      const res = await fetch(`http://localhost:4000/rooms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, updated_at: new Date().toISOString() })
      })
      if (!res.ok) throw new Error('Erro ao atualizar sala')
      return await res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
    }
  })
}

export function useDeleteRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`http://localhost:4000/rooms/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Erro ao deletar sala')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
    }
  })
}