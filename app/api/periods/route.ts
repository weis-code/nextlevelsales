import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const periods = await prisma.payPeriod.findMany({
    orderBy: { startDate: 'desc' },
  })

  return NextResponse.json(periods)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as { role: string }).role
  if (role !== 'ADMIN' && role !== 'MANAGER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { name, startDate, endDate } = body

  const period = await prisma.payPeriod.create({
    data: { name, startDate: new Date(startDate), endDate: new Date(endDate) },
  })

  return NextResponse.json(period, { status: 201 })
}
