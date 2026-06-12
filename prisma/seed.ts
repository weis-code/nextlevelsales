import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('NLS2024admin!', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@nextlevelsales.dk' },
    update: {},
    create: {
      email: 'admin@nextlevelsales.dk',
      password: hashedPassword,
      fullName: 'Admin',
      role: 'ADMIN',
    },
  })

  const task1 = await prisma.task.upsert({
    where: { id: 'task-alarm-booking' },
    update: {},
    create: {
      id: 'task-alarm-booking',
      name: 'Jysk Alarm & Sikring — Mødebooking B2B',
      clientName: 'Jysk Alarm & Sikring',
      description: 'Book møder med B2B kunder for Jysk Alarm & Sikring',
      status: 'ACTIVE',
      compensationModel: {
        type: 'fixed',
        label: 'Møde booket',
        pricePerUnit: 500,
      },
    },
  })

  const task2 = await prisma.task.upsert({
    where: { id: 'task-alarm-salg' },
    update: {},
    create: {
      id: 'task-alarm-salg',
      name: 'Jysk Alarm & Sikring — Salg B2B',
      clientName: 'Jysk Alarm & Sikring',
      description: 'Luk salg med B2B kunder for Jysk Alarm & Sikring',
      status: 'ACTIVE',
      compensationModel: {
        type: 'percentage',
        label: 'Salg lukket',
        percentage: 8,
      },
    },
  })

  const task3 = await prisma.task.upsert({
    where: { id: 'task-charity' },
    update: {},
    create: {
      id: 'task-charity',
      name: "Sport 'n' Charity — Erhvervssponsorater",
      clientName: "Sport 'n' Charity",
      description: 'Sælg erhvervssponsorater til Sport n Charity',
      status: 'ACTIVE',
      compensationModel: {
        type: 'package',
        label: 'Pakke solgt',
        packages: [
          { name: 'Bronze', price: 5000 },
          { name: 'Sølv', price: 10000 },
          { name: 'Guld', price: 20000 },
        ],
      },
    },
  })

  await prisma.payPeriod.upsert({
    where: { id: 'period-juni-2026' },
    update: {},
    create: {
      id: 'period-juni-2026',
      name: 'Juni 2026',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-30'),
    },
  })

  console.log('Seed completed:', { admin: admin.email, tasks: [task1.name, task2.name, task3.name] })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
