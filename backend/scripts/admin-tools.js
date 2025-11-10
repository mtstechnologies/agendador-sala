#!/usr/bin/env node
/*
  Admin maintenance tool
  Usage:
    - Update first admin email:  npm run admin:update-email -- <newEmail>
    - Create admin user:        npm run admin:create -- <email> <password> [fullName]
*/
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const prisma = new PrismaClient()

async function updateEmail(newEmail, userId) {
  if (!newEmail) throw new Error('Novo email não informado')
  const existing = await prisma.user.findUnique({ where: { email: newEmail } })
  if (existing) throw new Error('Já existe um usuário com esse email')
  let target
  if (userId) {
    target = await prisma.user.findUnique({ where: { id: userId } })
  } else {
    target = await prisma.user.findFirst({ where: { role: 'admin' }, orderBy: { createdAt: 'asc' } }).catch(async () => {
      // fallback for schema sem createdAt
      const admins = await prisma.user.findMany({ where: { role: 'admin' } })
      return admins[0]
    })
  }
  if (!target) throw new Error('Nenhum admin encontrado')
  await prisma.user.update({ where: { id: target.id }, data: { email: newEmail } })
  console.log(`Email do admin atualizado para: ${newEmail}`)
}

async function createAdmin(email, password, fullName = 'Admin') {
  if (!email || !password) throw new Error('Informe email e senha')
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) throw new Error('Já existe um usuário com esse email')
  const hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      fullName: String(fullName).trim().toUpperCase(),
      email,
      matricula: `ADM${Date.now()}`,
      password: hash,
      role: 'admin',
      department: 'TI'
    }
  })
  console.log(`Admin criado: ${user.email}`)
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2)
  try {
    if (cmd === 'update-email') {
      const [newEmail, maybeId] = rest
      await updateEmail(newEmail, maybeId)
    } else if (cmd === 'create-admin') {
      const [email, password, fullName] = rest
      await createAdmin(email, password, fullName)
    } else {
      console.log('Comandos disponíveis:')
      console.log('  update-email <novoEmail> [userId]')
      console.log('  create-admin <email> <senha> [fullName]')
      process.exitCode = 1
    }
  } catch (e) {
    console.error('Erro:', e.message)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main()
