import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sellerId = (session.user as { id: string }).id
  const role = (session.user as { role: string }).role
  const mine = req.nextUrl.searchParams.get('mine')

  if (mine === 'true' || role === 'SELLER') {
    const assignments = await prisma.taskAssignment.findMany({
      where: { sellerId },
      include: { task: true },
    })
    return NextResponse.json(assignments.map((a) => a.task))
  }

  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      assignments: { include: { seller: { select: { id: true, fullName: true, email: true } } } },
      _count: { select: { sales: true, activityLogs: true } },
    },
  })

  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as { role: string }).role
  if (role !== 'ADMIN' && role !== 'MANAGER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { name, clientName, description, status, compensationModel, startDate, endDate, sellerIds } = body

  const task = await prisma.task.create({
    data: {
      name,
      clientName,
      description,
      status: status ?? 'ACTIVE',
      compensationModel,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
  })

  if (sellerIds?.length) {
    await prisma.taskAssignment.createMany({
      data: sellerIds.map((sid: string) => ({ taskId: task.id, sellerId: sid })),
      skipDuplicates: true,
    })
  }

  return NextResponse.json(task, { status: 201 })
}
