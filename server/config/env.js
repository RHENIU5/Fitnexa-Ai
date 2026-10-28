import 'dotenv/config'

export const port = Number(process.env.PORT || 3001)
export const jwtSecret = process.env.JWT_SECRET

if (!jwtSecret) {
  throw new Error('Set JWT_SECRET before starting FitNexa AI.')
}
if (jwtSecret.length < 32) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Production JWT_SECRET must be a random value of at least 32 characters.')
  }
  console.warn('JWT_SECRET is shorter than 32 characters; replace it before exposing this development server.')
}
