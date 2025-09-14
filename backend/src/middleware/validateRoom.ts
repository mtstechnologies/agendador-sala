import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const roomCreateSchema = z.object({
  name: z.string().min(1, 'Nome da sala é obrigatório'),
  description: z.string().optional(),
  capacity: z.number().int().positive('Capacidade deve ser positiva'),
  isActive: z.boolean().optional(),
});

export const roomUpdateSchema = z.object({
  name: z.string().min(1, 'Nome da sala é obrigatório').optional(),
  description: z.string().optional(),
  capacity: z.number().int().positive('Capacidade deve ser positiva').optional(),
  isActive: z.boolean().optional(),
});

export function validateRoomCreate(req: Request, res: Response, next: NextFunction) {
  const result = roomCreateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: result.error.errors.map(e => ({ path: e.path, message: e.message }))
    });
  }
  next();
}

export function validateRoomUpdate(req: Request, res: Response, next: NextFunction) {
  const result = roomUpdateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: result.error.errors.map(e => ({ path: e.path, message: e.message }))
    });
  }
  next();
}
