import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  fullName: z.string().min(1, 'Nome completo é obrigatório'),
  department: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export function validateRegister(req: Request, res: Response, next: NextFunction) {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: result.error.errors.map(e => ({ path: e.path, message: e.message }))
    });
  }
  next();
}

export function validateLogin(req: Request, res: Response, next: NextFunction) {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: result.error.errors.map(e => ({ path: e.path, message: e.message }))
    });
  }
  next();
}

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Token inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

export function validateForgotPassword(req: Request, res: Response, next: NextFunction) {
  const result = forgotPasswordSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: result.error.errors.map(e => ({ path: e.path, message: e.message })),
    })
  }
  next()
}

export function validateResetPassword(req: Request, res: Response, next: NextFunction) {
  const result = resetPasswordSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: result.error.errors.map(e => ({ path: e.path, message: e.message })),
    })
  }
  next()
}
