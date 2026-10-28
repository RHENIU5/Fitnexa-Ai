import { Router } from 'express'
import { prisma } from '../db.js'
import { authRequired, memberOnly } from '../middleware/auth.js'
import { serializePlan, serializeSession } from '../lib/serializers.js'

const router = Router()

router.post('/plans', authRequired, memberOnly, async (req, res) => {
  const { title, goal, weeklySchedule } = req.body || {}
  if (typeof title !== 'string' || !title.trim() || title.length > 120) {
    return res.status(400).json({ message: 'A workout title (120 characters max) is required' })
  }
  const item = await prisma.workoutPlan.create({
    data: { userId: req.user.id, title: title.trim(), goal: goal || null, weeklySchedule: weeklySchedule || null },
    include: { planExercises: { include: { exercise: true } } },
  })
  res.status(201).json({ item: serializePlan(item) })
})

router.get('/plans', authRequired, memberOnly, async (req, res) => {
  const items = await prisma.workoutPlan.findMany({
    where: { userId: req.user.id },
    include: { planExercises: { include: { exercise: true } } },
    orderBy: { updatedAt: 'desc' },
  })
  res.json({ items: items.map(serializePlan) })
})

router.get('/history', authRequired, memberOnly, async (req, res) => {
  const items = await prisma.workoutSession.findMany({
    where: { userId: req.user.id },
    include: { sessionExercises: true },
    orderBy: { startedAt: 'desc' },
  })
  res.json({ items: items.map(serializeSession) })
})

router.post('/sessions/start', authRequired, memberOnly, async (req, res) => {
  const planId = typeof req.body?.planId === 'string' ? req.body.planId : null
  if (planId && !(await prisma.workoutPlan.findFirst({ where: { id: planId, userId: req.user.id }, select: { id: true } }))) {
    return res.status(404).json({ message: 'Workout plan not found' })
  }
  const item = await prisma.workoutSession.create({
    data: { userId: req.user.id, planId, status: 'in_progress', startedAt: new Date() },
    include: { sessionExercises: true },
  })
  res.status(201).json({ item: serializeSession(item) })
})

router.patch('/sessions/:id/complete', authRequired, memberOnly, async (req, res) => {
  const durationMin = Number(req.body?.durationMin || 0)
  if (!Number.isFinite(durationMin) || durationMin < 0 || durationMin > 1440) {
    return res.status(400).json({ message: 'Duration must be between 0 and 1440 minutes' })
  }
  const result = await prisma.workoutSession.updateMany({
    where: { id: req.params.id, userId: req.user.id, status: 'in_progress' },
    data: { status: 'completed', completedAt: new Date(), durationMin, notes: String(req.body?.notes || '').slice(0, 1000) },
  })
  if (!result.count) return res.status(404).json({ message: 'Active workout session not found' })
  const item = await prisma.workoutSession.findUnique({ where: { id: req.params.id }, include: { sessionExercises: true } })
  res.json({ item: serializeSession(item) })
})

export default router
