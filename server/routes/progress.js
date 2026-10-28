import { Router } from 'express'
import { prisma } from '../db.js'
import { authRequired, memberOnly } from '../middleware/auth.js'

const router = Router()

router.get('/', authRequired, memberOnly, async (req, res) => {
  const items = await prisma.progressRecord.findMany({ where: { userId: req.user.id }, orderBy: { date: 'desc' } })
  res.json({ items })
})

router.post('/', authRequired, memberOnly, async (req, res) => {
  const weightKg = req.body?.weightKg == null || req.body.weightKg === '' ? null : Number(req.body.weightKg)
  const bodyFatPct = req.body?.bodyFatPct == null || req.body.bodyFatPct === '' ? null : Number(req.body.bodyFatPct)
  const date = req.body?.date ? new Date(req.body.date) : new Date()
  if ((weightKg == null && bodyFatPct == null)
    || (weightKg != null && (!Number.isFinite(weightKg) || weightKg < 25 || weightKg > 350))
    || (bodyFatPct != null && (!Number.isFinite(bodyFatPct) || bodyFatPct < 2 || bodyFatPct > 75))
    || Number.isNaN(date.getTime())) {
    return res.status(400).json({ message: 'Enter a valid weight or body-fat measurement' })
  }
  const item = await prisma.progressRecord.create({
    data: {
      userId: req.user.id,
      date,
      weightKg,
      bodyFatPct,
      notes: typeof req.body?.notes === 'string' ? req.body.notes.slice(0, 1000) : null,
    },
  })
  res.status(201).json({ item })
})

export default router
