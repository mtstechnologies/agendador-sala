import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useReservations } from '../hooks/useReservations'
import { useRooms } from '../hooks/useRooms'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Calendar, MapPin, Clock, Users } from 'lucide-react'

export function Dashboard() {
  const { user } = useAuth()
  const { data: userReservations } = useReservations(user?.id)
  const { data: rooms } = useRooms()

  const upcomingReservations = userReservations?.filter(
    reservation => new Date(reservation.start_time) > new Date() && 
    (reservation.status === 'approved' || reservation.status === 'pending')
  ).slice(0, 3) || []

  const stats = [
    {
      title: 'Salas Disponíveis',
      value: rooms?.length || 0,
      icon: MapPin,
      color: 'text-blue-600'
    },
    {
      title: 'Minhas Reservas',
      value: userReservations?.length || 0,
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
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
              {upcomingReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">{reservation.title}</h4>
                    <p className="text-sm text-gray-600">{reservation.rooms.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(reservation.start_time).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(reservation.start_time).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      reservation.status === 'approved' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {reservation.status === 'approved' ? 'Aprovada' : 'Pendente'}
                    </span>
                  </div>
                </div>
              ))}
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
            <a
              href="/rooms"
              className="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <MapPin className="h-8 w-8 text-primary-600 mr-4" />
              <div>
                <h4 className="font-medium text-gray-900">Explorar Salas</h4>
                <p className="text-sm text-gray-600">Veja todas as salas disponíveis</p>
              </div>
            </a>
            
            <a
              href="/reservations"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Calendar className="h-8 w-8 text-green-600 mr-4" />
              <div>
                <h4 className="font-medium text-gray-900">Minhas Reservas</h4>
                <p className="text-sm text-gray-600">Gerencie suas reservas</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}