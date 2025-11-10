import { PrismaClient } from '@prisma/client'

// Prisma Client singleton para evitar múltiplas conexões em dev
export const prisma = new PrismaClient()
