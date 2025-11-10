import { Request, Response } from 'express'
// import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { sendMail } from '../utils/mailer'
import { prisma } from '../config/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret'
const JWT_ISSUER = process.env.JWT_ISSUER || 'agendador-sala-api'
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'agendador-sala-frontend'

export async function register(req: Request, res: Response) {
  try {
    const { email, password, fullName, department, matricula: matriculaFromBody } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Dados obrigatórios ausentes' });
    }
  const normalizedFullName = String(fullName).trim().toUpperCase()
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email já cadastrado' });
    const hash = await bcrypt.hash(password, 10);
    const matricula = typeof matriculaFromBody === 'string' && matriculaFromBody.trim() !== ''
      ? matriculaFromBody.trim().toUpperCase()
      : `M${Date.now()}`;
    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        fullName: normalizedFullName,
        matricula,
        department,
        role: 'user'
      }
    });
    res.status(201).json({ id: user.id, email: user.email, fullName: user.fullName, role: user.role, department: user.department });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Dados obrigatórios ausentes' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithm: 'HS256',
    });
    res.json({ token, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, department: user.department } });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}

function toTitleCase(name: string) {
  const LOWER_PARTICLES = new Set(['da','de','do','das','dos','di','du','e'])
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word, index) => {
      if (!word) return ''
      const lower = word.toLowerCase()
      // Trata nomes hifenizados individualmente (ex.: maria-clara, joão-pedro)
      const hyphenParts = lower.split('-').map((hp, hpIndex) => {
        if (!hp) return ''
        // Partículas só ficam minúsculas se NÃO forem a primeira palavra geral e não forem a primeira parte de um hifenizado iniciando o nome
        if (index > 0 && LOWER_PARTICLES.has(hp)) {
          return hp
        }
        return hp.charAt(0).toUpperCase() + hp.slice(1)
      })
      return hyphenParts.join('-')
    })
    .join(' ')
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body as { email: string }
    const user = await prisma.user.findUnique({ where: { email } })
    // Para evitar enumeração de emails, sempre responder sucesso
    if (!user) {
      return res.json({ message: 'Se existir conta com este email, enviaremos instruções.' })
    }

    // Invalida tokens anteriores não usados (opcional)
  await (prisma as any).passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } })

    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30) // 30 minutos

    await (prisma as any).passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    })

    const baseUrl = process.env.APP_BASE_URL || 'http://localhost:5173'
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`
    const html = `
      <p>Olá,</p>
      <p>Recebemos uma solicitação para redefinir sua senha. Clique no link abaixo para continuar. Este link expira em 30 minutos.</p>
      <p><a href="${resetUrl}">Redefinir senha</a></p>
      <p>Se você não solicitou, ignore este email.</p>
    `
    try {
      await sendMail(user.email, 'Redefinição de senha', html)
    } catch (e) {
      console.error('Falha ao enviar email:', e)
      // Não vazar detalhes ao cliente
    }

    return res.json({ message: 'Se existir conta com este email, enviaremos instruções.' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, password } = req.body as { token: string; password: string }
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const now = new Date()
    const record = await (prisma as any).passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: now },
      },
    })
    if (!record) {
      return res.status(400).json({ error: 'Token inválido ou expirado' })
    }

    const hash = await bcrypt.hash(password, 10)
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { password: hash } }),
      (prisma as any).passwordResetToken.update({ where: { id: record.id }, data: { usedAt: now } }),
    ])
    // Notificar usuário por email que a senha foi alterada
    try {
      const user = await prisma.user.findUnique({ where: { id: record.userId }, select: { email: true, fullName: true } })
      if (user?.email) {
        const baseUrl = process.env.APP_BASE_URL || 'http://localhost:5173'
        const html = `
          <p>Olá${user.fullName ? `, ${user.fullName}` : ''}.</p>
          <p>A senha da sua conta foi alterada em ${new Date().toLocaleString('pt-BR', { timeZone: process.env.TZ || 'America/Sao_Paulo' })}.</p>
          <p>Se não foi você, <a href="${baseUrl}/forgot-password">clique aqui</a> para redefinir novamente e procure o administrador.</p>
        `
        await sendMail(user.email, 'Sua senha foi alterada', html)
      }
    } catch (e) {
      console.error('Falha ao enviar notificação de alteração de senha:', e)
      // Não falhar o fluxo principal por erro de email
    }
    // Não fazer auto-login após reset por segurança
    return res.json({ message: 'Senha redefinida com sucesso' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
