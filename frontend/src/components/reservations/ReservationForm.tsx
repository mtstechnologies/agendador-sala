import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { useAuth } from '../../hooks/useAuth'
import { useCreateReservation } from '../../hooks/useReservations'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import type { Room } from '../../types/database'

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
}

export function ReservationForm({ room, onSuccess, onCancel }: ReservationFormProps) {
  const { user } = useAuth()
  const createReservation = useCreateReservation()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd')
    }
  })

  const onSubmit = async (data: ReservationFormData) => {
    if (!user) return

    try {
      const startTime = new Date(`${data.date}T${data.startTime}`)
      const endTime = new Date(`${data.date}T${data.endTime}`)

      await createReservation.mutateAsync({
        room_id: room.id,
        user_id: user.id,
        title: data.title,
        description: data.description || null,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'pending'
      })

      onSuccess()
    } catch (error) {
      console.error('Erro ao criar reserva:', error)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Reservar {room.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Título da Reserva"
            {...register('title')}
            error={errors.title?.message}
            placeholder="Ex: Aula de Matemática"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição (opcional)
            </label>
            <textarea
              {...register('description')}
              className="input min-h-[80px] resize-none"
              placeholder="Descreva o propósito da reserva..."
            />
          </div>

          <Input
            label="Data"
            type="date"
            {...register('date')}
            error={errors.date?.message}
            min={format(new Date(), 'yyyy-MM-dd')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Início"
              type="time"
              {...register('startTime')}
              error={errors.startTime?.message}
            />

            <Input
              label="Fim"
              type="time"
              {...register('endTime')}
              error={errors.endTime?.message}
            />
          </div>

          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
            <p><strong>Horário de funcionamento:</strong></p>
            <p>{room.operating_hours.start} às {room.operating_hours.end}</p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              className="flex-1"
              loading={createReservation.isPending}
            >
              Reservar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}