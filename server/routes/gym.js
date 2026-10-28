import { Router } from 'express'
import { prisma } from '../db.js'
import { authRequired, memberOnly } from '../middleware/auth.js'
import { createMembership, expireMemberships } from '../lib/memberships.js'

const router = Router()

router.get('/attendance', authRequired, memberOnly, async (req, res) => {
  res.json({ items: await prisma.attendance.findMany({ where: { userId: req.user.id }, orderBy: { checkInAt: 'desc' } }) })
})

router.post('/attendance/check-in', authRequired, memberOnly, async (req, res) => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const existing = await prisma.attendance.findFirst({
    where: { userId: req.user.id, checkOutAt: null, checkInAt: { gte: start } },
  })
  if (existing) return res.status(409).json({ message: 'You already have an open check-in today' })
  const item = await prisma.attendance.create({
    data: { userId: req.user.id, location: String(req.body?.location || 'Main gym').slice(0, 100) },
  })
  res.status(201).json({ item })
})

router.patch('/attendance/:id/check-out', authRequired, memberOnly, async (req, res) => {
  const result = await prisma.attendance.updateMany({
    where: { id: req.params.id, userId: req.user.id, checkOutAt: null },
    data: { checkOutAt: new Date() },
  })
  if (!result.count) return res.status(404).json({ message: 'Open attendance record not found' })
  res.json({ item: await prisma.attendance.findUnique({ where: { id: req.params.id } }) })
})

router.get('/payments', authRequired, memberOnly, async (req, res) => {
  res.json({ items: await prisma.paymentRecord.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } }) })
})

router.get('/membership-plans', authRequired, async (_req, res) => {
  res.json({ items: await prisma.membershipPlan.findMany({ where: { isActive: true }, orderBy: { price: 'asc' } }) })
})

router.get('/memberships', authRequired, async (req, res) => {
  await expireMemberships()
  const where = req.user.role === 'admin' ? {} : { userId: req.user.id }
  res.json({ items: await prisma.membership.findMany({ where, include: { plan: true }, orderBy: { createdAt: 'desc' } }) })
})

router.post('/memberships', authRequired, memberOnly, async (req, res) => {
  const result = await createMembership(req.user.id, req.body?.planId)
  if (result.error) return res.status(404).json({ message: result.error })
  if (result.conflict) return res.status(409).json({ message: 'You already have an active membership' })
  res.status(201).json({ item: result.item, message: 'Membership activated. Payment is not processed by this application.' })
})

export default router
