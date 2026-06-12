import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sellerId = (session.user as { id: string }).id
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const [assignments, activePeriods, weekLogs, recentSales, last14DaysLogs] = await Promise.all([
    prisma.taskAssignment.findMany({
      where: { sellerId },
      include: { task: true },
    }),
    prisma.payPeriod.findMany({
      where: { startDate: { lte: now }, endDate: { gte: now } },
      include: {
        targets: {
          where: { sellerId },
          include: { task: true },
        },
      },
    }),
    prisma.activityLog.findMany({
      where: { sellerId, logDate: { gte: weekAgo } },
    }),
    prisma.sale.findMany({
      where: { sellerId },
      orderBy: { saleDate: 'desc' },
      take: 10,
      include: { task: true },
    }),
    prisma.activityLog.findMany({
      where: { sellerId, logDate: { gte: fourteenDaysAgo } },
      orderBy: { logDate: 'asc' },
    }),
  ])

  const totalCalls = weekLogs.reduce((s, l) => s + l.callsMade, 0)
  const totalContacts = weekLogs.reduce((s, l) => s + l.contactsReached, 0)
  const totalMeetingsBooked = weekLogs.reduce((s, l) => s + l.meetingsBooked, 0)
  const totalMeetingsHeld = weekLogs.reduce((s, l) => s + l.meetingsHeld, 0)
  const weekSales = await prisma.sale.count({ where: { sellerId, saleDate: { gte: weekAgo } } })

  const kpis = {
    calls: totalCalls,
    pickupRate: totalCalls > 0 ? Math.round((totalContacts / totalCalls) * 100) : 0,
    bookingRate: totalContacts > 0 ? Math.round((totalMeetingsBooked / totalContacts) * 100) : 0,
    showRate: totalMeetingsBooked > 0 ? Math.round((totalMeetingsHeld / totalMeetingsBooked) * 100) : 0,
    closingRate: totalMeetingsHeld > 0 ? Math.round((weekSales / totalMeetingsHeld) * 100) : 0,
  }

  // Activity chart: aggregate by day
  const chartMap: Record<string, number> = {}
  last14DaysLogs.forEach((log) => {
    const day = log.logDate.toISOString().split('T')[0]
    chartMap[day] = (chartMap[day] ?? 0) + log.callsMade
  })
  const activityChart = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(fourteenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().split('T')[0]
    return { date: key, calls: chartMap[key] ?? 0 }
  })

  // Period progress: sales count per task for current period
  const periodProgress = await Promise.all(
    activePeriods.map(async (period) => {
      const taskIds = assignments.map((a) => a.taskId)
      const salesByTask = await prisma.sale.groupBy({
        by: ['taskId'],
        where: {
          sellerId,
          taskId: { in: taskIds },
          saleDate: { gte: period.startDate, lte: period.endDate },
        },
        _count: { id: true },
      })
      return {
        period: { id: period.id, name: period.name, startDate: period.startDate, endDate: period.endDate },
        targets: period.targets.map((t) => {
          const sold = salesByTask.find((s) => s.taskId === t.taskId)?._count.id ?? 0
          return {
            taskId: t.taskId,
            taskName: t.task.name,
            unitTarget: t.unitTarget,
            unitsSold: sold,
          }
        }),
      }
    })
  )

  const safeSales = recentSales.map((s) => ({
    id: s.id,
    saleDate: s.saleDate,
    taskName: s.task.name,
    compensationType: s.compensationType,
    units: s.units,
    packageName: s.packageName,
    status: s.status,
    sellerNote: s.sellerNote,
  }))

  return NextResponse.json({ kpis, activityChart, periodProgress, recentSales: safeSales })
}
