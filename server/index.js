import { port } from './config/env.js'
import app from './app.js'
import { prisma } from './db.js'
import { seedCatalog } from './lib/catalog.js'

async function start() {
  await prisma.$connect()
  await seedCatalog()
  const server = app.listen(port, () => console.log(`FitNexa AI API running on port ${port} with MongoDB Atlas storage`))
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
      server.close(async () => {
        await prisma.$disconnect()
        process.exit(0)
      })
    })
  }
}

start().catch(async (error) => {
  console.error('FitNexa AI could not connect to MongoDB Atlas or initialize its catalog.')
  console.error(error.message)
  await prisma.$disconnect()
  process.exitCode = 1
})
