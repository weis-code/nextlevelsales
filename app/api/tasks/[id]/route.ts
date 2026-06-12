import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const task = await prisma.task.findUnique({
    where: { id: params.id },
    include: {
      assignments: { include: { seller: { select: { id: true, fullName: true, email: true } } } },
    },
  })

  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(task)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as { role: string }).role
  if (role !== 'ADMIN' && role !== 'MANAGER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { name, clientName, description, status, compensationModel, startDate, endDate, sellerIds } = body

  const task = await prisma.task.update({
    where: { id: params.id },
    data: {
      name,
      clientName,
      description,
      status,
      compensationModel,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
  })

  if (sellerIds !== undefined) {
    await prisma.taskAssignment.deleteMany({ where: { taskId: params.id } })
    if (sellerIds.length) {
      await prisma.taskAssignment.createMany({
        data: sellerIds.map((sid: string) => ({ taskId: params.id, sellerId: sid })),
        skipDuplicates: true,
      })
    }
  }

  return NextResponse.json(task)
}
