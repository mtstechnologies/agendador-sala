// Helpers de normalização e utilitários para objetos de reserva

export type AnyReservation = Record<string, any>

export function getStartIso(r: AnyReservation): string | undefined {
  return r?.startTime || r?.start_time
}

export function getEndIso(r: AnyReservation): string | undefined {
  return r?.endTime || r?.end_time
}

export function getRoom(r: AnyReservation): any {
  // Preferir camelCase
  return r?.room || r?.rooms
}

export function getRoomName(r: AnyReservation): string {
  const room = getRoom(r)
  return room?.name || 'Sala'
}

export function isUpcoming(r: AnyReservation, nowMs: number = Date.now()): boolean {
  const startIso = getStartIso(r)
  if (!startIso) return false
  const startMs = Date.parse(startIso)
  if (isNaN(startMs)) return false
  return startMs > nowMs && (r?.status === 'approved' || r?.status === 'pending')
}

export function isEnded(r: AnyReservation, nowMs: number = Date.now()): boolean {
  const endIso = getEndIso(r)
  if (!endIso) return false
  const endMs = Date.parse(endIso)
  if (isNaN(endMs)) return false
  return endMs < nowMs
}

export function getUserName(r: AnyReservation): string {
  const user = r?.user
  if (!user) return 'Usuário'
  return user.fullName || user.full_name || user.email || 'Usuário'
}
