import { Response } from 'express'
import jwt from 'jsonwebtoken'

type Client = {
  id: string
  res: Response
  role?: string
}

// Lista em memória dos clients SSE conectados
const clients: Client[] = []

export function addClient(id: string, res: Response, role?: string) {
  clients.push({ id, res, role })
}

export function removeClient(id: string) {
  const idx = clients.findIndex(c => c.id === id)
  if (idx >= 0) clients.splice(idx, 1)
}

export function broadcast(type: string, payload: any) {
  const data = JSON.stringify({ type, payload })
  for (const c of clients) {
    // Opcional: só admins recebem certos eventos (ex.: created pendente)
    if (type === 'reservation-created' && c.role && c.role !== 'admin') continue
    try {
      c.res.write(`event: message\n`)
      c.res.write(`data: ${data}\n\n`)
    } catch (e) {
      // Se falhar ao escrever, remover client
      removeClient(c.id)
    }
  }
}

// Utilitário para validar token vindo como query param (?token=...)
export function decodeTokenMaybe(token?: string): { id: string; role?: string } | null {
  if (!token) return null
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string, {
      algorithms: ['HS256'],
      issuer: process.env.JWT_ISSUER || 'agendador-sala-api',
      audience: process.env.JWT_AUDIENCE || 'agendador-sala-frontend',
    }) as any
    return { id: decoded.id, role: decoded.role }
  } catch {
    return null
  }
}
