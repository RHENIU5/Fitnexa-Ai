import { Router } from 'express'
import { prisma } from '../db.js'
import { adminOnly, authRequired } from '../middleware/auth.js'

const router = Router()

router.get('/', authRequired, async (req, res) => {
  const search = String(req.query.search || '')
  const category = String(req.query.category || '')
  const items = await prisma.exercise.findMany({
    where: {
      ...(category ? { category: { equals: category, mode: 'insensitive' } } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { primaryMuscle: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
    },
    orderBy: { name: 'asc' },
  })
  res.json({ items, total: items.length })
})

router.get('/:id', authRequired, async (req, res) => {
  const item = await prisma.exercise.findUnique({ where: { id: req.params.id } })
  if (!item) return res.status(404).json({ message: 'Exercise not found' })
  res.json({ item })
})

router.post('/', authRequired, adminOnly, async (req, res) => {
  const { name, description, instructions, primaryMuscle, difficulty, equipment, category } = req.body || {}
  if (![name, description, instructions, primaryMuscle, difficulty, equipment, category].every((value) => typeof value === 'string' && value.trim() && value.length <= 500)) {
    return res.status(400).json({ message: 'Provide all required exercise fields (500 characters max each)' })
  }
  const item = await prisma.exercise.create({
    data: {
      name: name.trim(),
      description: description.trim(),
      instructions: instructions.trim(),
      primaryMuscle: primaryMuscle.trim(),
      secondaryMuscles: Array.isArray(req.body.secondaryMuscles) ? req.body.secondaryMuscles.filter((value) => typeof value === 'string') : [],
      difficulty: difficulty.trim(),
      equipment: equipment.trim(),
      category: category.trim(),
      imageUrl: typeof req.body.imageUrl === 'string' ? req.body.imageUrl : null,
      safetyNotes: typeof req.body.safetyNotes === 'string' ? req.body.safetyNotes.slice(0, 500) : null,
    },
  })
  res.status(201).json({ item })
})

router.put('/:id', authRequired, adminOnly, async (req, res) => {
  const fields = ['name', 'description', 'instructions', 'primaryMuscle', 'difficulty', 'equipment', 'category', 'safetyNotes', 'imageUrl']
  const data = Object.fromEntries(fields.filter((field) => Object.hasOwn(req.body || {}, field)).map((field) => [field, req.body[field]]))
  if (Object.values(data).some((value) => value != null && (typeof value !== 'string' || value.length > 500))) {
    return res.status(400).json({ message: 'Exercise text fields must be no longer than 500 characters' })
  }
  if (Array.isArray(req.body?.secondaryMuscles)) data.secondaryMuscles = req.body.secondaryMuscles.filter((value) => typeof value === 'string')
  const result = await prisma.exercise.updateMany({ where: { id: req.params.id }, data })
  if (!result.count) return res.status(404).json({ message: 'Exercise not found' })
  res.json({ item: await prisma.exercise.findUnique({ where: { id: req.params.id } }) })
})

router.delete('/:id', authRequired, adminOnly, async (req, res) => {
  const item = await prisma.exercise.findUnique({ where: { id: req.params.id } })
  if (!item) return res.status(404).json({ message: 'Exercise not found' })
  await prisma.exercise.delete({ where: { id: item.id } })
  res.json({ item })
})

export default router
