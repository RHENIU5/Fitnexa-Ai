import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { prisma } from '../server/db.js'

function readHidden(prompt) {
  if (!stdin.isTTY || !stdout.isTTY) {
    throw new Error('Admin setup must run in an interactive terminal so passwords are not exposed.')
  }
  return new Promise((resolve, reject) => {
    stdout.write(prompt)
    stdin.setRawMode(true)
    stdin.resume()
    let value = ''
    const onData = (chunk) => {
      for (const character of chunk.toString()) {
        if (character === '\u0003') {
          stdin.setRawMode(false)
          stdin.off('data', onData)
          reject(new Error('Admin setup cancelled.'))
          return
        }
        if (character === '\r' || character === '\n') {
          stdin.setRawMode(false)
          stdin.off('data', onData)
          stdout.write('\n')
          resolve(value)
          return
        }
        if (character === '\u007f' || character === '\b') {
          value = value.slice(0, -1)
          continue
        }
        value += character
      }
    }
    stdin.on('data', onData)
  })
}

async function provisionAdmin() {
  if (!stdin.isTTY || !stdout.isTTY) {
    throw new Error('Admin setup must run in an interactive terminal so passwords are not exposed.')
  }
  const prompts = createInterface({ input: stdin, output: stdout })
  try {
    const name = (await prompts.question('Administrator name: ')).trim()
    const email = (await prompts.question('Administrator email: ')).trim().toLowerCase()
    prompts.close()

    if (name.length < 2 || name.length > 100) throw new Error('Name must be between 2 and 100 characters.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.')
    const password = await readHidden('Password (minimum 12 characters): ')
    if (password.length < 12 || password.length > 128) throw new Error('Password must be between 12 and 128 characters.')

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await bcrypt.hash(password, 12),
        role: 'admin',
        isActive: true,
      },
      select: { id: true, email: true },
    })
    stdout.write(`Administrator account provisioned for ${user.email}.\n`)
  } finally {
    prompts.close()
    await prisma.$disconnect()
  }
}

provisionAdmin().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
