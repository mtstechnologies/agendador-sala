import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'

// Hook simples para conectar ao SSE de reservas e invalidar queries relevantes
export function useReservationEvents(enabled: boolean) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  useEffect(() => {
    if (!enabled || !user) return
    const token = localStorage.getItem('token')
    if (!token) return
  const base = (import.meta as any).env.VITE_API_BASE_URL || (import.meta as any).env.VITE_API_URL || 'http://localhost:4000'
    const url = `${base.replace(/\/$/, '')}/reservations/events?token=${encodeURIComponent(token)}`
    const es = new EventSource(url)
    es.onmessage = (ev) => {
      try {
        const parsed = JSON.parse(ev.data)
        if (parsed?.type?.startsWith('reservation-')) {
          // Invalida todas queries de reservas (admin e usuário) e disponibilidade
          queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && (
            q.queryKey[0] === 'reservations' || q.queryKey[0] === 'my-reservations' || q.queryKey[0] === 'room-availability'
          ) })
        }
      } catch { /* ignore parse errors */ }
    }
    es.onerror = () => {
      // Em caso de erro, fechar. Poderia implementar backoff/retry.
      es.close()
    }
    return () => es.close()
  }, [enabled, user, queryClient])
}
