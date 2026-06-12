import { CompensationType } from '@prisma/client'

export type CompensationModel =
  | { type: 'fixed'; label: string; pricePerUnit: number }
  | { type: 'percentage'; label: string; percentage: number }
  | { type: 'package'; label: string; packages: { name: string; price: number }[] }

export function calculateHouseRevenue(
  model: CompensationModel,
  opts: {
    units?: number
    dealSize?: number
    packageName?: string
  }
): number {
  if (model.type === 'fixed') {
    return model.pricePerUnit * (opts.units ?? 1)
  }
  if (model.type === 'percentage') {
    return ((opts.dealSize ?? 0) * model.percentage) / 100
  }
  if (model.type === 'package') {
    const pkg = model.packages.find((p) => p.name === opts.packageName)
    return pkg?.price ?? 0
  }
  return 0
}

export function getCompensationType(model: CompensationModel): CompensationType {
  if (model.type === 'fixed') return 'FIXED'
  if (model.type === 'percentage') return 'PERCENTAGE'
  return 'PACKAGE'
}

export function formatDKK(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return '—'
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', maximumFractionDigits: 0 }).format(num)
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function daysRemaining(endDate: string | Date): number {
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max)
}

export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ')
}
