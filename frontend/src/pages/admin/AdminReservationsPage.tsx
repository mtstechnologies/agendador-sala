import React, { useState } from 'react'
import { useReservationsPaginated } from '../../hooks/useReservations'
import { useReservationEvents } from '../../hooks/useReservationEvents'
import { useApproveReservation, useRejectReservation } from '../../hooks/useAdmin'
import { ReservationCard } from '../../components/reservations/ReservationCard'
import { Button } from '../../components/ui/Button'
import Pagination from '../../components/ui/Pagination'
import { Badge } from '../../components/ui/Badge'
import { Users, Filter } from 'lucide-react'

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'cancelled'

export function AdminReservationsPage() {
  const [page, setPage] = useState(1)
  const pageSize = 15
  const { data, isLoading } = useReservationsPaginated(page, pageSize, { status: 'all' })
  // Ativar SSE somente nesta página
  useReservationEvents(true)
  const reservations = data?.items || []
  const approveMutation = useApproveReservation()
  const rejectMutation = useRejectReservation()
  const [filter, setFilter] = useState<FilterStatus>('pending')

  const filteredReservations = reservations?.filter(reservation => {
    if (filter === 'all') return true
    return reservation.status === filter
  }) || []

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id)
    } catch (error) {
      console.error('Erro ao aprovar reserva:', error)
    }
  }

  const handleReject = async (id: string) => {
    if (confirm('Tem certeza que deseja rejeitar esta reserva?')) {
      try {
        await rejectMutation.mutateAsync(id)
      } catch (error) {
        console.error('Erro ao rejeitar reserva:', error)
      }
    }
  }

  

  const statusCounts = reservations.reduce((acc, reservation) => {
    acc[reservation.status] = (acc[reservation.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const filterOptions = [
    { value: 'pending', label: 'Pendentes', count: statusCounts.pending || 0 },
  { value: 'all', label: 'Todas', count: data?.total || 0 },
    { value: 'approved', label: 'Aprovadas', count: statusCounts.approved || 0 },
    { value: 'rejected', label: 'Rejeitadas', count: statusCounts.rejected || 0 },
    { value: 'cancelled', label: 'Canceladas', count: statusCounts.cancelled || 0 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Reservas</h1>
        <p className="text-gray-600">
          Aprove, rejeite ou gerencie todas as reservas do sistema
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-800">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-900">{statusCounts.pending || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-800">Aprovadas</p>
              <p className="text-2xl font-bold text-green-900">{statusCounts.approved || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-red-800">Rejeitadas</p>
              <p className="text-2xl font-bold text-red-900">{statusCounts.rejected || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-800">Total</p>
              <p className="text-2xl font-bold text-blue-900">{reservations?.length || 0}</p>
            </div>
          </div>
        </div>
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
              onApprove={handleApprove}
              onReject={handleReject}
              showUserInfo={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'Nenhuma reserva encontrada' : `Nenhuma reserva ${filterOptions.find(f => f.value === filter)?.label.toLowerCase()}`}
          </h3>
          <p className="text-gray-600">
            {filter === 'pending' 
              ? 'Não há reservas pendentes de aprovação no momento.'
              : 'Tente ajustar os filtros para ver outras reservas.'
            }
          </p>
        </div>
      )}

      <Pagination page={page} totalPages={data?.totalPages || 1} total={data?.total || 0} onPageChange={setPage} />
    </div>
  )
}