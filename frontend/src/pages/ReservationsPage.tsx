import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCancelReservation, useMyReservationsPaginated } from '../hooks/useReservations'
import { ReservationCard } from '../components/reservations/ReservationCard'
import { Button } from '../components/ui/Button'
import Pagination from '../components/ui/Pagination'
import { Badge } from '../components/ui/Badge'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import DateNav from '../components/ui/DateNav'
import { format } from 'date-fns'

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'cancelled'

export function ReservationsPage() {
  const { user } = useAuth()
  const cancelReservation = useCancelReservation()

  const [filter, setFilter] = useState<FilterStatus>('all')
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)
  const pageSize = 9

  const { data, isLoading } = useMyReservationsPaginated(
    user?.id,
    page,
    pageSize,
    { status: filter, date: selectedDate }
  )

  const reservations = useMemo<any[]>(() => data?.items ?? [], [data])
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1
  const canPrev = page > 1
  const canNext = page < totalPages

  // Volta para a primeira página quando filtros mudam
  useEffect(() => {
    setPage(1)
  }, [filter, selectedDate])

  const handleCancel = async (id: string) => {
    if (confirm('Tem certeza que deseja cancelar esta reserva?')) {
      try {
        await cancelReservation.mutateAsync(id)
      } catch (error) {
        console.error('Erro ao cancelar reserva:', error)
      }
    }
  }

  const statusCounts: Record<string, number> = useMemo(() => {
    return (reservations || []).reduce((acc: Record<string, number>, r: any) => {
      acc[r.status] = (acc[r.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [reservations])

  const filterOptions = [
    { value: 'all', label: 'Todas', count: total },
    { value: 'pending', label: 'Pendentes', count: statusCounts.pending || 0 },
    { value: 'approved', label: 'Aprovadas', count: statusCounts.approved || 0 },
    { value: 'rejected', label: 'Rejeitadas', count: statusCounts.rejected || 0 },
    { value: 'cancelled', label: 'Canceladas', count: statusCounts.cancelled || 0 },
  ] as { value: FilterStatus; label: string; count: number }[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Minhas Reservas</h1>
        <p className="text-gray-600">Gerencie suas reservas de salas</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <DateNav
            value={selectedDate || ''}
            onChange={(iso) => setSelectedDate(iso)}
            size="sm"
            showClear
            onClear={() => setSelectedDate(undefined)}
          />
        </div>

        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {filterOptions.map((opt) => (
            <Button
              key={opt.value}
              variant={filter === opt.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(opt.value)}
              className="flex items-center gap-2"
            >
              {opt.label}
              {opt.count > 0 && (
                <Badge variant="default" className="ml-1">
                  {opt.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-48" />
            </div>
          ))}
        </div>
      ) : reservations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservations.map((reservation: any) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onCancel={handleCancel}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma reserva encontrada</h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all'
              ? 'Você ainda não fez nenhuma reserva. Que tal explorar as salas disponíveis?'
              : 'Tente ajustar os filtros para ver outras reservas.'}
          </p>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
    </div>
  )
}