import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useMyReservationsPaginated } from '../hooks/useReservations'
import { useRooms } from '../hooks/useRooms'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Calendar, MapPin, Clock } from 'lucide-react'
import { formatHourMinutesFromIsoWithOffset, formatDateFromIsoWithOffset } from '../lib/time'
import { getStartIso, getEndIso, getRoomName, isUpcoming } from '../lib/reservation'
import { Link } from 'react-router-dom'

export function Dashboard() {
  const { user } = useAuth()
  const { data } = useMyReservationsPaginated(user?.id, 1, 20, { status: 'all' })
  const userReservations = data?.items || []
  const { data: rooms } = useRooms()

  const nowMs = Date.now()
  const upcomingReservations = (userReservations || [])
    .filter((r) => isUpcoming(r, nowMs))
    .sort((a, b) => Date.parse(getStartIso(a)!) - Date.parse(getStartIso(b)!))
    .slice(0, 3)

  const stats = [
    {
      title: 'Salas Disponíveis',
      value: rooms?.length || 0,
      icon: MapPin,
      color: 'text-blue-600'
    },
    {
      title: 'Minhas Reservas',
      value: data?.total || 0,
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      title: 'Próximas Reservas',
      value: upcomingReservations.length,
      icon: Clock,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bem-vindo, {user?.full_name}!
        </h1>
        <p className="text-gray-600">
          Gerencie suas reservas e explore as salas disponíveis.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            colorClass={stat.color}
          />
        ))}
      </div>

      {/* Upcoming Reservations */}
      {upcomingReservations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Próximas Reservas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingReservations.map((reservation: any) => {
                const startIso = getStartIso(reservation)!
                const endIso = getEndIso(reservation)
                return (
                  <div
                    key={reservation.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/60 rounded-lg"
                  >
                    <div className="min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate" title={reservation.title}>{reservation.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {getRoomName(reservation)} {reservation.room?.bloco ? `(Bloco ${reservation.room.bloco})` : ''}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDateFromIsoWithOffset(startIso)} às {formatHourMinutesFromIsoWithOffset(startIso)}{endIso ? ` – ${formatHourMinutesFromIsoWithOffset(endIso)}` : ''}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          reservation.status === 'approved'
                            ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300'
                        }`}
                      >
                        {reservation.status === 'approved' ? 'Aprovada' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/rooms"
              className="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <MapPin className="h-8 w-8 text-primary-600 mr-4" />
              <div>
                <h4 className="font-medium text-gray-900">Explorar Salas</h4>
                <p className="text-sm text-gray-600">Veja todas as salas disponíveis</p>
              </div>
            </Link>
            
            <Link
              to="/reservations"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Calendar className="h-8 w-8 text-green-600 mr-4" />
              <div>
                <h4 className="font-medium text-gray-900">Minhas Reservas</h4>
                <p className="text-sm text-gray-600">Gerencie suas reservas</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}