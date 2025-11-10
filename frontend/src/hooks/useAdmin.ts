import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { toast } from '../lib/toast'

export function useApproveReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      return await api.put(`/admin/reservations/${id}/approve`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservations-with-details'] })
      toast.success('Reserva aprovada!')
    }
  })
}

export function useRejectReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      return await api.put(`/admin/reservations/${id}/reject`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservations-with-details'] })
      toast.success('Reserva rejeitada!')
    }
  })
}

export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: async () => api.get('/admin/reports')
  })
}
