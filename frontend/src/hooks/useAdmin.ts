import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useApproveReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`http://localhost:4000/admin/reservations/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao aprovar reserva')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservations-with-details'] })
    }
  })
}

export function useRejectReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`http://localhost:4000/admin/reservations/${id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao rejeitar reserva')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservations-with-details'] })
    }
  })
}

export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const res = await fetch('http://localhost:4000/admin/reports')
      if (!res.ok) throw new Error('Erro ao buscar relatório')
      return res.json()
    }
  })
}
