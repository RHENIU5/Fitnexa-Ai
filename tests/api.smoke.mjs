import bcrypt from 'bcryptjs'
import { prisma } from '../server/db.js'

const BASE = process.env.API_BASE || 'http://localhost:3001'
const stamp = Date.now()
const memberEmail = `smoke.member.${stamp}@example.com`
const adminEmail = `smoke.admin.${stamp}@example.com`
const trainerEmail = `smoke.trainer.${stamp}@example.com`
const createdUserIds = []
let passed = 0
const failures = []

function check(name, condition, detail = '') {
  if (condition) {
    passed += 1
    console.log(`PASS  ${name}`)
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`)
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

async function call(method, path, { token, body } = {}) {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  let payload = {}
  try { payload = await response.json() } catch { /* empty body */ }
  return { status: response.status, body: payload }
}

async function main() {
  const health = await call('GET', '/health')
  check('GET /health returns 200 + db connected', health.status === 200 && health.body.database === 'connected', JSON.stringify(health.body))

  const noAuth = await call('GET', '/api/v1/auth/me')
  check('GET /auth/me without token → 401', noAuth.status === 401, `got ${noAuth.status}`)

  const badRegister = await call('POST', '/api/v1/auth/register', { body: { name: 'A', email: 'nope', password: '123' } })
  check('register validates input → 400', badRegister.status === 400, `got ${badRegister.status}`)

  const register = await call('POST', '/api/v1/auth/register', { body: { name: 'Smoke Member', email: memberEmail, password: 'smoke-password-1' } })
  check('member registration → 201 + token', register.status === 201 && Boolean(register.body.token), `got ${register.status}`)
  if (register.body.user?.id) createdUserIds.push(register.body.user.id)
  const memberToken = register.body.token

  const duplicate = await call('POST', '/api/v1/auth/register', { body: { name: 'Smoke Member', email: memberEmail, password: 'smoke-password-1' } })
  check('duplicate registration → 409', duplicate.status === 409, `got ${duplicate.status}`)

  const wrongPassword = await call('POST', '/api/v1/auth/login', { body: { email: memberEmail, password: 'wrong-password', portal: 'member' } })
  check('invalid login → 401', wrongPassword.status === 401, `got ${wrongPassword.status}`)

  const portalMismatch = await call('POST', '/api/v1/auth/login', { body: { email: memberEmail, password: 'smoke-password-1', portal: 'admin' } })
  check('member cannot log in via admin portal → 401', portalMismatch.status === 401, `got ${portalMismatch.status}`)

  const login = await call('POST', '/api/v1/auth/login', { body: { email: memberEmail, password: 'smoke-password-1', portal: 'member' } })
  check('member login → 200 + token', login.status === 200 && Boolean(login.body.token), `got ${login.status}`)

  const me = await call('GET', '/api/v1/auth/me', { token: memberToken })
  check('GET /auth/me → current member', me.status === 200 && me.body.user?.email === memberEmail, `got ${me.status}`)

  const forbidden = await call('GET', '/api/v1/gym/admin/report', { token: memberToken })
  check('member blocked from admin report → 403', forbidden.status === 403, `got ${forbidden.status}`)

  const badProfile = await call('PUT', '/api/v1/profile', { token: memberToken, body: { primaryGoal: 'become a wizard' } })
  check('profile rejects unsupported goal → 400', badProfile.status === 400, `got ${badProfile.status}`)

  const profile = await call('PUT', '/api/v1/profile', {
    token: memberToken,
    body: {
      age: 30, heightCm: 180, currentWeightKg: 82, targetWeightKg: 78,
      experience: 'Intermediate', primaryGoal: 'muscle building',
      workoutFrequency: '4 days/week', preferredDuration: '45-60 min',
      trainingLocation: 'Gym', equipment: 'Barbell, dumbbells',
      dietaryPreferences: 'vegetarian', allergies: 'none', limitations: '',
    },
  })
  check('PUT /profile saves fitness profile', profile.status === 200 && profile.body.profile?.primaryGoal === 'muscle building', JSON.stringify(profile.body).slice(0, 120))

  const metrics = await call('GET', '/api/v1/dashboard/metrics', { token: memberToken })
  check('GET /dashboard/metrics → 200', metrics.status === 200, `got ${metrics.status}`)

  const exercises = await call('GET', '/api/v1/exercises', { token: memberToken })
  check('exercise catalog seeded', exercises.status === 200 && (exercises.body.items?.length || 0) >= 5, `count ${exercises.body.items?.length}`)

  const plansList = await call('GET', '/api/v1/workouts/plans', { token: memberToken })
  check('GET /workouts/plans → 200', plansList.status === 200, `got ${plansList.status}`)

  const plan = await call('POST', '/api/v1/workouts/plans', { token: memberToken, body: { title: 'Smoke Test Plan', goal: 'muscle building', weeklySchedule: 'Mon/Wed/Fri' } })
  check('create workout plan → 201', plan.status === 201 && plan.body.item?.id, `got ${plan.status}`)

  const session = await call('POST', '/api/v1/workouts/sessions/start', { token: memberToken, body: { planId: plan.body.item?.id } })
  check('start workout session → 201', session.status === 201 && session.body.item?.id, `got ${session.status}`)

  if (session.body.item?.id) {
    const complete = await call('PATCH', `/api/v1/workouts/sessions/${session.body.item.id}/complete`, { token: memberToken, body: { durationMin: 42, notes: 'Smoke test' } })
    check('complete workout session → 200', complete.status === 200, `got ${complete.status}`)
  }

  const history = await call('GET', '/api/v1/workouts/history', { token: memberToken })
  check('workout history contains the completed session', history.status === 200 && (history.body.items?.length || 0) >= 1, `got ${history.status}`)

  const badProgress = await call('POST', '/api/v1/progress', { token: memberToken, body: {} })
  check('progress rejects empty payload → 400', badProgress.status === 400, `got ${badProgress.status}`)

  const progress = await call('POST', '/api/v1/progress', { token: memberToken, body: { weightKg: 81.4, bodyFatPct: 18.2, notes: 'Smoke test' } })
  check('log progress record → 201', progress.status === 201, `got ${progress.status}`)

  const progressList = await call('GET', '/api/v1/progress', { token: memberToken })
  check('GET /progress → records', progressList.status === 200 && (progressList.body.items?.length || 0) >= 1, `got ${progressList.status}`)

  const foods = await call('GET', '/api/v1/nutrition/foods', { token: memberToken })
  check('food catalog seeded', foods.status === 200 && (foods.body.items?.length || 0) >= 1, `count ${foods.body.items?.length}`)

  const foodLog = await call('POST', '/api/v1/nutrition/logs', {
    token: memberToken,
    body: { name: 'Oatmeal', mealType: 'breakfast', servingSize: '1 bowl', calories: 320, protein: 12, carbs: 48, fats: 8 },
  })
  check('log meal → 201', foodLog.status === 201, `got ${foodLog.status}`)

  const nutrition = await call('GET', '/api/v1/nutrition/logs', { token: memberToken })
  check('GET /nutrition/logs → entries', nutrition.status === 200 && (nutrition.body.items?.length || 0) >= 1, `got ${nutrition.status}`)

  const chat = await call('POST', '/api/v1/ai/chat', { token: memberToken, body: { message: 'How should I structure my week?' } })
  check('AI coach replies → 200', chat.status === 200 && Boolean(chat.body.message?.content), `got ${chat.status}`)

  const chatHistory = await call('GET', '/api/v1/ai/history', { token: memberToken })
  check('GET /ai/history → messages', chatHistory.status === 200 && (chatHistory.body.items?.length || 0) >= 1, `got ${chatHistory.status}`)

  const checkIn = await call('POST', '/api/v1/gym/attendance/check-in', { token: memberToken, body: { location: 'Main gym' } })
  check('member gym check-in → 201', checkIn.status === 201 && checkIn.body.item?.id, `got ${checkIn.status}`)
  if (checkIn.body.item?.id) {
    const checkOut = await call('PATCH', `/api/v1/gym/attendance/${checkIn.body.item.id}/check-out`, { token: memberToken })
    check('member gym check-out → 200', checkOut.status === 200, `got ${checkOut.status}`)
  }

  const planCatalog = await call('GET', '/api/v1/gym/membership-plans', { token: memberToken })
  check('membership plans seeded', planCatalog.status === 200 && (planCatalog.body.items?.length || 0) >= 1, `count ${planCatalog.body.items?.length}`)

  if (planCatalog.body.items?.[0]?.id) {
    const enroll = await call('POST', '/api/v1/gym/memberships', { token: memberToken, body: { planId: planCatalog.body.items[0].id } })
    check('member enrols in membership → 201', enroll.status === 201, `got ${enroll.status}`)
    const payments = await call('GET', '/api/v1/gym/payments', { token: memberToken })
    check('enrolment creates pending payment record', payments.status === 200 && (payments.body.items?.length || 0) >= 1, `got ${payments.status}`)
  }

  const reminder = await call('POST', '/api/v1/reminders', { token: memberToken, body: { title: 'Smoke reminder', message: 'Drink water', scheduledAt: new Date(Date.now() + 86400000).toISOString() } })
  check('create reminder → 201', reminder.status === 201, `got ${reminder.status}`)

  const reminderList = await call('GET', '/api/v1/reminders', { token: memberToken })
  check('GET /reminders → items', reminderList.status === 200 && (reminderList.body.items?.length || 0) >= 1, `got ${reminderList.status}`)

  // --- Admin flow: provision admin directly, verify portal login and admin endpoints ---
  const admin = await prisma.user.create({
    data: { name: 'Smoke Admin', email: adminEmail, passwordHash: await bcrypt.hash('admin-password-1', 10), role: 'admin' },
  })
  createdUserIds.push(admin.id)

  const adminLogin = await call('POST', '/api/v1/auth/login', { body: { email: adminEmail, password: 'admin-password-1', portal: 'admin' } })
  check('admin portal login → 200', adminLogin.status === 200 && Boolean(adminLogin.body.token), `got ${adminLogin.status}`)
  const adminToken = adminLogin.body.token

  const report = await call('GET', '/api/v1/gym/admin/report', { token: adminToken })
  check('admin report → overview + members', report.status === 200 && typeof report.body.overview?.totalMembers === 'number', `got ${report.status}`)

  const adminEndpoints = [
    ['/api/v1/gym/admin/trainers', 'trainers'],
    ['/api/v1/gym/admin/trainer-assignments', 'trainer assignments'],
    ['/api/v1/gym/admin/attendance', 'attendance'],
    ['/api/v1/gym/admin/payments', 'payments'],
    ['/api/v1/gym/admin/membership-plans', 'membership plans'],
    ['/api/v1/gym/admin/workout-templates', 'workout templates'],
    ['/api/v1/gym/admin/notifications', 'notifications'],
    ['/api/v1/gym/admin/settings', 'settings'],
  ]
  for (const [path, label] of adminEndpoints) {
    const response = await call('GET', path, { token: adminToken })
    check(`admin GET ${label} → 200`, response.status === 200, `got ${response.status}`)
  }

  const trainer = await call('POST', '/api/v1/gym/admin/trainers', { token: adminToken, body: { name: 'Smoke Trainer', email: trainerEmail, specialty: 'Strength' } })
  check('admin creates trainer → 201', trainer.status === 201, `got ${trainer.status}`)

  const memberCreate = await call('POST', '/api/v1/gym/admin/members', { token: adminToken, body: { name: 'Created Member', email: `created.${stamp}@example.com`, password: 'created-password-1' } })
  check('admin creates member account → 201', memberCreate.status === 201, `got ${memberCreate.status}`)
  if (memberCreate.body.item?.id) createdUserIds.push(memberCreate.body.item.id)

  if (trainer.body.item?.id && memberCreate.body.item?.id) {
    const assignment = await call('POST', '/api/v1/gym/admin/trainer-assignments', { token: adminToken, body: { trainerId: trainer.body.item.id, memberId: memberCreate.body.item.id } })
    check('admin assigns trainer → 201', assignment.status === 201, `got ${assignment.status}`)
  }

  const template = await call('POST', '/api/v1/gym/admin/workout-templates', { token: adminToken, body: { title: 'Smoke Template', description: 'Test', goal: 'Strength', weeklySchedule: 'Mon, Wed' } })
  check('admin creates workout template → 201', template.status === 201, `got ${template.status}`)

  const notification = await call('POST', '/api/v1/gym/admin/notifications', { token: adminToken, body: { title: 'Smoke Notice', message: 'Testing notifications' } })
  check('admin publishes notification → 201', notification.status === 201, `got ${notification.status}`)

  const settings = await call('PUT', '/api/v1/gym/admin/settings', { token: adminToken, body: { settings: { gymName: 'FitNexa Test Gym', timezone: 'Asia/Kolkata', contactEmail: 'gym@example.com' } } })
  check('admin saves system settings → 200', settings.status === 200, `got ${settings.status}`)

  if (memberCreate.body.item?.id) {
    const adminCheckIn = await call('POST', '/api/v1/gym/admin/attendance/check-in', { token: adminToken, body: { userId: memberCreate.body.item.id } })
    check('admin records member check-in → 201', adminCheckIn.status === 201, `got ${adminCheckIn.status}`)
    if (adminCheckIn.body.item?.id) {
      const adminCheckOut = await call('PATCH', `/api/v1/gym/admin/attendance/${adminCheckIn.body.item.id}/check-out`, { token: adminToken })
      check('admin records member check-out → 200', adminCheckOut.status === 200, `got ${adminCheckOut.status}`)
    }
  }

  const logout = await call('POST', '/api/v1/auth/logout', { token: memberToken })
  check('POST /auth/logout → 200', logout.status === 200, `got ${logout.status}`)

  // --- cleanup ---
  await prisma.gymNotification.deleteMany({ where: { title: 'Smoke Notice' } })
  await prisma.workoutTemplate.deleteMany({ where: { title: 'Smoke Template' } })
  await prisma.trainer.deleteMany({ where: { email: trainerEmail } })
  await prisma.systemSetting.deleteMany({ where: { key: { in: ['gymName', 'timezone', 'contactEmail'] } } })
  for (const id of createdUserIds) {
    await prisma.user.delete({ where: { id } }).catch(() => {})
  }
  await prisma.$disconnect()

  console.log(`\n${passed} passed, ${failures.length} failed`)
  if (failures.length) {
    console.log('Failures:')
    failures.forEach((failure) => console.log(` - ${failure}`))
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error('SMOKE TEST CRASHED:', error)
  process.exitCode = 1
})
