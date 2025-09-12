import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function approveReservation(req: Request, res: Response) {
  try {
    const { id } = req.params
    const reservation = await prisma.reservation.update({
      where: { id },
      data: { status: 'approved' }
    })
    res.json(reservation)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao aprovar reserva' })
  }
}

export async function rejectReservation(req: Request, res: Response) {
  try {
    const { id } = req.params
    const reservation = await prisma.reservation.update({
      where: { id },
      data: { status: 'rejected' }
    })
    res.json(reservation)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao rejeitar reserva' })
  }
}

export async function getReports(req: Request, res: Response) {
  try {
    // Exemplo simples: total de reservas por sala
    const report = await prisma.room.findMany({
      select: {
        id: true,
        name: true,
        reservations: true
      }
    })
    const result = report.map(room => ({
      roomId: room.id,
      roomName: room.name,
      totalReservations: room.reservations.length
    }))
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar relatório' })
  }
}
