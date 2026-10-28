import { Router } from 'express'
import { prisma } from '../db.js'
import { authRequired, memberOnly } from '../middleware/auth.js'
import { getFitnessRecommendations } from '../lib/recommendations.js'

const router = Router()

router.post('/chat', authRequired, memberOnly, async (req, res) => {
  const message = typeof req.body?.message === 'string' ? req.body.message.trim().slice(0, 2000) : ''
  if (!message) return res.status(400).json({ message: 'Write a message for your coach' })
  const profile = await prisma.fitnessProfile.findUnique({ where: { userId: req.user.id } })
  let conversation = await prisma.aIConversation.findFirst({ where: { userId: req.user.id }, orderBy: { updatedAt: 'desc' } })
  if (!conversation) {
    conversation = await prisma.aIConversation.create({ data: { userId: req.user.id, title: message.slice(0, 80) } })
  }
  const guidance = getFitnessRecommendations(profile || {})
  const response = `General fitness guidance: ${guidance[0]} Start gradually, adjust based on how you feel, and consult a qualified health professional for personal medical advice.`
  await prisma.aIMessage.createMany({
    data: [
      { conversationId: conversation.id, role: 'user', content: message },
      { conversationId: conversation.id, role: 'assistant', content: response },
    ],
  })
  res.json({ conversationId: conversation.id, message: { role: 'assistant', content: response } })
})

router.get('/history', authRequired, memberOnly, async (req, res) => {
  const items = await prisma.aIConversation.findMany({
    where: { userId: req.user.id },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
    orderBy: { updatedAt: 'desc' },
  })
  res.json({ items })
})

export default router
