function fmtDate(d: Date | string, tz = process.env.TZ || 'America/Sao_Paulo') {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleString('pt-BR', { timeZone: tz })
}

function layout(title: string, bodyHtml: string) {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
    <div style="max-width: 640px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
      <div style="background: #111827; color: #fff; padding: 16px 20px;">
        <h2 style="margin: 0; font-size: 18px;">${title}</h2>
      </div>
      <div style="padding: 20px;">
        ${bodyHtml}
      </div>
      <div style="background: #f9fafb; color: #6b7280; padding: 12px 20px; font-size: 12px;">
        <p style="margin: 0;">Este é um e-mail automático do sistema de reservas.</p>
      </div>
    </div>
  </div>`
}

export function tplReservationCreatedUser(params: {
  userName?: string
  roomName: string
  bloco?: string
  title: string
  start: Date | string
  end: Date | string
}) {
  const { userName, roomName, bloco, title, start, end } = params
  const body = `
    <p>Olá ${userName ?? ''}</p>
    <p>Sua reserva foi criada e está <strong>pendente de aprovação</strong>.</p>
    <ul>
      <li><strong>Sala:</strong> ${roomName}${bloco ? ` (Bloco ${bloco})` : ''}</li>
      <li><strong>Título:</strong> ${title}</li>
      <li><strong>Período:</strong> ${fmtDate(start)} &rarr; ${fmtDate(end)}</li>
    </ul>
    <p>Você receberá um e-mail quando for aprovada ou rejeitada.</p>
  `
  return layout('Reserva criada (pendente)', body)
}

export function tplReservationCreatedAdmin(params: {
  requester: string
  roomName: string
  bloco?: string
  title: string
  start: Date | string
  end: Date | string
}) {
  const { requester, roomName, bloco, title, start, end } = params
  const body = `
    <p>Olá, Admin.</p>
    <p>Uma nova reserva foi realizada e está com status <strong>pendente</strong>:</p>
    <ul>
      <li><strong>Sala:</strong> ${roomName}${bloco ? ` (Bloco ${bloco})` : ''}</li>
      <li><strong>Título:</strong> ${title}</li>
      <li><strong>Período:</strong> ${fmtDate(start)} &rarr; ${fmtDate(end)}</li>
      <li><strong>Solicitante:</strong> ${requester}</li>
    </ul>
    <p>Você pode aprovar ou rejeitar no painel administrativo.</p>
  `
  return layout('Nova reserva (pendente)', body)
}

export function tplReservationApprovedUser(params: {
  userName?: string
  roomName: string
  bloco?: string
  title: string
  start: Date | string
  end: Date | string
}) {
  const { userName, roomName, bloco, title, start, end } = params
  const body = `
    <p>Olá ${userName ?? ''}</p>
    <p>Sua solicitação de reserva foi <strong>aprovada</strong>.</p>
    <ul>
      <li><strong>Sala:</strong> ${roomName}${bloco ? ` (Bloco ${bloco})` : ''}</li>
      <li><strong>Título:</strong> ${title}</li>
      <li><strong>Período:</strong> ${fmtDate(start)} &rarr; ${fmtDate(end)}</li>
    </ul>
    <p>Bom uso!</p>
  `
  return layout('Reserva aprovada', body)
}

export function tplReservationRejectedUser(params: {
  userName?: string
  roomName: string
  bloco?: string
  title: string
  start: Date | string
  end: Date | string
}) {
  const { userName, roomName, bloco, title, start, end } = params
  const body = `
    <p>Olá ${userName ?? ''}</p>
    <p>Sua solicitação de reserva foi <strong>rejeitada</strong>.</p>
    <ul>
      <li><strong>Sala:</strong> ${roomName}${bloco ? ` (Bloco ${bloco})` : ''}</li>
      <li><strong>Título:</strong> ${title}</li>
      <li><strong>Período:</strong> ${fmtDate(start)} &rarr; ${fmtDate(end)}</li>
    </ul>
    <p>Se necessário, ajuste os horários ou escolha outra sala e tente novamente.</p>
  `
  return layout('Reserva rejeitada', body)
}

export function tplReservationCancelledUser(params: {
  userName?: string
  roomName: string
  bloco?: string
  title: string
  start: Date | string
  end: Date | string
  cancelledByAdmin?: boolean
}) {
  const { userName, roomName, bloco, title, start, end, cancelledByAdmin } = params
  const body = `
    <p>Olá ${userName ?? ''}</p>
    <p>Sua reserva foi <strong>cancelada</strong>${cancelledByAdmin ? ' por um administrador' : ''}.</p>
    <ul>
      <li><strong>Sala:</strong> ${roomName}${bloco ? ` (Bloco ${bloco})` : ''}</li>
      <li><strong>Título:</strong> ${title}</li>
      <li><strong>Período:</strong> ${fmtDate(start)} &rarr; ${fmtDate(end)}</li>
    </ul>
  `
  return layout('Reserva cancelada', body)
}
