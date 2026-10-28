import jwt from 'jsonwebtoken'
import { jwtSecret } from '../config/env.js'

export function issueToken(user) {
  return jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '8h' })
}
