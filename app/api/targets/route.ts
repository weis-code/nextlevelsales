import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const targets = await prisma.target.findMany({
    include: {
      payPeriod: true,
      seller: { select: { id: true, fullName: true } },
      task: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(targets)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as { role: string }).role
  if (role !== 'ADMIN' && role !== 'MANAGER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { payPeriodId, sellerId, taskId, unitTarget, revenueTarget } = body

  const target = await prisma.target.create({
    data: {
      payPeriodId,
      sellerId,
      taskId,
      unitTarget: unitTarget ? parseInt(unitTarget) : null,
      revenueTarget: revenueTarget ? parseFloat(revenueTarget) : null,
    },
  })

  return NextResponse.json(target, { status: 201 })
}
