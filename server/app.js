import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import swaggerUi from 'swagger-ui-express'
import yaml from 'yamljs'
import { fileURLToPath } from 'node:url'
import { prisma } from './db.js'
import authRouter from './routes/auth.js'
import profileRouter from './routes/profile.js'
import dashboardRouter from './routes/dashboard.js'
import exercisesRouter from './routes/exercises.js'
import workoutsRouter from './routes/workouts.js'
import progressRouter from './routes/progress.js'
import aiRouter from './routes/ai.js'
import nutritionRouter from './routes/nutrition.js'
import gymRouter from './routes/gym.js'
import adminRouter from './routes/admin.js'
import remindersRouter from './routes/reminders.js'

const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))
app.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

const swaggerDocument = yaml.load(fileURLToPath(new URL('./swagger.yaml', import.meta.url)))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.get('/api-docs-json', (_req, res) => res.json(swaggerDocument))

app.get('/health', async (_req, res) => {
  await prisma.$runCommandRaw({ ping: 1 })
  res.json({ ok: true, service: 'FitNexa AI API', database: 'connected', timestamp: new Date().toISOString() })
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/profile', profileRouter)
app.use('/api/v1/dashboard', dashboardRouter)
app.use('/api/v1/exercises', exercisesRouter)
app.use('/api/v1/workouts', workoutsRouter)
app.use('/api/v1/progress', progressRouter)
app.use('/api/v1/ai', aiRouter)
app.use('/api/v1/nutrition', nutritionRouter)
app.use('/api/v1/gym/admin', adminRouter)
app.use('/api/v1/gym', gymRouter)
app.use('/api/v1/reminders', remindersRouter)

app.use((error, _req, res, _next) => {
  console.error(error)
  if (error?.code === 'P2002') return res.status(409).json({ message: 'A record with that value already exists' })
  if (error?.code === 'P2025') return res.status(404).json({ message: 'Record not found' })
  res.status(error.status || 500).json({ message: error.status ? error.message : 'Something went wrong while processing the request' })
})

export default app
