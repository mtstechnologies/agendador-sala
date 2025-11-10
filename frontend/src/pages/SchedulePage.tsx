import React, { useMemo, useRef, useState, useEffect } from 'react'
import { useRooms } from '../hooks/useRooms'
import { useReservationsForDay } from '../hooks/useReservations'
import { useAuth } from '../hooks/useAuth'
import { format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '../components/ui/Button'
import { ReservationForm } from '../components/reservations/ReservationForm'
import { Card } from '../components/ui/Card'
import { Users } from 'lucide-react'
import { Modal } from '../components/ui/Modal'
import type { Room } from '../types/database'
import DateNav from '../components/ui/DateNav'
import { Plus } from 'lucide-react'
import { parseYmd, hourFromIsoWithOffset } from '../lib/time'

export function SchedulePage() {
  const { data: rooms } = useRooms()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const dateISO = format(selectedDate, 'yyyy-MM-dd')
  const { data: reservations } = useReservationsForDay(dateISO)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [slotStart, setSlotStart] = useState<string | undefined>(undefined)
  const [slotEnd, setSlotEnd] = useState<string | undefined>(undefined)
  const { isAdmin } = useAuth()

  const HOURS = useMemo(() => Array.from({ length: 15 }, (_, i) => 7 + i), []) // 7..21

  const handlePrevDay = () => setSelectedDate(addDays(selectedDate, -1))
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1))
  const handleToday = () => setSelectedDate(new Date())

  // Agrupa reservas por sala
  const reservationsByRoom = useMemo(() => {
    const map: Record<string, any[]> = {}
    for (const room of rooms || []) {
      map[room.id] = (reservations || []).filter((r: any) => (r.roomId || r.room_id) === room.id)
    }
    return map
  }, [rooms, reservations])

  // Determinístico: converte ISO UTC para hora local fixa usando offset (UTC-3)
  const startsAtHour = (r: any) => hourFromIsoWithOffset(r.startTime || r.start_time, -180)
  const endsAtHour = (r: any) => hourFromIsoWithOffset(r.endTime || r.end_time, -180)

  const isCovered = (roomId: string, hour: number) => {
    const list = reservationsByRoom[roomId] || []
    return list.some((r) => {
      const status: string = (r.status || r.reservation_status || '').toString()
      // Somente pendentes/aprovadas bloqueiam o horário
      const blocks = status === 'pending' || status === 'approved'
      if (!blocks) return false
      const s = startsAtHour(r)
      const e = Math.max(s + 1, Math.min(endsAtHour(r), 22)) // clamp to 22
      return hour >= s && hour < e
    })
  }

  const getReservationAt = (roomId: string, hour: number) => {
    const list = reservationsByRoom[roomId] || []
    return list.find((r) => startsAtHour(r) === hour)
  }

  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // garante que a visualização inicie às 7:00
    if (scrollRef.current) scrollRef.current.scrollLeft = 0
  }, [])

  return (
  <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Painel de Agendamento</h1>
        <p className="text-gray-600">Visualize a disponibilidade e agende sua sala com facilidade.</p>
      </div>
      {/* Painel completo (toolbar + grade) dentro de um mesmo contêiner */}
  <div className="rounded-xl border border-gray-200 bg-white relative dark:border-gray-700 dark:bg-gray-800">
    {/* Toolbar dentro do painel */}
  <div className="flex items-center justify-between px-4 py-3 relative z-60">
          <div className="flex items-center gap-3">
            <DateNav
              value={dateISO}
              onChange={(iso) => {
                const p = parseYmd(iso)
                if (p) setSelectedDate(new Date(p.Y, p.M, p.D))
              }}
              size="sm"
              showClear
              onClear={() => setSelectedDate(new Date())}
            />
          </div>
          <div className="relative z-20">
            <Button size="sm" variant="primary" onClick={() => { setSelectedRoom((rooms || [])[0] || null); setShowForm(true) }}>
              <Plus className="-ml-1 mr-2 h-4 w-4" />
              Criar Agendamento
            </Button>
          </div>
  </div>

        {/* Wrapper do grid com scroll horizontal e overlay de linhas */}
        <div className="relative overflow-x-auto" ref={scrollRef}>

          {/* Header sticky */}
          <div className="sticky top-0 z-30 bg-white dark:bg-gray-800">
            <div
              className="grid [grid-template-columns:12rem_repeat(15,6.5rem)] items-end border-t border-b border-gray-200 dark:border-gray-700"
              style={{ width: 'calc(12rem + 6.5rem * 15)' }}
            >
              <div className="pl-3 pr-2 py-2 font-medium text-left border-r border-gray-300 dark:border-gray-600 sticky left-0 bg-white dark:bg-gray-800 z-30">Sala</div>
              {HOURS.map((h) => (
                <div key={`h-${h}`} className="text-xs text-gray-700 font-medium text-center py-2">{h}:00</div>
              ))}
            </div>
          </div>

          {/* Corpo */}
          <div className="relative">
            {/* Overlay de linhas verticais: somente no corpo (não afeta o cabeçalho) */}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 bottom-0 z-0"
              style={{
                left: '12rem',
                width: 'calc(6.5rem * 15)',
                background: 'repeating-linear-gradient(90deg, transparent 0, transparent calc(6.5rem - 1px), var(--grid-line) calc(6.5rem - 1px), var(--grid-line) 6.5rem)'
              }}
            />
            {(rooms || []).map((room) => {
              return (
                <div
                  key={room.id}
                  className="grid [grid-template-columns:12rem_repeat(15,6.5rem)] [grid-template-rows:3.5rem] relative items-stretch"
                >
                  {/* Coluna Sala (sticky à esquerda) */}
                  <div className="pl-3 pr-2 py-2 border-r border-gray-300 dark:border-gray-600 sticky left-0 bg-white dark:bg-gray-800 z-30 pointer-events-none">
                    <div className="text-sm font-medium text-gray-900">{room.name}</div>
                    <div className="mt-1 flex items-center gap-1 text-gray-400 text-xs">
                      <Users className="h-3.5 w-3.5" />
                      <span>{room.capacity}</span>
                    </div>
                  </div>

                  {/* Slots clicáveis (uma célula por hora) */}
                  {HOURS.map((h, i) => {
                    const covered = isCovered(room.id, h)
                    if (covered) {
                      return (
                        <div key={`covered-${room.id}-${h}`} className="p-1 pointer-events-none" style={{ gridColumn: i + 2, gridRow: '1' }}>
                          <div className="h-14 w-full rounded" />
                        </div>
                      )
                    }
                    return (
                      <div key={`slot-${room.id}-${h}`} className="p-1" style={{ gridColumn: i + 2, gridRow: '1' }}>
                        <button
                          type="button"
                          aria-label={`Criar agendamento para ${room.name} às ${h}:00`}
                          className={`h-14 w-full rounded border border-transparent hover:bg-green-50 hover:border-green-200 transition ${room.isActive ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}
                          onClick={() => {
                            if (!room.isActive) return
                            setSelectedRoom(room)
                            const hh = String(h).padStart(2, '0')
                            const next = String(Math.min(h + 1, 22)).padStart(2, '0')
                            setSlotStart(`${hh}:00`)
                            setSlotEnd(`${next}:00`)
                            setShowForm(true)
                          }}
                          title={room.isActive ? `Criar agendamento - Disponível às ${h}:00` : 'Sala inativa'}
                        />
                      </div>
                    )
                  })}

                  {/* Reservas (posicionadas por grid-column com spans) */}
                  {(reservationsByRoom[room.id] || []).map((r) => {
                    const status: string = (r.status || r.reservation_status || '').toString()
                    // Não renderiza canceladas/rejeitadas na grade para liberar slot visualmente
                    if (status === 'cancelled' || status === 'rejected') return null
                    const s = startsAtHour(r)
                    const e = Math.max(s + 1, Math.min(endsAtHour(r), 22))
                    // Fora da janela? não renderiza
                    if (e <= 7 || s >= 22) return null
                    const colStart = 2 + Math.max(0, s - 7) // primeira coluna é Sala
                    const rawSpan = Math.max(1, e - s)
                    const maxSpan = 16 - colStart + 1 // total colunas = 16 (Sala + 15 horas)
                    const span = Math.min(rawSpan, maxSpan)
                    const statusClasses =
                      status === 'approved'
                        ? 'bg-green-50 border-green-200 text-green-900'
                        : status === 'pending'
                        ? 'bg-yellow-50 border-yellow-200 text-yellow-900'
                        : status === 'rejected'
                        ? 'bg-red-50 border-red-200 text-red-900'
                        : status === 'cancelled'
                        ? 'bg-gray-50 border-gray-200 text-gray-700'
                        : 'bg-gray-50 border-gray-200 text-gray-700'
                    return (
                      <div
                        key={r.id}
                        className="p-1 relative z-10"
                        style={{ gridColumn: `${colStart} / span ${span}`, gridRow: '1' }}
                        title={`${r.title} (${s}:00–${e}:00) - ${status || 'indefinido'}`}
                      >
                        <Card className={`text-xs p-2 rounded-md border cursor-not-allowed ${statusClasses}`}>
                          <div className="font-medium truncate" title={r.title}>{r.title}</div>
                          <div className="truncate">{(r.user && (r.user.fullName || r.user.name)) || 'Usuário'}</div>
                        </Card>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {showForm && selectedRoom && (
  <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Criar Agendamento">
          <ReservationForm
            room={selectedRoom}
            onSuccess={() => { setShowForm(false) }}
            onCancel={() => setShowForm(false)}
            initialDate={dateISO}
            initialStartTime={slotStart}
            initialEndTime={slotEnd}
          />
        </Modal>
      )}
    </div>
  )
}

export default SchedulePage
