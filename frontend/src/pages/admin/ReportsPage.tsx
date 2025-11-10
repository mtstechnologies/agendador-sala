import React, { useMemo } from 'react'
import { useRooms } from '../../hooks/useRooms'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { BarChart3, TrendingUp, Calendar, MapPin } from 'lucide-react'
import { startOfMonth, endOfMonth } from 'date-fns'
import { useReports } from '../../hooks/useAdmin'

export function ReportsPage() {
  const { data: reports } = useReports()
  const { data: rooms } = useRooms({ includeInactive: true })

  const currentMonth = new Date()
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)

  // Os dados já vêm agregados do backend via /admin/reports
  const totalReservations = reports?.totals?.all ?? 0
  const approvedReservations = reports?.totals?.approved ?? 0
  const occupancyRate = totalReservations > 0 ? (approvedReservations / totalReservations) * 100 : 0

  const topRooms = reports?.topRooms?.slice(0, 5) ?? []
  const topUsers = reports?.topUsers?.slice(0, 5) ?? []
  const statusStats = reports?.totals ?? {}

  // Para exibir dados do mês atual, assumimos que o backend retorna também monthlyTotals opcionalmente
  const monthlyCount = reports?.monthlyTotals?.[`${currentMonth.getFullYear()}-${String(currentMonth.getMonth()+1).padStart(2,'0')}`] ?? 0

  const inactiveRooms = (rooms || []).filter(r => !r.isActive).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-600">
          Análise de uso e ocupação das salas
        </p>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <StatCard title="Total de Reservas" value={totalReservations} icon={Calendar} colorClass="text-blue-600" />
        <StatCard title="Taxa de Aprovação" value={`${occupancyRate.toFixed(1)}%`} icon={TrendingUp} colorClass="text-green-600" />
        <StatCard title="Salas Ativas" value={(rooms || []).filter(r => r.isActive).length} icon={MapPin} colorClass="text-purple-600" />
  <StatCard title="Este Mês" value={monthlyCount} icon={BarChart3} colorClass="text-orange-600" />
        <StatCard title="Salas Inativas" value={inactiveRooms} icon={BarChart3} colorClass="text-red-600" />
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
                topRooms.map((entry: any, index: number) => (
                  <div key={entry.roomName ?? entry.name ?? index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="flex items-center justify-center w-6 h-6 bg-primary-100 text-primary-800 rounded-full text-xs font-medium mr-3">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{entry.roomName ?? entry.name ?? 'Sala'}</span>
                    </div>
                    <span className="text-sm text-gray-600">{entry.count ?? entry.total ?? 0} reservas</span>
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
                topUsers.map((entry: any, index: number) => (
                  <div key={entry.userName ?? entry.name ?? index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-xs font-medium mr-3">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{entry.userName ?? entry.name ?? 'Usuário'}</span>
                    </div>
                    <span className="text-sm text-gray-600">{entry.count ?? entry.total ?? 0} reservas</span>
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