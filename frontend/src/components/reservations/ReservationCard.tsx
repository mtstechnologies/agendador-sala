import React from 'react'
import { Calendar, Clock, MapPin, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import type { ReservationWithRoomAndUser } from '../../types/database'
import { formatTimeRangeFromIso, formatDateFromIsoWithOffset } from '../../lib/time'
import { getEndIso, getRoomName, getStartIso, getUserName, isEnded } from '../../lib/reservation'

interface ReservationCardProps {
  reservation: ReservationWithRoomAndUser
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
  const startIso = getStartIso(reservation)
  const endIso = getEndIso(reservation)
  const isPast = isEnded(reservation)
  const canCancel = reservation.status === 'pending' || reservation.status === 'approved'

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <CardTitle
            className="flex-1 min-w-0 truncate"
            title={reservation.title}
          >
            {reservation.title}
          </CardTitle>
          <Badge variant={statusVariants[reservation.status as keyof typeof statusVariants]}>
            {statusLabels[reservation.status as keyof typeof statusLabels]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {getRoomName(reservation)}
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            {startIso ? formatDateFromIsoWithOffset(startIso) : ''}
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            {startIso && endIso ? formatTimeRangeFromIso(startIso, endIso) : ''}
          </div>

          {showUserInfo && reservation.user && (
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-2" />
              {getUserName(reservation)}
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