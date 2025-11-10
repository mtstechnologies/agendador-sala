import nodemailer from 'nodemailer'

let transporter: nodemailer.Transporter | undefined

export function getTransport() {
  if (transporter) return transporter
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) {
    throw new Error('SMTP não configurado. Defina SMTP_HOST, SMTP_USER e SMTP_PASS no .env')
  }
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    auth: { user, pass },
  })
  return transporter
}

type MailOpts = {
  cc?: string | string[]
  bcc?: string | string[]
  text?: string
}

export async function sendMail(to: string, subject: string, html: string, opts?: MailOpts) {
  const transporter = getTransport()
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@example.com'
  const textFallback = opts?.text ?? html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const message: any = { from, to, subject, html, text: textFallback }
  if (opts?.cc) message.cc = opts.cc
  if (opts?.bcc) message.bcc = opts.bcc
  const info = await transporter.sendMail(message)
  const debug = String(process.env.EMAIL_DEBUG || '').toLowerCase() === 'true' || process.env.NODE_ENV !== 'production'
  if (debug) {
    // Log enxuto para depuração
    console.log('[email] enviado', {
      to,
      cc: message.cc,
      bcc: message.bcc ? '[oculto]' : undefined,
      subject,
      messageId: info?.messageId,
    })
  }
}
