import { Router } from 'express'
import { prisma } from '../db.js'
import { authRequired, memberOnly } from '../middleware/auth.js'
import { validateProfile } from '../lib/validation.js'

const router = Router()

router.get('/', authRequired, memberOnly, async (req, res) => {
  const profile = await prisma.fitnessProfile.findUnique({ where: { userId: req.user.id } })
  res.json({ profile: profile || {} })
})

router.put('/', authRequired, memberOnly, async (req, res) => {
  const data = validateProfile(req.body || {})
  const profile = await prisma.fitnessProfile.upsert({
    where: { userId: req.user.id },
    create: { userId: req.user.id, ...data },
    update: data,
  })
  res.json({ profile })
})

export default router
