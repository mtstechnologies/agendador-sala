import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getReservations(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string | undefined;
    const where = userId ? { userId } : undefined;
    const reservations = await prisma.reservation.findMany({
      where,
      include: { room: true, user: true },
      orderBy: { startTime: 'asc' }
    });
    res.json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}

export async function createReservation(req: Request, res: Response) {
  try {
    const { roomId, userId, title, description, startTime, endTime } = req.body;
    if (!roomId || !userId || !title || !startTime || !endTime) {
      return res.status(400).json({ error: 'Dados obrigatórios ausentes' });
    }
    const reservation = await prisma.reservation.create({
      data: {
        roomId,
        userId,
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: 'pending'
      }
    });
    res.status(201).json(reservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}

export async function updateReservation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID inválido' });
    }
    // Verifica se existe
    const exists = await prisma.reservation.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }
    const updates = req.body;
    const reservation = await prisma.reservation.update({
      where: { id },
      data: { ...updates, updatedAt: new Date() }
    });
    res.json(reservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}

export async function cancelReservation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID inválido' });
    }
    // Verifica se existe
    const exists = await prisma.reservation.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }
    const reservation = await prisma.reservation.update({
      where: { id },
      data: { status: 'cancelled', updatedAt: new Date() }
    });
    res.json(reservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}
