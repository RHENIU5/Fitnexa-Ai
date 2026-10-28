import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

if (!process.env.DATABASE_URL) {
  throw new Error('Set DATABASE_URL to your MongoDB Atlas connection string before starting FitNexa AI.')
}
if (process.env.DATABASE_URL.includes('<db_password>')) {
  throw new Error('Replace <db_password> in DATABASE_URL with your URL-encoded MongoDB Atlas database password.')
}

export const prisma = new PrismaClient()
