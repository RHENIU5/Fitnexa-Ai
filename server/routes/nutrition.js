import { Router } from 'express'
import { prisma } from '../db.js'
import { authRequired, memberOnly } from '../middleware/auth.js'

const router = Router()

router.get('/foods', authRequired, memberOnly, async (_req, res) => {
  res.json({ items: await prisma.food.findMany({ orderBy: { name: 'asc' } }) })
})

router.get('/logs', authRequired, memberOnly, async (req, res) => {
  const items = await prisma.foodLog.findMany({ where: { userId: req.user.id }, orderBy: { loggedAt: 'desc' } })
  res.json({ items })
})

router.post('/logs', authRequired, memberOnly, async (req, res) => {
  const { name, mealType, servingSize } = req.body || {}
  const macroFields = ['calories', 'protein', 'carbs', 'fats']
  const macros = Object.fromEntries(macroFields.map((field) => [field, Number(req.body?.[field] || 0)]))
  if (typeof name !== 'string' || !name.trim() || name.length > 120
    || typeof mealType !== 'string' || mealType.length > 40
    || typeof servingSize !== 'string' || servingSize.length > 80
    || Object.values(macros).some((value) => !Number.isFinite(value) || value < 0 || value > 10000)) {
    return res.status(400).json({ message: 'Enter a food name, meal type, serving size, and valid nutrition values' })
  }
  const item = await prisma.foodLog.create({
    data: { userId: req.user.id, name: name.trim(), mealType, servingSize, ...macros },
  })
  res.status(201).json({ item })
})

export default router
