import { Router } from 'express'
import { prisma } from '../db.js'
import { authRequired, memberOnly } from '../middleware/auth.js'

const router = Router()

router.get('/', authRequired, memberOnly, async (req, res) => {
  const [reminders, notifications] = await Promise.all([
    prisma.reminder.findMany({ where: { userId: req.user.id }, orderBy: { scheduledAt: 'desc' }, take: 50 }),
    prisma.gymNotification.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
  ])
  res.json({
    items: [
      ...reminders,
      ...notifications.map((item) => ({ ...item, scheduledAt: item.createdAt, isSent: true, source: 'gym' })),
    ].sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt)),
  })
})

router.post('/', authRequired, memberOnly, async (req, res) => {
  const { title, message, scheduledAt } = req.body || {}
  if (typeof title !== 'string' || !title.trim() || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ message: 'Reminder title and message are required' })
  }
  const when = scheduledAt ? new Date(scheduledAt) : new Date()
  if (Number.isNaN(when.getTime())) return res.status(400).json({ message: 'Reminder date is invalid' })
  const item = await prisma.reminder.create({
    data: { userId: req.user.id, title: title.trim().slice(0, 120), message: message.trim().slice(0, 1000), scheduledAt: when },
  })
  res.status(201).json({ item })
})

export default router
