import jwt from 'jsonwebtoken'
import { prisma } from '../db.js'
import { jwtSecret } from '../config/env.js'

export async function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return res.status(401).json({ message: 'Authentication required' })
  try {
    const payload = jwt.verify(token, jwtSecret)
    if (typeof payload !== 'object' || typeof payload.id !== 'string') {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, role: true, isActive: true },
    })
    if (!user || !user.isActive) return res.status(403).json({ message: 'This account is inactive or unavailable' })
    req.user = user
    return next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }
    return next(error)
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required' })
  return next()
}

export function memberOnly(req, res, next) {
  if (req.user?.role !== 'member') return res.status(403).json({ message: 'Member portal access required' })
  return next()
}
