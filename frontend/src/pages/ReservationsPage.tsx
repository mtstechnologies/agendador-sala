import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useReservations, useCancelReservation } from '../hooks/useReservations'
import { ReservationCard } from '../components/reservations/ReservationCard'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Calendar, Filter } from 'lucide-react'

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'cancelled'

export function ReservationsPage() {
  const { user } = useAuth()
  const { data: reservations, isLoading } = useReservations(user?.id)
  const cancelReservation = useCancelReservation()
  const [filter, setFilter] = useState<FilterStatus>('all')

  const filteredReservations = reservations?.filter(reservation => {
    if (filter === 'all') return true
    return reservation.status === filter
  }) || []

  const handleCancel = async (id: string) => {
    if (confirm('Tem certeza que deseja cancelar esta reserva?')) {
      try {
        await cancelReservation.mutateAsync(id)
      } catch (error) {
        console.error('Erro ao cancelar reserva:', error)
      }
    }
  }

  const statusCounts = reservations?.reduce((acc, reservation) => {
    acc[reservation.status] = (acc[reservation.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const filterOptions = [
    { value: 'all', label: 'Todas', count: reservations?.length || 0 },
    { value: 'pending', label: 'Pendentes', count: statusCounts.pending || 0 },
    { value: 'approved', label: 'Aprovadas', count: statusCounts.approved || 0 },
    { value: 'rejected', label: 'Rejeitadas', count: statusCounts.rejected || 0 },
    { value: 'cancelled', label: 'Canceladas', count: statusCounts.cancelled || 0 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Minhas Reservas</h1>
        <p className="text-gray-600">
          Gerencie suas reservas de salas
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            variant={filter === option.value ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter(option.value as FilterStatus)}
            className="flex items-center gap-2"
          >
            {option.label}
            {option.count > 0 && (
              <Badge variant="default" className="ml-1">
                {option.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Reservations */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-48"></div>
            </div>
          ))}
        </div>
      ) : filteredReservations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReservations.map((reservation) => (
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'Nenhuma reserva encontrada' : `Nenhuma reserva ${filterOptions.find(f => f.value === filter)?.label.toLowerCase()}`}
          </h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all' 
              ? 'Você ainda não fez nenhuma reserva. Que tal explorar as salas disponíveis?'
              : 'Tente ajustar os filtros para ver outras reservas.'
            }
          </p>
          {filter === 'all' && (
            <Button>
              <a href="/rooms">Explorar Salas</a>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}