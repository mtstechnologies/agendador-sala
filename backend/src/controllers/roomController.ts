import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getRooms(req: Request, res: Response) {
  try {
    const rooms = await prisma.room.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })
    res.json(rooms)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar salas' })
  }
}

export async function getRoomById(req: Request, res: Response) {
  try {
    const { id } = req.params
    const room = await prisma.room.findUnique({ where: { id } })
    if (!room) return res.status(404).json({ error: 'Sala não encontrada' })
    res.json(room)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar sala' })
  }
}
