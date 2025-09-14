import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret'

export async function register(req: Request, res: Response) {
  try {
    const { email, password, fullName, department } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Dados obrigatórios ausentes' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email já cadastrado' });
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        fullName,
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
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, department: user.department } });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}
