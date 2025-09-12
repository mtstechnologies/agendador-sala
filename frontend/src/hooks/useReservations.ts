
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Reservation, ReservationWithRoom, ReservationWithDetails } from '../types/database'

export function useReservations(userId?: string) {
  return useQuery({
    queryKey: ['reservations', userId],
    queryFn: async () => {
      const url = userId
        ? `http://localhost:4000/reservations?userId=${userId}`
        : 'http://localhost:4000/reservations'
      const res = await fetch(url)
      if (!res.ok) throw new Error('Erro ao buscar reservas')
      const data = await res.json()
      return data as ReservationWithRoom[]
    }
  })
}

// Para simplificar, use o mesmo endpoint de reservas
export function useReservationsWithDetails(userId?: string) {
  return useReservations(userId)
}

// Para simplificar, retorna todas as reservas da sala no dia
export function useRoomAvailability(roomId: string, date: string) {
  return useQuery({
    queryKey: ['room-availability', roomId, date],
    queryFn: async () => {
      const res = await fetch(`http://localhost:4000/reservations?roomId=${roomId}&date=${date}`)
      if (!res.ok) throw new Error('Erro ao buscar disponibilidade')
      const data = await res.json()
      return data as Reservation[]
    },
    enabled: !!roomId && !!date
  })
}

export function useCreateReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) => {
      const res = await fetch('http://localhost:4000/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservation)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao criar reserva')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['room-availability'] })
    }
  })
}

export function useUpdateReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Reservation> & { id: string }) => {
      const res = await fetch(`http://localhost:4000/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao atualizar reserva')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservations-with-details'] })
      queryClient.invalidateQueries({ queryKey: ['room-availability'] })
    }
  })
}

export function useCancelReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`http://localhost:4000/reservations/${id}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao cancelar reserva')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservations-with-details'] })
      queryClient.invalidateQueries({ queryKey: ['room-availability'] })
    }
  })
}