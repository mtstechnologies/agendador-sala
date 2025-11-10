import { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { dayRangeUtcFromLocalDate, formatPtBrWithOffset } from '../utils/time'
import { sendMail } from '../utils/mailer'
import { broadcast } from '../utils/events'

// usar prisma singleton de config/prisma para evitar múltiplas conexões

export async function getReservations(req: Request, res: Response) {
  try {
    const userId = req.query.userId as string | undefined;
    const roomId = req.query.roomId as string | undefined;
    const date = req.query.date as string | undefined;
    const status = req.query.status as string | undefined;
    // Paginação opcional (page 1-based)
    const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
    const pageSize = req.query.pageSize ? parseInt(String(req.query.pageSize), 10) : undefined;

    // Monta filtro dinâmico
    const where: any = {};
    if (userId) where.userId = userId;
    if (roomId) where.roomId = roomId;
    if (status) where.status = status;
    if (date) {
      const range = dayRangeUtcFromLocalDate(date)
      if (range) {
        where.startTime = { gte: range.startUtc, lt: range.endUtc }
      }
    }
    const baseWhere = Object.keys(where).length ? where : undefined

    // Sempre responder em formato paginado (compat mantida via defaults)
    const defaultPageSize = Number(process.env.API_DEFAULT_LIMIT || 50)
    const safePage = page && page > 0 ? page : 1
    const safePageSize = pageSize && pageSize > 0 ? pageSize : defaultPageSize

    const skip = (safePage - 1) * safePageSize
    const [total, items] = await Promise.all([
      prisma.reservation.count({ where: baseWhere }),
      prisma.reservation.findMany({
        where: baseWhere,
        include: { room: true, user: true },
        orderBy: { startTime: 'desc' },
        skip,
        take: safePageSize,
      })
    ])
    const totalPages = Math.max(1, Math.ceil(total / safePageSize))
    res.json({ items, page: safePage, pageSize: safePageSize, total, totalPages })
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
    const auth = (req as any).user as { id: string; role: string } | undefined
    const { roomId, title, description, startTime, endTime } = req.body;
    if (!roomId || !title || !startTime || !endTime) {
      return res.status(400).json({ error: 'Dados obrigatórios ausentes' });
    }
    if (!auth?.id) {
      return res.status(401).json({ error: 'Não autorizado' })
    }
    const start = new Date(startTime)
    const end = new Date(endTime)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Datas inválidas' })
    }
    if (end <= start) {
      return res.status(400).json({ error: 'Horário de fim deve ser posterior ao de início' })
    }
    // Verifica se a sala está ativa
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }
    if (!room.isActive) {
      return res.status(400).json({ error: 'Sala indisponível para reserva (inativa/manutenção).' });
    }
    // Verifica conflitos: qualquer reserva que intersecte [start, end)
    const conflict = await prisma.reservation.findFirst({
      where: {
        roomId,
        status: { in: ['pending', 'approved'] },
        startTime: { lt: end },
        endTime: { gt: start },
      },
      select: { id: true }
    })
    if (conflict) {
      return res.status(409).json({ error: 'Conflito de horário: já existe uma reserva nesse intervalo.' })
    }
    const reservation = await prisma.reservation.create({
      data: {
        roomId,
        userId: auth.id,
        title,
        description: description ?? undefined,
        startTime: start,
        endTime: end,
        status: 'pending'
      }
    });
    // Responder imediatamente ao cliente
  res.status(201).json(reservation);
  // Broadcast para admins
  broadcast('reservation-created', { id: reservation.id, status: reservation.status, roomId: reservation.roomId, startTime: reservation.startTime, endTime: reservation.endTime, title: reservation.title })

    // Disparar emails em background (não bloquear a resposta)
    ;(async () => {
      try {
        const adminEmail = process.env.ADMIN_EMAIL
        // Obter dados complementares
        const user = await prisma.user.findUnique({ where: { id: auth.id }, select: { email: true, fullName: true } })

        // Email para o solicitante
        if (user?.email) {
          const fmt = (d: Date) => formatPtBrWithOffset(d)
          const htmlUser = `
            <p>Olá ${user.fullName ?? ''}</p>
            <p>Sua reserva foi criada e está <strong>pendente de aprovação</strong>.</p>
            <ul>
              <li><strong>Sala:</strong> ${room.name}${(room as any).bloco ? ` (Bloco ${(room as any).bloco})` : ''}</li>
              <li><strong>Título:</strong> ${title}</li>
              <li><strong>Período:</strong> ${fmt(start)} &rarr; ${fmt(end)}</li>
            </ul>
            <p>Você receberá um e-mail quando for aprovada ou rejeitada.</p>
          `
          await sendMail(user.email, 'Reserva criada (pendente)', htmlUser)
        }

        // Email para o admin
        if (adminEmail) {
          const fmt = (d: Date) => formatPtBrWithOffset(d)
          const htmlAdmin = `
            <p>Olá, Admin.</p>
            <p>Uma nova reserva foi realizada e está com status <strong>pendente</strong>:</p>
            <ul>
              <li><strong>Sala:</strong> ${room.name}${(room as any).bloco ? ` (Bloco ${(room as any).bloco})` : ''}</li>
              <li><strong>Título:</strong> ${title}</li>
              <li><strong>Período:</strong> ${fmt(start)} &rarr; ${fmt(end)}</li>
              <li><strong>Solicitante:</strong> ${user?.fullName || user?.email || auth.id}</li>
            </ul>
            <p>Você pode aprovar ou rejeitar no painel administrativo.</p>
          `
          await sendMail(adminEmail, 'Nova reserva realizada (pendente)', htmlAdmin)
        }
      } catch (e) {
        console.error('Falha ao enviar notificação de nova reserva (async):', e)
      }
    })()
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

    // Segurança: apenas ADMIN pode alterar status
    if (typeof updates.status === 'string' && updates.status !== exists.status) {
      const auth = (req as any).user as { id: string; role: string } | undefined
      if (!auth || auth.role !== 'admin') {
        return res.status(403).json({ error: 'Apenas administradores podem alterar o status da reserva.' })
      }
    }
    // validações básicas
    const start = updates.startTime ? new Date(updates.startTime) : undefined
    const end = updates.endTime ? new Date(updates.endTime) : undefined
    if ((start && isNaN(start.getTime())) || (end && isNaN(end.getTime()))) {
      return res.status(400).json({ error: 'Datas inválidas' })
    }
    if (start && end && end <= start) {
      return res.status(400).json({ error: 'Horário de fim deve ser posterior ao de início' })
    }
    // Se horário mudar, verificar conflito
    const newStart = start ?? exists.startTime
    const newEnd = end ?? exists.endTime
    if (newStart && newEnd) {
      const conflict = await prisma.reservation.findFirst({
        where: {
          roomId: updates.roomId ?? exists.roomId,
          id: { not: id },
          OR: [
            { AND: [{ startTime: { lt: newEnd } }, { endTime: { gt: newStart } }] },
          ],
          status: { in: ['pending', 'approved'] },
        },
      })
      if (conflict) {
        return res.status(409).json({ error: 'Conflito de horário ao atualizar a reserva.' })
      }
    }
    const statusChanged = typeof updates.status === 'string' && updates.status !== exists.status
    const updated = await prisma.reservation.update({
      where: { id },
      data: { ...updates, updatedAt: new Date() },
      include: statusChanged ? { user: true, room: true } : undefined as any,
    });
    broadcast('reservation-updated', { id: updated.id, status: (updated as any).status, roomId: (updated as any).roomId, startTime: (updated as any).startTime, endTime: (updated as any).endTime })

    // Se status mudou para approved/rejected via este endpoint, também notifica o solicitante
    if (statusChanged && (updated as any).user && (updated as any).room) {
      const newStatus = (updated as any).status as string
      const to = (updated as any).user.email as string | undefined
      if (to && (newStatus === 'approved' || newStatus === 'rejected')) {
        try {
          const fmt = (d: Date) => formatPtBrWithOffset(new Date(d))
          const room = (updated as any).room
          const subject = newStatus === 'approved' ? 'Reserva aprovada' : 'Reserva rejeitada'
          const html = `
            <p>Olá ${(updated as any).user.fullName ?? ''}</p>
            <p>Sua solicitação de reserva foi <strong>${newStatus === 'approved' ? 'aprovada' : 'rejeitada'}</strong>.</p>
            <ul>
              <li><strong>Sala:</strong> ${room.name}${room.bloco ? ` (Bloco ${room.bloco})` : ''}</li>
              <li><strong>Título:</strong> ${(updated as any).title}</li>
              <li><strong>Período:</strong> ${fmt((updated as any).startTime)} &rarr; ${fmt((updated as any).endTime)}</li>
            </ul>
          `
          const bccAdmin = String(process.env.EMAIL_BCC_ADMIN_ON_DECISION || '').toLowerCase() === 'true'
          await sendMail(to, subject, html, { bcc: bccAdmin ? process.env.ADMIN_EMAIL : undefined })
        } catch (e) {
          console.error('Falha ao enviar notificação de decisão (updateReservation):', e)
        }
      }
    }

    // Retorno compatível sem relations
    const { user, room, ...rest } = updated as any
    res.json(rest)
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
    // Somente o dono da reserva ou admin pode cancelar
    const auth = (req as any).user as { id: string; role: string } | undefined
    if (!auth) {
      return res.status(401).json({ error: 'Não autorizado' })
    }
    const isOwner = exists.userId === auth.id
    const isAdmin = auth.role === 'admin'
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Apenas o criador ou um admin pode cancelar esta reserva.' })
    }
    // Não permitir cancelar reservas já finalizadas
    const now = new Date()
    if (exists.endTime <= now) {
      return res.status(400).json({ error: 'Não é possível cancelar uma reserva já encerrada.' })
    }
    if (exists.status !== 'pending' && exists.status !== 'approved') {
      return res.status(400).json({ error: 'Somente reservas pendentes ou aprovadas podem ser canceladas.' })
    }
    const reservation = await prisma.reservation.update({
      where: { id },
      data: { status: 'cancelled', updatedAt: new Date() }
    });
    broadcast('reservation-cancelled', { id: reservation.id, roomId: reservation.roomId, startTime: reservation.startTime, endTime: reservation.endTime })
    res.json(reservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}
