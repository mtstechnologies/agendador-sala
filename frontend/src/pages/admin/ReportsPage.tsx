import React from 'react'
import { useReservationsWithDetails } from '../../hooks/useReservations'
import { useRooms } from '../../hooks/useRooms'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { BarChart3, TrendingUp, Calendar, MapPin } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function ReportsPage() {
  const { data: reservations } = useReservationsWithDetails()
  const { data: rooms } = useRooms()

  const currentMonth = new Date()
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)

  // Reservas do mês atual
  const monthlyReservations = reservations?.filter(reservation => {
    const reservationDate = new Date(reservation.start_time)
    return isWithinInterval(reservationDate, { start: monthStart, end: monthEnd })
  }) || []

  // Estatísticas gerais
  const totalReservations = reservations?.length || 0
  const approvedReservations = reservations?.filter(r => r.status === 'approved').length || 0
  const occupancyRate = totalReservations > 0 ? (approvedReservations / totalReservations) * 100 : 0

  // Salas mais utilizadas
  const roomUsage = reservations?.reduce((acc, reservation) => {
    if (reservation.status === 'approved') {
      const roomName = reservation.rooms.name
      acc[roomName] = (acc[roomName] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>) || {}

  const topRooms = Object.entries(roomUsage)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  // Usuários mais ativos
  const userActivity = reservations?.reduce((acc, reservation) => {
    // Ajuste para acessar corretamente o nome do usuário
    const userName = reservation.user?.name || 'Desconhecido'
    acc[userName] = (acc[userName] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const topUsers = Object.entries(userActivity)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  // Reservas por status
  const statusStats = reservations?.reduce((acc, reservation) => {
    acc[reservation.status] = (acc[reservation.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-600">
          Análise de uso e ocupação das salas
        </p>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Reservas</p>
                <p className="text-2xl font-bold text-gray-900">{totalReservations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa de Aprovação</p>
                <p className="text-2xl font-bold text-gray-900">{occupancyRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Salas Ativas</p>
                <p className="text-2xl font-bold text-gray-900">{rooms?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Este Mês</p>
                <p className="text-2xl font-bold text-gray-900">{monthlyReservations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Salas Mais Utilizadas */}
        <Card>
          <CardHeader>
            <CardTitle>Salas Mais Utilizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topRooms.length > 0 ? (
                topRooms.map(([roomName, count], index) => (
                  <div key={roomName} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="flex items-center justify-center w-6 h-6 bg-primary-100 text-primary-800 rounded-full text-xs font-medium mr-3">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{roomName}</span>
                    </div>
                    <span className="text-sm text-gray-600">{count} reservas</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum dado disponível</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Usuários Mais Ativos */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários Mais Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topUsers.length > 0 ? (
                topUsers.map(([userName, count], index) => (
                  <div key={userName} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-xs font-medium mr-3">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{userName}</span>
                    </div>
                    <span className="text-sm text-gray-600">{count} reservas</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum dado disponível</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status das Reservas */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-900">{statusStats.pending || 0}</p>
              <p className="text-sm text-yellow-700">Pendentes</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-900">{statusStats.approved || 0}</p>
              <p className="text-sm text-green-700">Aprovadas</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-900">{statusStats.rejected || 0}</p>
              <p className="text-sm text-red-700">Rejeitadas</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{statusStats.cancelled || 0}</p>
              <p className="text-sm text-gray-700">Canceladas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}