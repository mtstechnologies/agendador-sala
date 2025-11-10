import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Listar todos os usuários
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        matricula: true,
        role: true,
        department: true,
        avatar_url: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
};

// Criar um novo usuário
export const createUser = async (req: Request, res: Response) => {
  const { fullName, email, matricula, password, role, department, avatar_url } = req.body;

  if (!fullName || !email || !matricula || !password || !role) {
    return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedFullName = String(fullName).trim().toUpperCase();
    const normalizedMatricula = String(matricula).trim().toUpperCase();
    const newUser = await prisma.user.create({
      data: {
        fullName: normalizedFullName,
        email,
        matricula: normalizedMatricula,
        password: hashedPassword,
        role,
        department,
        avatar_url,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
};

// Atualizar um usuário
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { fullName, email, matricula, role, department, avatar_url } = req.body;

  try {
    // Se houver mudança de role de admin -> user, garantir que não é o último admin
    if (typeof role === 'string') {
      const current = await prisma.user.findUnique({ where: { id }, select: { role: true } })
      if (!current) return res.status(404).json({ error: 'Usuário não encontrado.' })
      const isDroppingAdmin = current.role === 'admin' && role !== 'admin'
      if (isDroppingAdmin) {
        const admins = await prisma.user.count({ where: { role: 'admin', NOT: { id } } })
        if (admins === 0) {
          return res.status(400).json({ error: 'Não é possível remover a permissão do último administrador.' })
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        fullName: typeof fullName === 'string' ? String(fullName).trim().toUpperCase() : undefined,
        email,
        matricula: typeof matricula === 'string' ? String(matricula).trim().toUpperCase() : undefined,
        role,
        department,
        avatar_url,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar usuário.' });
  }
};

// Deletar um usuário
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Impedir exclusão do último admin
    const target = await prisma.user.findUnique({ where: { id }, select: { role: true } })
    if (!target) return res.status(404).json({ error: 'Usuário não encontrado.' })
    if (target.role === 'admin') {
      const admins = await prisma.user.count({ where: { role: 'admin', NOT: { id } } })
      if (admins === 0) {
        return res.status(400).json({ error: 'Não é possível excluir o último administrador.' })
      }
    }

    const force = String(req.query.force || '').toLowerCase() === 'true'
    const reservationCount = await prisma.reservation.count({ where: { userId: id } })
    if (reservationCount > 0 && !force) {
      return res.status(409).json({
        error: 'Usuário possui reservas associadas. Cancele-as primeiro ou use ?force=true para excluir tudo.',
        reservations: reservationCount
      })
    }
    if (reservationCount > 0 && force) {
      await prisma.$transaction([
        prisma.reservation.deleteMany({ where: { userId: id } }),
        prisma.user.delete({ where: { id } })
      ])
      return res.status(204).send()
    }
    await prisma.user.delete({ where: { id } })
    return res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar usuário.' });
  }
};
