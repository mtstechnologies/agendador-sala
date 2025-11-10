const DEFAULT_TZ = process.env.TIMEZONE || process.env.TZ || 'America/Sao_Paulo'

export function getTimezone() {
  return DEFAULT_TZ
}

export function parseYmd(dateStr: string): { Y: number; M: number; D: number } | null {
  const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(dateStr)
  if (!m) return null
  return { Y: Number(m[1]), M: Number(m[2]) - 1, D: Number(m[3]) }
}

// Retorna o intervalo [startUtc, endUtc) correspondente ao dia local
// Observação: sem dependência de date-fns-tz, usamos a hora local do Node
// Dica: garanta que o NODE_ENV local tenha TZ configurado (ou use default acima)
export function dayRangeUtcFromLocalDate(dateStr: string) {
  const parts = parseYmd(dateStr)
  if (!parts) return null
  const startLocal = new Date(parts.Y, parts.M, parts.D, 0, 0, 0, 0)
  const endLocal = new Date(parts.Y, parts.M, parts.D + 1, 0, 0, 0, 0)
  const startUtc = new Date(Date.UTC(
    startLocal.getFullYear(), startLocal.getMonth(), startLocal.getDate(),
    startLocal.getHours(), startLocal.getMinutes(), startLocal.getSeconds(), startLocal.getMilliseconds()
  ))
  const endUtc = new Date(Date.UTC(
    endLocal.getFullYear(), endLocal.getMonth(), endLocal.getDate(),
    endLocal.getHours(), endLocal.getMinutes(), endLocal.getSeconds(), endLocal.getMilliseconds()
  ))
  return { startUtc, endUtc }
}

// Formata uma data em pt-BR aplicando deslocamento fixo a partir do UTC (independente do SO)
// Útil para evitar regras antigas de DST no Windows.
export function formatPtBrWithOffset(date: Date, offsetMinutes?: number) {
  const off = typeof offsetMinutes === 'number'
    ? offsetMinutes
    : Number(process.env.EMAIL_TZ_OFFSET_MINUTES ?? '-180') // Padrão: São Paulo sem DST (UTC-3)
  const baseMs = Date.UTC(
    date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
    date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()
  )
  const ms = baseMs + off * 60_000
  const d = new Date(ms)
  const dd = String(d.getUTCDate()).padStart(2, '0')
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const yyyy = d.getUTCFullYear()
  const HH = String(d.getUTCHours()).padStart(2, '0')
  const MM = String(d.getUTCMinutes()).padStart(2, '0')
  const result = `${dd}/${mm}/${yyyy}, ${HH}:${MM}`
  const debug = String(process.env.EMAIL_DEBUG || '').toLowerCase() === 'true' || process.env.NODE_ENV !== 'production'
  if (debug) {
    // eslint-disable-next-line no-console
    console.log('[time.formatPtBrWithOffset]', {
      input: date instanceof Date ? date.toISOString() : String(date),
      utcIso: new Date(baseMs).toISOString(),
      offsetMinutes: off,
      result,
      resultIso: new Date(ms).toISOString(),
    })
  }
  return result
}
