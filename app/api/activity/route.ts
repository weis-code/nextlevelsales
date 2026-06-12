import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sellerId = (session.user as { id: string }).id
  const role = (session.user as { role: string }).role

  const logs = await prisma.activityLog.findMany({
    where: role === 'SELLER' ? { sellerId } : undefined,
    orderBy: { logDate: 'desc' },
    include: { task: { select: { name: true } }, seller: { select: { fullName: true } } },
    take: 100,
  })

  return NextResponse.json(logs)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sellerId = (session.user as { id: string }).id
  const body = await req.json()

  const { taskId, logDate, callsMade, contactsReached, meetingsBooked, meetingsHeld, notes } = body

  if (contactsReached > callsMade) {
    return NextResponse.json({ error: 'Kontakter nået må ikke overstige opkald foretaget' }, { status: 400 })
  }
  if (meetingsBooked > contactsReached) {
    return NextResponse.json({ error: 'Møder booket må ikke overstige kontakter nået' }, { status: 400 })
  }

  const assignment = await prisma.taskAssignment.findFirst({ where: { sellerId, taskId } })
  if (!assignment) return NextResponse.json({ error: 'Ikke tilknyttet denne opgave' }, { status: 403 })

  const log = await prisma.activityLog.create({
    data: {
      sellerId,
      taskId,
      logDate: logDate ? new Date(logDate) : new Date(),
      callsMade: parseInt(callsMade) || 0,
      contactsReached: parseInt(contactsReached) || 0,
      meetingsBooked: parseInt(meetingsBooked) || 0,
      meetingsHeld: parseInt(meetingsHeld) || 0,
      notes,
    },
  })

  return NextResponse.json(log, { status: 201 })
}
