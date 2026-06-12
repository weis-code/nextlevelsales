import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { calculateHouseRevenue, getCompensationType, CompensationModel } from '@/lib/utils'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sellerId = (session.user as { id: string }).id
  const role = (session.user as { role: string }).role
  const isAdmin = role === 'ADMIN' || role === 'MANAGER'

  const sales = await prisma.sale.findMany({
    where: isAdmin ? undefined : { sellerId },
    orderBy: { saleDate: 'desc' },
    include: {
      task: { select: { name: true, clientName: true } },
      seller: { select: { fullName: true } },
    },
    take: 200,
  })

  const result = sales.map((s) => ({
    id: s.id,
    saleDate: s.saleDate,
    taskName: s.task.name,
    clientName: s.task.clientName,
    sellerName: isAdmin ? s.seller.fullName : undefined,
    compensationType: s.compensationType,
    units: s.units,
    dealSize: isAdmin ? s.dealSize : undefined,
    packageName: s.packageName,
    packagePrice: isAdmin ? s.packagePrice : undefined,
    houseRevenue: isAdmin ? s.houseRevenue : undefined,
    sellerNote: s.sellerNote,
    status: s.status,
    createdAt: s.createdAt,
  }))

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sellerId = (session.user as { id: string }).id
  const body = await req.json()
  const { taskId, saleDate, units, dealSize, packageName, sellerNote } = body

  const assignment = await prisma.taskAssignment.findFirst({ where: { sellerId, taskId } })
  if (!assignment) return NextResponse.json({ error: 'Ikke tilknyttet denne opgave' }, { status: 403 })

  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) return NextResponse.json({ error: 'Opgave ikke fundet' }, { status: 404 })

  const model = task.compensationModel as CompensationModel
  const houseRevenue = calculateHouseRevenue(model, {
    units: parseInt(units) || 1,
    dealSize: parseFloat(dealSize) || 0,
    packageName,
  })

  const pkg = model.type === 'package' ? model.packages.find((p) => p.name === packageName) : undefined

  const sale = await prisma.sale.create({
    data: {
      sellerId,
      taskId,
      saleDate: saleDate ? new Date(saleDate) : new Date(),
      compensationType: getCompensationType(model),
      units: parseInt(units) || 1,
      dealSize: model.type === 'percentage' ? parseFloat(dealSize) : null,
      packageName: model.type === 'package' ? packageName : null,
      packagePrice: pkg ? pkg.price : null,
      houseRevenue,
      sellerNote,
    },
  })

  return NextResponse.json({ id: sale.id, status: sale.status }, { status: 201 })
}
