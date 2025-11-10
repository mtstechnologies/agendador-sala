export function parseYmd(dateStr: string): { Y: number; M: number; D: number } | null {
  const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(dateStr)
  if (!m) return null
  return { Y: Number(m[1]), M: Number(m[2]) - 1, D: Number(m[3]) }
}

// Constrói ISO UTC determinístico a partir de data local (yyyy-MM-dd) e hora (HH:mm)
// usando offset fixo (UTC-3 por padrão) para não depender do timezone/DST do navegador.
export function makeLocalDateTimeISO(dateYmd: string, timeHm: string, offsetMinutes: number = -180) {
  const d = parseYmd(dateYmd)
  if (!d) throw new Error('Data inválida')
  const [h, m] = timeHm.split(':').map(Number)
  const localUtcMs = Date.UTC(d.Y, d.M, d.D, h, m || 0, 0, 0)
  // UTC real = local - offset
  const utcMs = localUtcMs - offsetMinutes * 60_000
  return new Date(utcMs).toISOString()
}

// Obtém a hora (0..23) a partir de um ISO (UTC) aplicando um deslocamento fixo de minutos.
// Evita depender do timezone/DST do navegador. Default: -180 (UTC-3, São Paulo sem DST).
export function hourFromIsoWithOffset(iso: string, offsetMinutes?: number): number {
  const off = typeof offsetMinutes === 'number'
    ? offsetMinutes
    : Number((import.meta as any)?.env?.VITE_TZ_OFFSET_MINUTES ?? '-180')
  const d = new Date(iso)
  const baseMs = Date.UTC(
    d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),
    d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds()
  )
  const ms = baseMs + off * 60_000
  const x = new Date(ms)
  return x.getUTCHours()
}

// Formata "HH:mm" a partir de ISO UTC aplicando o mesmo offset fixo utilizado em hourFromIsoWithOffset.
// Garante fonte única de verdade para exibição de horários.
export function formatHourMinutesFromIsoWithOffset(iso: string, offsetMinutes?: number): string {
  const off = typeof offsetMinutes === 'number'
    ? offsetMinutes
    : Number((import.meta as any)?.env?.VITE_TZ_OFFSET_MINUTES ?? '-180')
  const d = new Date(iso)
  const baseMs = Date.UTC(
    d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),
    d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds()
  )
  const ms = baseMs + off * 60_000
  const x = new Date(ms)
  const hh = String(x.getUTCHours()).padStart(2, '0')
  const mm = String(x.getUTCMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

// Formata intervalo de horário usando offset determinístico.
export function formatTimeRangeFromIso(startIso: string, endIso: string, offsetMinutes?: number): string {
  return `${formatHourMinutesFromIsoWithOffset(startIso, offsetMinutes)} às ${formatHourMinutesFromIsoWithOffset(endIso, offsetMinutes)}`
}

// Formata data local (dd/MM/yyyy) aplicando o mesmo offset determinístico (UTC-3 padrão)
export function formatDateFromIsoWithOffset(iso: string, offsetMinutes: number = -180): string {
  const d = new Date(iso)
  const baseMs = Date.UTC(
    d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),
    d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds()
  )
  const ms = baseMs + offsetMinutes * 60_000
  const x = new Date(ms)
  const dd = String(x.getUTCDate()).padStart(2, '0')
  const mm = String(x.getUTCMonth() + 1).padStart(2, '0')
  const yyyy = x.getUTCFullYear()
  return `${dd}/${mm}/${yyyy}`
}
