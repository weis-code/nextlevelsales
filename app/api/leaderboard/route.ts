import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const periodId = req.nextUrl.searchParams.get('periodId')
  const filter = req.nextUrl.searchParams.get('filter') ?? 'period'

  let startDate: Date
  const now = new Date()

  if (filter === 'week') {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  } else if (filter === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  } else if (periodId) {
    const period = await prisma.payPeriod.findUnique({ where: { id: periodId } })
    startDate = period?.startDate ?? new Date(now.getFullYear(), now.getMonth(), 1)
  } else {
    // active period
    const active = await prisma.payPeriod.findFirst({
      where: { startDate: { lte: now }, endDate: { gte: now } },
      orderBy: { startDate: 'desc' },
    })
    startDate = active?.startDate ?? new Date(now.getFullYear(), now.getMonth(), 1)
  }

  const [salesData, activityData] = await Promise.all([
    prisma.sale.groupBy({
      by: ['sellerId', 'taskId'],
      where: { saleDate: { gte: startDate } },
      _count: { id: true },
      _sum: { units: true },
    }),
    prisma.activityLog.groupBy({
      by: ['sellerId'],
      where: { logDate: { gte: startDate } },
      _sum: { callsMade: true, meetingsBooked: true, meetingsHeld: true },
    }),
  ])

  const allSellerIds = salesData.map((s) => s.sellerId).concat(activityData.map((a) => a.sellerId))
  const sellerIds = allSellerIds.filter((id, i) => allSellerIds.indexOf(id) === i)
  const sellers = await prisma.user.findMany({
    where: { id: { in: sellerIds } },
    select: { id: true, fullName: true },
  })
  const taskIdList = salesData.map((s) => s.taskId).filter((id, i, arr) => arr.indexOf(id) === i)
  const tasks = await prisma.task.findMany({
    where: { id: { in: taskIdList } },
    select: { id: true, name: true },
  })

  const taskMap = Object.fromEntries(tasks.map((t) => [t.id, t.name]))

  const rows = sellers.map((seller) => {
    const mySales = salesData.filter((s) => s.sellerId === seller.id)
    const myActivity = activityData.find((a) => a.sellerId === seller.id)
    const totalUnits = mySales.reduce((s, r) => s + (r._sum.units ?? 0), 0)
    const calls = myActivity?._sum.callsMade ?? 0
    const meetings = myActivity?._sum.meetingsBooked ?? 0
    const meetingsHeld = myActivity?._sum.meetingsHeld ?? 0
    const activityScore = calls + meetings * 3 + meetingsHeld * 2 + totalUnits * 5

    return {
      sellerId: seller.id,
      sellerName: seller.fullName,
      tasks: mySales.map((s) => ({ taskId: s.taskId, taskName: taskMap[s.taskId] ?? '', units: s._count.id })),
      totalUnits,
      calls,
      meetings,
      activityScore,
    }
  })

  rows.sort((a, b) => b.activityScore - a.activityScore)
  const withRank = rows.map((r, i) => ({ ...r, rank: i + 1 }))

  return NextResponse.json(withRank)
}
