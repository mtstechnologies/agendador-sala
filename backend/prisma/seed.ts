import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Usuário admin seguro
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@escola.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123!troque'
  const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!adminExists) {
    const passwordHash = await bcrypt.hash(adminPassword, 10)
    await prisma.user.create({
      data: {
        fullName: 'Admin',
        email: adminEmail,
        matricula: 'ADM0001',
        password: passwordHash,
        role: 'admin',
        department: 'TI'
      }
    })
    console.log(`Usuário admin criado: ${adminEmail}`)
  } else {
    console.log('Usuário admin já existe, não será recriado.')
  }

  // Usuários comuns
  const passwordHash = await bcrypt.hash('123456', 10)
  await prisma.user.createMany({
    data: [
      { fullName: 'Maria Silva', email: 'maria@escola.com', matricula: 'MAT0001', password: passwordHash, role: 'user', department: 'RH' },
      { fullName: 'João Souza', email: 'joao@escola.com', matricula: 'MAT0002', password: passwordHash, role: 'user', department: 'Pedagogia' },
      { fullName: 'Ana Lima', email: 'ana@escola.com', matricula: 'MAT0003', password: passwordHash, role: 'user', department: 'Direção' },
      { fullName: 'Carlos Dias', email: 'carlos@escola.com', matricula: 'MAT0004', password: passwordHash, role: 'user', department: 'TI' },
    ],
    skipDuplicates: true
  })

  // Salas
  await prisma.room.createMany({
    data: [
      { id: 'room-101', name: 'Sala de Aula 101', capacity: 30, resources: ['Projetor', 'Quadro Branco', 'Ar Condicionado'], bloco: 'A', department: 'Matemática' },
      { id: 'room-102', name: 'Sala de Aula 102', capacity: 25, resources: ['Projetor', 'Quadro Branco'], bloco: 'A', department: 'Português' },
      { id: 'lab-info-1', name: 'Laboratório de Informática 1', capacity: 20, resources: ['Computadores', 'Projetor'], bloco: 'B', department: 'Informática' },
      { id: 'lab-info-2', name: 'Laboratório de Informática 2', capacity: 15, resources: ['Computadores'], bloco: 'B', department: 'Informática' },
      { id: 'auditorio', name: 'Auditório', capacity: 100, resources: ['Palco', 'Projetor', 'Som'], bloco: 'C', department: 'Eventos' },
    ],
    skipDuplicates: true
  })

  // Reservas
  const userList = await prisma.user.findMany()
  const roomList = await prisma.room.findMany()
  const reservas = []
  for (let i = 0; i < 10; i++) {
    reservas.push({
      roomId: roomList[i % roomList.length].id,
      userId: userList[i % userList.length].id,
      title: `Reserva ${i+1}`,
      description: `Reserva de teste ${i+1}`,
      startTime: new Date(2025, 8, 15 + i, 8, 0),
      endTime: new Date(2025, 8, 15 + i, 10, 0),
      status: i % 3 === 0 ? 'approved' : (i % 3 === 1 ? 'pending' : 'cancelled')
    })
  }
  await prisma.reservation.createMany({ data: reservas })

  console.log('Seed concluído com sucesso!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
