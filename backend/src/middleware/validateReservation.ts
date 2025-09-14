import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Schema para criação de reserva
export const reservationCreateSchema = z.object({
  roomId: z.string().min(1, 'roomId é obrigatório'),
  userId: z.string().min(1, 'userId é obrigatório'),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  startTime: z.string().min(1, 'startTime é obrigatório'),
  endTime: z.string().min(1, 'endTime é obrigatório'),
});

// Schema para atualização de reserva
export const reservationUpdateSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').optional(),
  description: z.string().optional(),
  startTime: z.string().min(1, 'startTime é obrigatório').optional(),
  endTime: z.string().min(1, 'endTime é obrigatório').optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional(),
});

export function validateReservationCreate(req: Request, res: Response, next: NextFunction) {
  const result = reservationCreateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: result.error.errors.map(e => ({ path: e.path, message: e.message }))
    });
  }
  next();
}

export function validateReservationUpdate(req: Request, res: Response, next: NextFunction) {
  const result = reservationUpdateSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: result.error.errors.map(e => ({ path: e.path, message: e.message }))
    });
  }
  next();
}
