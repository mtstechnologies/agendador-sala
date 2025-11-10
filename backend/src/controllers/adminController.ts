import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendMail } from '../utils/mailer'
import { formatPtBrWithOffset } from '../utils/time'

// usar prisma singleton

export async function approveReservation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const debug = String(process.env.EMAIL_DEBUG || '').toLowerCase() === 'true' || process.env.NODE_ENV !== 'production'
    if (debug) console.log('[admin] approveReservation called', { id })
    const updated = await prisma.reservation.update({
      where: { id },
      data: { status: 'approved' },
      include: { user: true, room: true },
    });

    // Disparar email async (não bloquear resposta)
    ;(async () => {
      try {
        const to = updated.user?.email
        if (to) {
          const fmt = (d: Date) => formatPtBrWithOffset(d)
          const html = `
            <p>Olá ${updated.user.fullName ?? ''}</p>
            <p>Sua solicitação de reserva foi <strong>aprovada</strong>.</p>
            <ul>
              <li><strong>Sala:</strong> ${updated.room.name}${(updated.room as any).bloco ? ` (Bloco ${(updated.room as any).bloco})` : ''}</li>
              <li><strong>Título:</strong> ${updated.title}</li>
              <li><strong>Período:</strong> ${fmt(updated.startTime)} &rarr; ${fmt(updated.endTime)}</li>
            </ul>
            <p>Bom uso!</p>
          `
          const bccAdmin = String(process.env.EMAIL_BCC_ADMIN_ON_DECISION || '').toLowerCase() === 'true'
          if (debug) console.log('[admin] sending approval email (async)', { to, room: updated.room.name, bccAdmin })
          await sendMail(to, 'Reserva aprovada', html, {
            bcc: bccAdmin ? process.env.ADMIN_EMAIL : undefined,
          })
        }
      } catch (e) {
        console.error('Falha ao enviar email de aprovação (async):', e)
      }
    })()

    // Retorna apenas o shape original (sem user/room)
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

export async function rejectReservation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const debug = String(process.env.EMAIL_DEBUG || '').toLowerCase() === 'true' || process.env.NODE_ENV !== 'production'
    if (debug) console.log('[admin] rejectReservation called', { id })
    const updated = await prisma.reservation.update({
      where: { id },
      data: { status: 'rejected' },
      include: { user: true, room: true },
    });

    // Disparar email async (não bloquear resposta)
    ;(async () => {
      try {
        const to = updated.user?.email
        if (to) {
          const fmt = (d: Date) => formatPtBrWithOffset(d)
          const html = `
            <p>Olá ${updated.user.fullName ?? ''}</p>
            <p>Sua solicitação de reserva foi <strong>rejeitada</strong>.</p>
            <ul>
              <li><strong>Sala:</strong> ${updated.room.name}${(updated.room as any).bloco ? ` (Bloco ${(updated.room as any).bloco})` : ''}</li>
              <li><strong>Título:</strong> ${updated.title}</li>
              <li><strong>Período:</strong> ${fmt(updated.startTime)} &rarr; ${fmt(updated.endTime)}</li>
            </ul>
            <p>Se necessário, ajuste os horários ou escolha outra sala e tente novamente.</p>
          `
          const bccAdmin = String(process.env.EMAIL_BCC_ADMIN_ON_DECISION || '').toLowerCase() === 'true'
          if (debug) console.log('[admin] sending rejection email (async)', { to, room: updated.room.name, bccAdmin })
          await sendMail(to, 'Reserva rejeitada', html, {
            bcc: bccAdmin ? process.env.ADMIN_EMAIL : undefined,
          })
        }
      } catch (e) {
        console.error('Falha ao enviar email de rejeição (async):', e)
      }
    })()

    // Retorna apenas o shape original (sem user/room)
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

export async function getReports(req: Request, res: Response) {
  try {
    // Agregação otimizada: contagem sem carregar todas as reservas
    const rooms = await prisma.room.findMany({ select: { id: true, name: true } })
    const counts = await prisma.reservation.groupBy({
      by: ['roomId'],
      _count: { roomId: true }
    })
    const mapCount = new Map(counts.map(c => [c.roomId, c._count.roomId]))
    const result = rooms.map(r => ({
      roomId: r.id,
      roomName: r.name,
      totalReservations: mapCount.get(r.id) || 0
    }))
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}
