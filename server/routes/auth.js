import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../db.js'
import { issueToken } from '../lib/tokens.js'
import { publicUser } from '../lib/serializers.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

router.get('/health', (_req, res) => res.json({ ok: true, message: 'Authentication is available.' }))

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body || {}
  if (typeof name !== 'string' || name.trim().length < 2 || name.length > 100) {
    return res.status(400).json({ message: 'Name must be between 2 and 100 characters' })
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ message: 'A valid email is required' })
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return res.status(400).json({ message: 'Password must be between 8 and 128 characters' })
  }
  const normalizedEmail = email.trim().toLowerCase()
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail }, select: { id: true } })
  if (existing) return res.status(409).json({ message: 'An account with that email already exists' })
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, 12),
      role: 'member',
      fitnessProfile: { create: {} },
    },
    include: { fitnessProfile: true },
  })
  return res.status(201).json({ token: issueToken(user), user: publicUser(user) })
})

router.post('/login', async (req, res) => {
  const { email, password, portal } = req.body || {}
  if (!['member', 'admin'].includes(portal) || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Choose a portal and enter your email and password' })
  }
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: { fitnessProfile: true },
  })
  const validPassword = user ? await bcrypt.compare(password, user.passwordHash) : false
  if (!user || !user.isActive || !validPassword || user.role !== portal) {
    return res.status(401).json({ message: 'Invalid credentials for this portal' })
  }
  return res.json({ token: issueToken(user), user: publicUser(user) })
})

router.post('/logout', (_req, res) => res.json({ message: 'Signed out successfully' }))

router.get('/me', authRequired, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { fitnessProfile: true },
  })
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json({ user: publicUser(user) })
})

export default router
