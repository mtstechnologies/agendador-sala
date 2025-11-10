
import React, { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { useAuth } from '../../hooks/useAuth'
import { useCreateReservation } from '../../hooks/useReservations'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useRooms } from '../../hooks/useRooms'
import { DatePicker } from '../ui/DatePicker'
import type { Room } from '../../types/database'
import { makeLocalDateTimeISO } from '../../lib/time'

const reservationSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  date: z.string().min(1, 'Data é obrigatória'),
  startTime: z.string().min(1, 'Horário de início é obrigatório'),
  endTime: z.string().min(1, 'Horário de fim é obrigatório')
}).refine((data) => {
  const start = new Date(`${data.date}T${data.startTime}`)
  const end = new Date(`${data.date}T${data.endTime}`)
  return end > start
}, {
  message: "Horário de fim deve ser posterior ao de início",
  path: ["endTime"]
})

type ReservationFormData = z.infer<typeof reservationSchema>

interface ReservationFormProps {
  room: Room
  onSuccess: () => void
  onCancel: () => void
  initialDate?: string
  initialStartTime?: string
  initialEndTime?: string
}

export function ReservationForm({ room, onSuccess, onCancel, initialDate, initialStartTime, initialEndTime }: ReservationFormProps) {
  const { user } = useAuth()
  const createReservation = useCreateReservation()
  const [apiError, setApiError] = useState<string | null>(null)
  const { data: rooms } = useRooms()
  const activeRooms = useMemo(() => (rooms || []).filter(r => r.isActive), [rooms])
  const [selectedRoomId, setSelectedRoomId] = useState<string>(room?.id || activeRooms[0]?.id)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      date: initialDate || format(new Date(), 'yyyy-MM-dd'),
      startTime: initialStartTime,
      endTime: initialEndTime
    }
  })

  const onSubmit = async (data: ReservationFormData) => {
    setApiError(null)
    if (!user) return

    try {
  // Construir datas no fuso local para evitar derrubar para o dia seguinte com toISOString
  const startISO = makeLocalDateTimeISO(data.date, data.startTime)
  const endISO = makeLocalDateTimeISO(data.date, data.endTime)

      // Payload conforme backend espera
      await createReservation.mutateAsync({
        roomId: selectedRoomId || room.id,
        userId: user.id,
        title: data.title,
        // Envie undefined quando vazio para passar na validação do backend
        description: data.description?.trim() ? data.description : undefined,
  startTime: startISO,
  endTime: endISO,
        status: 'pending'
      } as any)

      onSuccess()
    } catch (error: any) {
      // Tenta extrair mensagem amigável
      let msg = 'Erro ao criar reserva'
      if (error?.response?.data?.error) msg = error.response.data.error
      else if (error?.message) msg = error.message
      setApiError(msg)
      console.error('Erro ao criar reserva:', error)
    }
  }

  // Gera opções de horário de 07:00 até 21:00 (inclusivo), de hora em hora
  const ALL_TIMES = useMemo(() => {
    const startH = 7
    const endH = 21
    const list: string[] = []
    for (let h = startH; h <= endH; h++) {
      list.push(`${String(h).padStart(2, '0')}:00`)
    }
    return list
  }, [])

  const selectedDate = watch('date')
  const startTime = watch('startTime')

  // Helpers para comparar horas HH:mm
  const parseHour = (t: string | undefined) => {
    if (!t) return NaN
    const m = /^(\d{2}):(\d{2})$/.exec(t)
    if (!m) return NaN
    return Number(m[1]) + Number(m[2]) / 60
  }

  const now = new Date()
  const todayISO = format(now, 'yyyy-MM-dd')
  const currentHour = now.getHours() + now.getMinutes() / 60
  const currentHourFloor = Math.floor(currentHour)
  const isToday = selectedDate === todayISO

  // Opções de início: oculta horários passados se for hoje
  const startOptions = useMemo(() => {
    return ALL_TIMES.filter((t) => {
      const h = parseHour(t)
      // Último horário (21:00) não pode ser início pois não há fim > início
      const hasFutureEnd = h < 21
      if (!hasFutureEnd) return false
      if (!isToday) return true
      // Permite iniciar no horário atual (hora cheia), não apenas no futuro
      return h >= currentHourFloor
    })
  }, [ALL_TIMES, isToday, currentHourFloor])

  // Opções de fim: deve ser estritamente maior que início e não pode estar no passado se for hoje
  const endOptions = useMemo(() => {
    const startH = parseHour(startTime)
    return ALL_TIMES.filter((t) => {
      const h = parseHour(t)
      const afterStart = isNaN(startH) ? true : h > startH
      const notPast = isToday ? h > currentHour : true
      return afterStart && notPast
    })
  }, [ALL_TIMES, startTime, isToday, currentHour])

  // Se o endTime atual for inválido após mudança de início/data, ajusta para a primeira opção válida
  useEffect(() => {
    const currentEnd = watch('endTime')
    if (!currentEnd) return
    if (!endOptions.includes(currentEnd)) {
      setValue('endTime', endOptions[0] || '')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime, selectedDate, endOptions])

  // Define um valor padrão para início quando a data mudar e não houver seleção
  useEffect(() => {
    if (!startTime) {
      // Se hoje, tenta usar a hora atual (cheia); senão, primeira opção disponível
      const preferred = isToday ? `${String(currentHourFloor).padStart(2, '0')}:00` : startOptions[0]
      const value = (preferred && startOptions.includes(preferred)) ? preferred : (startOptions[0] || '')
      if (value) setValue('startTime', value)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, startOptions])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-gray-500">Preencha os detalhes abaixo para criar sua reserva.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sala</label>
          <select
            className="input"
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
          >
            {activeRooms.map(r => (
              <option key={r.id} value={r.id}>{`${r.name} (Cap: ${r.capacity})`}</option>
            ))}
          </select>
        </div>
        <DatePicker
          label="Data"
          value={watch('date')}
          onChange={(val) => setValue('date', val, { shouldValidate: true })}
          min={format(new Date(), 'yyyy-MM-dd')}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
          <select
            className="input"
            {...register('startTime')}
            defaultValue={initialStartTime}
          >
            {startOptions.map(t => (<option key={t} value={t}>{t}</option>))}
          </select>
          {errors.startTime && <div className="text-xs text-red-600 mt-1">{errors.startTime.message}</div>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fim</label>
          <select
            className="input"
            {...register('endTime')}
            defaultValue={initialEndTime}
          >
            {endOptions.map(t => (<option key={t} value={t}>{t}</option>))}
          </select>
          {errors.endTime && <div className="text-xs text-red-600 mt-1">{errors.endTime.message}</div>}
        </div>
      </div>

      <Input
        label="Propósito da Reserva"
        {...register('title')}
        error={errors.title?.message}
        placeholder="Ex: Aula de Cálculo I"
      />

      {apiError && (
        <div className="text-red-500 text-sm font-medium">{apiError}</div>
      )}

      <div className="flex items-center pt-2">
        <div className="flex-1">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        </div>
        <div>
          <Button type="submit" loading={createReservation.isPending}>Salvar</Button>
        </div>
      </div>
    </form>
  )
}