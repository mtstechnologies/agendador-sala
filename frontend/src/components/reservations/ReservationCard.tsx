import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Clock, MapPin, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import type { ReservationWithRoom, ReservationWithDetails } from '../../types/database'

interface ReservationCardProps {
  reservation: ReservationWithRoom | ReservationWithDetails
  onCancel?: (id: string) => void
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  showUserInfo?: boolean
  showActions?: boolean
}

const statusVariants = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  cancelled: 'default'
} as const

const statusLabels = {
  pending: 'Pendente',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
  cancelled: 'Cancelada'
}

export function ReservationCard({ 
  reservation, 
  onCancel, 
  onApprove, 
  onReject,
  showUserInfo = false,
  showActions = true 
}: ReservationCardProps) {
  const startDate = new Date(reservation.start_time)
  const endDate = new Date(reservation.end_time)
  const isPast = endDate < new Date()
  const canCancel = reservation.status === 'pending' || reservation.status === 'approved'

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{reservation.title}</CardTitle>
          <Badge variant={statusVariants[reservation.status]}>
            {statusLabels[reservation.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {reservation.rooms.name}
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            {format(startDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            {format(startDate, 'HH:mm')} às {format(endDate, 'HH:mm')}
          </div>

          {showUserInfo && 'user_profiles' in reservation && (
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-2" />
              {reservation.user_profiles.full_name}
            </div>
          )}

          {reservation.description && (
            <div>
              <p className="text-sm text-gray-700 mt-2">{reservation.description}</p>
            </div>
          )}

          {showActions && (
            <div className="flex gap-2 pt-2">
              {reservation.status === 'pending' && onApprove && onReject && (
                <>
                  <Button
                    onClick={() => onApprove(reservation.id)}
                    variant="primary"
                    size="sm"
                    className="flex-1"
                  >
                    Aprovar
                  </Button>
                  <Button
                    onClick={() => onReject(reservation.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Rejeitar
                  </Button>
                </>
              )}
              
              {canCancel && onCancel && !isPast && (
                <Button
                  onClick={() => onCancel(reservation.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Cancelar
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}