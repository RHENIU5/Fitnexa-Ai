import { prisma } from '../db.js'

export async function expireMemberships() {
  await prisma.membership.updateMany({
    where: { status: 'active', expiryDate: { lte: new Date() } },
    data: { status: 'expired' },
  })
}

export async function createMembership(userId, planId) {
  const [member, plan] = await Promise.all([
    prisma.user.findFirst({ where: { id: userId, role: 'member', isActive: true }, select: { id: true } }),
    prisma.membershipPlan.findFirst({ where: { id: planId, isActive: true } }),
  ])
  if (!member || !plan) return { error: 'Member or active membership plan not found' }
  const active = await prisma.membership.findFirst({ where: { userId, status: 'active' } })
  if (active) return { conflict: 'Member already has an active membership' }
  const startDate = new Date()
  const expiryDate = new Date(startDate)
  expiryDate.setDate(expiryDate.getDate() + plan.durationDays)
  const item = await prisma.$transaction(async (transaction) => {
    const membership = await transaction.membership.create({
      data: { userId, planId, startDate, expiryDate, status: 'active' },
      include: { plan: true },
    })
    await transaction.paymentRecord.create({
      data: { userId, amount: plan.price, status: 'pending', dueDate: startDate },
    })
    return membership
  })
  return { item }
}
