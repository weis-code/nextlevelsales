import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as { role: string }).role
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  const [thisMonthSales, prevMonthSales, byTask, bySeller, byType] = await Promise.all([
    prisma.sale.aggregate({
      where: { saleDate: { gte: monthStart } },
      _sum: { houseRevenue: true },
    }),
    prisma.sale.aggregate({
      where: { saleDate: { gte: prevMonthStart, lte: prevMonthEnd } },
      _sum: { houseRevenue: true },
    }),
    prisma.sale.groupBy({
      by: ['taskId'],
      where: { saleDate: { gte: monthStart } },
      _sum: { houseRevenue: true },
    }),
    prisma.sale.groupBy({
      by: ['sellerId'],
      where: { saleDate: { gte: monthStart } },
      _sum: { houseRevenue: true },
    }),
    prisma.sale.groupBy({
      by: ['compensationType'],
      where: { saleDate: { gte: monthStart } },
      _sum: { houseRevenue: true },
    }),
  ])

  const taskIds = byTask.map((t) => t.taskId)
  const sellerIds = bySeller.map((s) => s.sellerId)

  const [tasks, sellers] = await Promise.all([
    prisma.task.findMany({ where: { id: { in: taskIds } }, select: { id: true, name: true } }),
    prisma.user.findMany({ where: { id: { in: sellerIds } }, select: { id: true, fullName: true } }),
  ])

  const taskMap = Object.fromEntries(tasks.map((t) => [t.id, t.name]))
  const sellerMap = Object.fromEntries(sellers.map((s) => [s.id, s.fullName]))

  return NextResponse.json({
    thisMonth: Number(thisMonthSales._sum.houseRevenue ?? 0),
    prevMonth: Number(prevMonthSales._sum.houseRevenue ?? 0),
    byTask: byTask.map((r) => ({ taskName: taskMap[r.taskId] ?? r.taskId, revenue: Number(r._sum.houseRevenue ?? 0) })),
    bySeller: bySeller.map((r) => ({ sellerName: sellerMap[r.sellerId] ?? r.sellerId, revenue: Number(r._sum.houseRevenue ?? 0) })),
    byType: byType.map((r) => ({ type: r.compensationType, revenue: Number(r._sum.houseRevenue ?? 0) })),
  })
}
