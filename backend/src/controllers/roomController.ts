import { Request, Response } from 'express'
import { z } from 'zod'
import {
  listRooms,
  getRoom as getRoomSvc,
  createRoom as createRoomSvc,
  updateRoom as updateRoomSvc,
  deleteRoom as deleteRoomSvc,
} from '../services/roomService'
import { prisma } from '../config/prisma'

export async function getRooms(req: Request, res: Response) {
  try {
    const includeInactive = String(req.query.includeInactive || '').toLowerCase() === 'true'
    const rooms = await listRooms(includeInactive)
    res.json(rooms)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function getRoomById(req: Request, res: Response) {
  try {
    const { id } = req.params
    const room = await getRoomSvc(id)
    if (!room) return res.status(404).json({ error: 'Sala não encontrada' })
    res.json(room)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function createRoom(req: Request, res: Response) {
  try {
    const schema = z.object({
      name: z.string().min(1).max(12),
      capacity: z.number().int().min(1),
      resources: z.array(z.string()).default([]),
      bloco: z.string().min(1),
      department: z.string().min(1),
      operatingHours: z.any().optional().nullable(),
      isActive: z.boolean().optional(),
    })
    const payload = schema.parse(req.body)
    payload.name = normalizeRoomName(payload.name)
    if (Array.isArray(payload.resources)) {
      payload.resources = normalizeResources(payload.resources)
    }
    payload.bloco = normalizeBloco(payload.bloco)
    payload.department = normalizeDepartment(payload.department)
    const room = await createRoomSvc(payload)
    res.status(201).json(room)
  } catch (error) {
    console.error(error)
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', issues: error.issues })
    }
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function updateRoom(req: Request, res: Response) {
  try {
    const { id } = req.params
    const exists = await getRoomSvc(id)
    if (!exists) return res.status(404).json({ error: 'Sala não encontrada' })

    const schema = z.object({
      name: z.string().min(1).max(12).optional(),
      capacity: z.number().int().min(1).optional(),
      resources: z.array(z.string()).optional(),
      bloco: z.string().min(1).optional(),
      department: z.string().min(1).optional(),
      operatingHours: z.any().optional().nullable(),
      isActive: z.boolean().optional(),
    })
    const payload = schema.parse(req.body)
    if (payload.name) payload.name = normalizeRoomName(payload.name)
    if (Array.isArray(payload.resources)) {
      payload.resources = normalizeResources(payload.resources)
    }
    if (payload.bloco) payload.bloco = normalizeBloco(payload.bloco)
    if (payload.department) payload.department = normalizeDepartment(payload.department)
    const updated = await updateRoomSvc(id, payload)
    res.json(updated)
  } catch (error) {
    console.error(error)
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', issues: error.issues })
    }
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

// Helpers
function normalizeRoomName(raw: string) {
  const trimmed = raw.trim().replace(/\s+/g, ' ')
  if (!trimmed) return ''
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

function titleCase(str: string) {
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(w => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : '')
    .join(' ')
}

function normalizeResources(list: string[]) {
  return list
    .map(r => titleCase(r))
    .filter(r => r.length > 0)
}

function normalizeBloco(raw: string) {
  return raw.trim().replace(/\s+/g, ' ').toUpperCase()
}

function normalizeDepartment(raw: string) {
  return raw.trim().replace(/\s+/g, ' ').toUpperCase()
}

export async function deleteRoom(req: Request, res: Response) {
  try {
    const { id } = req.params
    const exists = await getRoomSvc(id)
    if (!exists) return res.status(404).json({ error: 'Sala não encontrada' })
    const force = String(req.query.force || '').toLowerCase() === 'true'
    // Verifica reservas vinculadas
    const reservationCount = await prisma.reservation.count({ where: { roomId: id } })
    if (reservationCount > 0 && !force) {
      return res.status(409).json({
        error: 'Sala possui reservas associadas. Cancele-as primeiro ou use ?force=true para excluir tudo.',
        reservations: reservationCount
      })
    }
    if (reservationCount > 0 && force) {
      await prisma.$transaction([
        prisma.reservation.deleteMany({ where: { roomId: id } }),
        prisma.room.delete({ where: { id } })
      ])
      return res.status(204).send()
    }
    await deleteRoomSvc(id)
    return res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
