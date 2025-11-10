
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Reservation } from '../types/database'
import { api } from '../lib/api'
import { toast } from '../lib/toast'

export function useReservations(userId?: string) {
  const enabled = userId === undefined ? true : !!userId
  return useQuery({
    queryKey: ['reservations', userId],
    enabled,
    queryFn: async () => {
      const url = userId ? `/reservations?userId=${userId}` : '/reservations'
      const data = await api.get<any[]>(url)
      return data
    }
  })
}

// Para simplificar, use o mesmo endpoint de reservas
export function useReservationsWithDetails(userId?: string) {
  return useReservations(userId)
}

// Reservas por dia (filtrada no cliente por data YYYY-MM-DD)
export function useReservationsForDay(dateISO: string) {
  return useQuery({
    queryKey: ['reservations-for-day', dateISO],
    queryFn: async () => {
      const debug = String((import.meta as any)?.env?.VITE_DEBUG_RESERVATIONS || '').toLowerCase() === 'true'
      // Buscar pela API já filtrando por data; a API responde paginado.
      const pageSize = 500
      const first = await api.get<any>(`/reservations?date=${dateISO}&page=1&pageSize=${pageSize}`)
      if (debug) console.debug('[reservations-for-day:first]', { dateISO, resultType: Array.isArray(first) ? 'array' : typeof first, sample: Array.isArray(first) ? first.slice(0,1) : first })
      // Se a API retornar lista (compat), simplesmente use-a
      if (Array.isArray(first)) return first
      const totalPages = Number(first?.totalPages || 1)
      let items: any[] = Array.isArray(first?.items) ? first.items : []
      if (totalPages > 1) {
        const restPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2)
        const results = await Promise.all(
          restPages.map((p) => api.get<any>(`/reservations?date=${dateISO}&page=${p}&pageSize=${pageSize}`))
        )
        for (const r of results) {
          items = items.concat(Array.isArray(r?.items) ? r.items : Array.isArray(r) ? r : [])
        }
        if (debug) console.debug('[reservations-for-day:concat]', { totalPages, total: items.length })
      }
      return items
    }
  })
}

// Paginação e filtros para "Minhas Reservas"
export type ReservationsFilter = {
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'all'
  date?: string // yyyy-MM-dd
  roomId?: string
}

export type PaginatedReservations = {
  items: any[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export function useMyReservationsPaginated(userId: string | undefined, page: number, pageSize: number, filter: ReservationsFilter) {
  return useQuery({
    queryKey: ['my-reservations', userId, page, pageSize, filter],
    enabled: !!userId,
    queryFn: async (): Promise<PaginatedReservations> => {
      const params = new URLSearchParams()
      params.set('userId', userId!)
      params.set('page', String(page))
      params.set('pageSize', String(pageSize))
      if (filter?.status && filter.status !== 'all') params.set('status', filter.status)
      if (filter?.date) params.set('date', filter.date)
      if (filter?.roomId) params.set('roomId', filter.roomId)
      const res = await api.get<any>(`/reservations?${params.toString()}`)
      // Se a API retornar lista (compat), converte para formato paginado simples
      if (Array.isArray(res)) {
        const total = res.length
        const totalPages = Math.max(1, Math.ceil(total / pageSize))
        const start = (page - 1) * pageSize
        const items = res.slice(start, start + pageSize)
        return { items, page, pageSize, total, totalPages }
      }
      return res as PaginatedReservations
    }
  })
}

// Listagem paginada geral (admin/consultas)
export function useReservationsPaginated(page: number, pageSize: number, filter: ReservationsFilter) {
  return useQuery({
    queryKey: ['reservations', page, pageSize, filter],
    queryFn: async (): Promise<PaginatedReservations> => {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('pageSize', String(pageSize))
      if (filter?.status && filter.status !== 'all') params.set('status', filter.status)
      if (filter?.date) params.set('date', filter.date)
      if (filter?.roomId) params.set('roomId', filter.roomId)
      const res = await api.get<any>(`/reservations?${params.toString()}`)
      if (Array.isArray(res)) {
        const total = res.length
        const totalPages = Math.max(1, Math.ceil(total / pageSize))
        const start = (page - 1) * pageSize
        const items = res.slice(start, start + pageSize)
        return { items, page, pageSize, total, totalPages }
      }
      return res as PaginatedReservations
    }
  })
}

// Para simplificar, retorna todas as reservas da sala no dia
export function useRoomAvailability(roomId: string, date: string) {
  return useQuery({
    queryKey: ['room-availability', roomId, date],
    queryFn: async () => {
      const data = await api.get<Reservation[]>(`/reservations?roomId=${roomId}&date=${date}`)
      return data
    },
    enabled: !!roomId && !!date
  })
}

export function useCreateReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) => {
      return await api.post<Reservation>('/reservations', reservation)
    },
    onMutate: async (newRes) => {
      const debug = String((import.meta as any)?.env?.VITE_DEBUG_RESERVATIONS || '').toLowerCase() === 'true'
      // Optimistic update: inserir na cache de reservas do dia se existir
      const startIsoAny = (newRes as any).startTime ?? (newRes as any).start_time
      const endIsoAny = (newRes as any).endTime ?? (newRes as any).end_time
      const roomIdAny = (newRes as any).roomId ?? (newRes as any).room_id
      const dateKey = (() => {
        try { return new Date(startIsoAny).toISOString().slice(0,10) } catch { return undefined }
      })()
      if (dateKey) {
        await queryClient.cancelQueries({ queryKey: ['reservations-for-day', dateKey] })
        const prevDay = queryClient.getQueryData<any[]>(['reservations-for-day', dateKey])
        if (prevDay) {
          const optimisticItem = {
            ...newRes,
            id: 'optimistic-temp-id',
            status: 'pending',
            // garantir compatibilidade snake/camel consumida pela UI
            startTime: (newRes as any).startTime ?? startIsoAny,
            endTime: (newRes as any).endTime ?? endIsoAny,
            roomId: (newRes as any).roomId ?? roomIdAny,
            start_time: (newRes as any).start_time ?? startIsoAny,
            end_time: (newRes as any).end_time ?? endIsoAny,
            room_id: (newRes as any).room_id ?? roomIdAny,
          }
          const optimistic = [...prevDay, optimisticItem]
          queryClient.setQueryData(['reservations-for-day', dateKey], optimistic)
          if (debug) console.debug('[onMutate] optimistic add', { dateKey, optimisticItem })
          return { prevDay }
        }
      }
      return {}
    },
    onSuccess: (created) => {
      const debug = String((import.meta as any)?.env?.VITE_DEBUG_RESERVATIONS || '').toLowerCase() === 'true'
      // Atualiza cache do dia substituindo temp-id
      const createdStart = (created as any).startTime ?? (created as any).start_time
      const dateKey = createdStart ? new Date(createdStart).toISOString().slice(0,10) : undefined
      if (dateKey) {
        const dayCache = queryClient.getQueryData<any[]>(['reservations-for-day', dateKey])
        if (dayCache) {
          queryClient.setQueryData(['reservations-for-day', dateKey], dayCache.map(r => r.id === 'optimistic-temp-id' ? created : r))
          if (debug) console.debug('[onSuccess] replace optimistic', { dateKey, created })
        }
      }
      // Invalida caches direcionadas (evita invalidar tudo)
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'room-availability' })
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'my-reservations' })
      toast.success('Reserva criada com sucesso!')
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevDay) {
        const dateKey = ctx.prevDay[0]?.startTime ? new Date(ctx.prevDay[0].startTime).toISOString().slice(0,10) : undefined
        if (dateKey) queryClient.setQueryData(['reservations-for-day', dateKey], ctx.prevDay)
      }
      toast.error('Falha ao criar reserva')
    },
    onSettled: () => {
      // Invalida todas as variantes paginadas de reservas
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'reservations' })
    }
  })
}

export function useUpdateReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Reservation> & { id: string }) => {
      return await api.put<Reservation>(`/reservations/${id}`, updates)
    },
    onMutate: async (payload) => {
      const startAny = (payload as any).startTime ?? (payload as any).start_time
      const dateKey = startAny ? new Date(startAny).toISOString().slice(0,10) : undefined
      if (dateKey) {
        await queryClient.cancelQueries({ queryKey: ['reservations-for-day', dateKey] })
        const prev = queryClient.getQueryData<any[]>(['reservations-for-day', dateKey])
        if (prev) {
          const next = prev.map(r => r.id === payload.id ? { ...r, ...payload } : r)
          queryClient.setQueryData(['reservations-for-day', dateKey], next)
          return { dateKey, prev }
        }
      }
      return {}
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.dateKey && ctx?.prev) {
        queryClient.setQueryData(['reservations-for-day', ctx.dateKey], ctx.prev)
      }
      toast.error('Falha ao atualizar reserva')
    },
    onSuccess: (updated) => {
      const upStart = (updated as any).startTime ?? (updated as any).start_time
      const dateKey = upStart ? new Date(upStart).toISOString().slice(0,10) : undefined
      if (dateKey) {
        const prev = queryClient.getQueryData<any[]>(['reservations-for-day', dateKey])
        if (prev) {
          queryClient.setQueryData(['reservations-for-day', dateKey], prev.map(r => r.id === updated.id ? updated : r))
        }
      }
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'room-availability' })
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'my-reservations' })
      toast.success('Reserva atualizada com sucesso!')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'reservations' })
    }
  })
}

export function useCancelReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await api.put<Reservation>(`/reservations/${id}/cancel`)
    },
    onMutate: async (id) => {
      // tenta achar em caches do dia e marca como cancelled
      const keys = queryClient.getQueryCache().getAll().map(q => q.queryKey).filter(k => Array.isArray(k) && k[0] === 'reservations-for-day') as any[]
      const backups: Array<{ key: any[]; data: any[] }> = []
      for (const key of keys) {
        const data = queryClient.getQueryData<any[]>(key)
        if (data && data.some(r => r.id === id)) {
          backups.push({ key, data })
          queryClient.setQueryData(key, data.map(r => r.id === id ? { ...r, status: 'cancelled' } : r))
        }
      }
      return { backups }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.backups) {
        for (const b of ctx.backups) queryClient.setQueryData(b.key, b.data)
      }
      toast.error('Falha ao cancelar reserva')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'room-availability' })
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'my-reservations' })
      toast.success('Reserva cancelada com sucesso!')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'reservations' })
    }
  })
}