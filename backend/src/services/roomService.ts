import { prisma } from '../config/prisma'

export type RoomPayload = {
  name: string
  capacity: number
  resources: string[]
  bloco: string
  department: string
  operatingHours?: any | null
  isActive?: boolean
}

export async function listRooms(includeInactive = false) {
  return prisma.room.findMany({
    where: includeInactive ? undefined : { isActive: true },
    orderBy: { name: 'asc' },
  })
}

export async function getRoom(id: string) {
  return prisma.room.findUnique({ where: { id } })
}

export async function createRoom(data: RoomPayload) {
  return prisma.room.create({
    data: {
      name: data.name,
      capacity: Number(data.capacity),
      resources: Array.isArray(data.resources) ? data.resources : [],
      bloco: data.bloco,
      department: data.department,
      operatingHours: typeof data.operatingHours !== 'undefined' ? data.operatingHours : null,
      isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
    },
  })
}

export async function updateRoom(id: string, data: Partial<RoomPayload>) {
  return prisma.room.update({
    where: { id },
    data: {
      name: typeof data.name === 'string' ? data.name : undefined,
      capacity: typeof data.capacity === 'number' ? data.capacity : undefined,
      resources: Array.isArray(data.resources) ? data.resources : undefined,
      bloco: typeof data.bloco === 'string' ? data.bloco : undefined,
      department: typeof data.department === 'string' ? data.department : undefined,
      operatingHours: typeof data.operatingHours !== 'undefined' ? data.operatingHours : undefined,
      isActive: typeof data.isActive === 'boolean' ? data.isActive : undefined,
    },
  })
}

export async function deleteRoom(id: string) {
  return prisma.room.delete({ where: { id } })
}
