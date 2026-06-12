import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sellers = await prisma.user.findMany({
    select: { id: true, email: true, fullName: true, role: true, createdAt: true },
    orderBy: { fullName: 'asc' },
  })

  return NextResponse.json(sellers)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as { role: string }).role
  if (role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { email, fullName, password, userRole } = body

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Email allerede i brug' }, { status: 409 })

  const hashed = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { email, fullName, password: hashed, role: userRole ?? 'SELLER' },
    select: { id: true, email: true, fullName: true, role: true },
  })

  return NextResponse.json(user, { status: 201 })
}
