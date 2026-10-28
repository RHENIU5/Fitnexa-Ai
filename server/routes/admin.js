import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../db.js'
import { publicUser } from '../lib/serializers.js'
import { validateProfile } from '../lib/validation.js'
import { createMembership, expireMemberships } from '../lib/memberships.js'
import { adminOnly, authRequired } from '../middleware/auth.js'

const router = Router()

router.use(authRequired, adminOnly)

router.get('/overview', async (_req, res) => {
  await expireMemberships()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [members, activeMembers, activeTrainers, activeMemberships, expiredMemberships, attendanceToday, paidPayments] = await Promise.all([
    prisma.user.count({ where: { role: 'member' } }),
    prisma.user.count({ where: { role: 'member', isActive: true } }),
    prisma.trainer.count({ where: { status: 'active' } }),
    prisma.membership.count({ where: { status: 'active' } }),
    prisma.membership.count({ where: { status: 'expired' } }),
    prisma.attendance.count({ where: { checkInAt: { gte: today } } }),
    prisma.paymentRecord.findMany({ where: { status: 'paid' }, select: { amount: true } }),
  ])
  res.json({
    members,
    activeMembers,
    activeTrainers,
    activeMemberships,
    expiredMemberships,
    attendanceToday,
    totalRevenue: paidPayments.reduce((total, payment) => total + payment.amount, 0),
  })
})

router.get('/report', async (_req, res) => {
  await expireMemberships()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const weekStart = new Date(now)
  weekStart.setHours(0, 0, 0, 0)
  weekStart.setDate(weekStart.getDate() - 6)
  const [
    memberUsers,
    trainers,
    memberships,
    attendance,
    payments,
    completedSessions,
    attendanceWeek,
  ] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'member' },
      include: {
        fitnessProfile: true,
        memberships: { orderBy: { createdAt: 'desc' }, take: 1, include: { plan: true } },
        workoutSessions: { where: { status: 'completed' }, orderBy: { completedAt: 'desc' } },
        progressRecords: { where: { weightKg: { not: null } }, orderBy: { date: 'desc' }, take: 1 },
        _count: { select: { attendance: true } },
      },
    }),
    prisma.trainer.count({ where: { status: 'active' } }),
    prisma.membership.findMany(),
    prisma.attendance.findMany({ include: { user: { select: { name: true, role: true } } }, orderBy: { checkInAt: 'desc' }, take: 200 }),
    prisma.paymentRecord.findMany({ include: { user: { select: { name: true, role: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.workoutSession.findMany({ where: { status: 'completed', completedAt: { gte: monthStart } }, include: { user: { select: { name: true, role: true } } }, orderBy: { completedAt: 'desc' } }),
    prisma.attendance.findMany({ where: { checkInAt: { gte: weekStart } }, select: { checkInAt: true } }),
  ])
  const [newMembersThisMonth, activeMembers, inactiveMembers, activeMemberships, expiredCount, cancelledMemberships, pendingPayments] = await Promise.all([
    prisma.user.count({ where: { role: 'member', createdAt: { gte: monthStart } } }),
    prisma.user.count({ where: { role: 'member', isActive: true } }),
    prisma.user.count({ where: { role: 'member', isActive: false } }),
    prisma.membership.count({ where: { status: 'active' } }),
    prisma.membership.count({ where: { status: 'expired' } }),
    prisma.membership.count({ where: { status: 'cancelled' } }),
    prisma.paymentRecord.findMany({ where: { status: 'pending' }, select: { amount: true } }),
  ])
  const members = memberUsers.map((member) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    isActive: member.isActive,
    createdAt: member.createdAt,
    fitnessProfile: member.fitnessProfile,
    completedWorkouts: member.workoutSessions.length,
    latestWorkoutAt: member.workoutSessions[0]?.completedAt || null,
    currentWeightKg: member.progressRecords[0]?.weightKg ?? member.fitnessProfile?.currentWeightKg ?? null,
    membership: member.memberships[0] || null,
    attendanceCount: member._count.attendance,
  })).sort((a, b) => b.completedWorkouts - a.completedWorkouts)
  const goalCounts = new Map()
  for (const member of memberUsers) {
    const goal = member.fitnessProfile?.primaryGoal || 'Not set'
    goalCounts.set(goal, (goalCounts.get(goal) || 0) + 1)
  }
  const attendanceTrend = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + index)
    const key = date.toDateString()
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      visits: attendanceWeek.filter((entry) => new Date(entry.checkInAt).toDateString() === key).length,
    }
  })
  const recentActivity = [
    ...attendance.map((entry) => ({
      id: `attendance-${entry.id}`,
      type: 'attendance',
      memberName: entry.user.name,
      description: entry.checkOutAt ? 'Gym visit completed' : 'Checked in at the gym',
      at: entry.checkInAt,
    })),
    ...completedSessions.map((session) => ({
      id: `workout-${session.id}`,
      type: 'workout',
      memberName: session.user.name,
      description: `Completed a workout${session.durationMin ? ` · ${session.durationMin} min` : ''}`,
      at: session.completedAt,
    })),
    ...memberUsers.map((member) => ({
      id: `member-${member.id}`,
      type: 'member',
      memberName: member.name,
      description: 'Member account created',
      at: member.createdAt,
    })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 8)
  const paidRevenue = payments.filter((payment) => payment.status === 'paid').reduce((total, payment) => total + payment.amount, 0)
  const pendingRevenue = pendingPayments.reduce((total, payment) => total + payment.amount, 0)
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  res.json({
    overview: {
      totalMembers: memberUsers.length,
      activeMembers,
      inactiveMembers,
      newMembersThisMonth,
      activeTrainers: trainers,
      activeMemberships,
      expiredMemberships: expiredCount,
      cancelledMemberships,
      attendanceToday: attendance.filter((entry) => new Date(entry.checkInAt) >= todayStart).length,
      workoutsThisMonth: completedSessions.length,
      paidRevenue,
      pendingRevenue,
      paidPaymentCount: payments.filter((payment) => payment.status === 'paid').length,
      pendingPaymentCount: pendingPayments.length,
      membershipCoverage: memberUsers.length ? Math.round((activeMemberships / memberUsers.length) * 100) : 0,
      totalMembershipRecords: memberships.length,
    },
    members,
    attendanceTrend,
    goalBreakdown: [...goalCounts.entries()].map(([goal, count]) => ({ goal, count })),
    recentActivity,
  })
})

router.get('/members', async (_req, res) => {
  const users = await prisma.user.findMany({
    where: { role: 'member' },
    include: {
      fitnessProfile: true,
      memberships: { orderBy: { createdAt: 'desc' }, take: 1, include: { plan: true } },
      workoutSessions: { where: { status: 'completed' }, select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json({
    items: users.map(({ passwordHash: _passwordHash, memberships, workoutSessions, ...member }) => ({
      ...member,
      membership: memberships[0] || null,
      completedWorkouts: workoutSessions.length,
    })),
  })
})

router.post('/members', async (req, res) => {
  const { name, email, password } = req.body || {}
  if (typeof name !== 'string' || name.trim().length < 2 || name.length > 100
    || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    || typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return res.status(400).json({ message: 'Provide a valid member name, email, and password (8-128 characters)' })
  }
  const item = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: await bcrypt.hash(password, 12),
      role: 'member',
      fitnessProfile: { create: {} },
    },
    include: { fitnessProfile: true },
  })
  res.status(201).json({ item: publicUser(item) })
})

router.patch('/members/:id/status', async (req, res) => {
  if (typeof req.body?.isActive !== 'boolean') return res.status(400).json({ message: 'isActive must be a boolean' })
  const result = await prisma.user.updateMany({
    where: { id: req.params.id, role: 'member' },
    data: { isActive: req.body.isActive },
  })
  if (!result.count) return res.status(404).json({ message: 'Member not found' })
  res.json({ item: { id: req.params.id, isActive: req.body.isActive } })
})

router.put('/members/:id/profile', async (req, res) => {
  if (!(await prisma.user.findFirst({ where: { id: req.params.id, role: 'member' }, select: { id: true } }))) {
    return res.status(404).json({ message: 'Member not found' })
  }
  const data = validateProfile(req.body || {})
  const name = req.body?.name == null ? undefined : String(req.body.name).trim()
  const email = req.body?.email == null ? undefined : String(req.body.email).trim().toLowerCase()
  if (name !== undefined && (name.length < 2 || name.length > 100)) {
    return res.status(400).json({ message: 'Name must be between 2 and 100 characters' })
  }
  if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Enter a valid email address' })
  }
  const result = await prisma.$transaction(async (transaction) => {
    if (name !== undefined || email !== undefined) {
      await transaction.user.update({
        where: { id: req.params.id },
        data: { ...(name !== undefined ? { name } : {}), ...(email !== undefined ? { email } : {}) },
      })
    }
    const profile = await transaction.fitnessProfile.upsert({
      where: { userId: req.params.id },
      create: { userId: req.params.id, ...data },
      update: data,
    })
    const member = await transaction.user.findUnique({ where: { id: req.params.id }, select: { id: true, name: true, email: true } })
    return { profile, member }
  })
  res.json(result)
})

router.delete('/members/:id', async (req, res) => {
  const member = await prisma.user.findFirst({ where: { id: req.params.id, role: 'member' }, select: { id: true, name: true } })
  if (!member) return res.status(404).json({ message: 'Member not found' })
  await prisma.user.delete({ where: { id: member.id } })
  res.json({ item: member })
})

router.get('/trainers', async (_req, res) => {
  res.json({ items: await prisma.trainer.findMany({ orderBy: { name: 'asc' } }) })
})

router.post('/trainers', async (req, res) => {
  const { name, email, specialty } = req.body || {}
  if (![name, email, specialty].every((value) => typeof value === 'string' && value.trim())) {
    return res.status(400).json({ message: 'Name, email, and specialty are required' })
  }
  const item = await prisma.trainer.create({
    data: { name: name.trim(), email: email.trim().toLowerCase(), specialty: specialty.trim() },
  })
  res.status(201).json({ item })
})

router.patch('/trainers/:id', async (req, res) => {
  if (req.body?.status !== 'active' && req.body?.status !== 'inactive') {
    return res.status(400).json({ message: 'Status must be active or inactive' })
  }
  const result = await prisma.trainer.updateMany({ where: { id: req.params.id }, data: { status: req.body.status } })
  if (!result.count) return res.status(404).json({ message: 'Trainer not found' })
  res.json({ item: await prisma.trainer.findUnique({ where: { id: req.params.id } }) })
})

router.delete('/trainers/:id', async (req, res) => {
  const item = await prisma.trainer.findUnique({ where: { id: req.params.id } })
  if (!item) return res.status(404).json({ message: 'Trainer not found' })
  await prisma.trainer.delete({ where: { id: item.id } })
  res.json({ item })
})

router.get('/trainer-assignments', async (_req, res) => {
  const items = await prisma.trainerAssignment.findMany({
    include: { trainer: { select: { name: true, specialty: true } }, member: { select: { name: true, email: true } } },
    orderBy: { assignmentDate: 'desc' },
  })
  res.json({ items })
})

router.post('/trainer-assignments', async (req, res) => {
  const [trainer, member] = await Promise.all([
    prisma.trainer.findFirst({ where: { id: req.body?.trainerId, status: 'active' }, select: { id: true } }),
    prisma.user.findFirst({ where: { id: req.body?.memberId, role: 'member', isActive: true }, select: { id: true } }),
  ])
  if (!trainer || !member) return res.status(404).json({ message: 'Choose an active trainer and active member' })
  const existing = await prisma.trainerAssignment.findFirst({
    where: { trainerId: trainer.id, memberId: member.id, status: 'active' },
    select: { id: true },
  })
  if (existing) return res.status(409).json({ message: 'This trainer is already assigned to that member' })
  const item = await prisma.trainerAssignment.create({
    data: { trainerId: trainer.id, memberId: member.id },
    include: { trainer: { select: { name: true, specialty: true } }, member: { select: { name: true, email: true } } },
  })
  res.status(201).json({ item })
})

router.delete('/trainer-assignments/:id', async (req, res) => {
  const item = await prisma.trainerAssignment.findUnique({ where: { id: req.params.id } })
  if (!item) return res.status(404).json({ message: 'Trainer assignment not found' })
  await prisma.trainerAssignment.delete({ where: { id: item.id } })
  res.json({ item })
})

router.get('/attendance', async (_req, res) => {
  const records = await prisma.attendance.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { checkInAt: 'desc' },
  })
  res.json({ items: records.map(({ user, ...entry }) => ({ ...entry, memberName: user.name })) })
})

router.post('/attendance/check-in', async (req, res) => {
  const member = await prisma.user.findFirst({ where: { id: req.body?.userId, role: 'member', isActive: true }, select: { id: true } })
  if (!member) return res.status(404).json({ message: 'Active member not found' })
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const existing = await prisma.attendance.findFirst({ where: { userId: member.id, checkOutAt: null, checkInAt: { gte: start } } })
  if (existing) return res.status(409).json({ message: 'Member already has an open check-in today' })
  const item = await prisma.attendance.create({
    data: { userId: member.id, location: String(req.body?.location || 'Main gym').slice(0, 100) },
  })
  res.status(201).json({ item })
})

router.patch('/attendance/:id/check-out', async (req, res) => {
  const result = await prisma.attendance.updateMany({
    where: { id: req.params.id, checkOutAt: null },
    data: { checkOutAt: new Date() },
  })
  if (!result.count) return res.status(404).json({ message: 'Open attendance record not found' })
  res.json({ item: await prisma.attendance.findUnique({ where: { id: req.params.id } }) })
})

router.get('/payments', async (_req, res) => {
  const payments = await prisma.paymentRecord.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ items: payments.map(({ user, ...payment }) => ({ ...payment, memberName: user.name })) })
})

router.patch('/payments/:id/status', async (req, res) => {
  if (!['pending', 'paid', 'overdue', 'cancelled'].includes(req.body?.status)) {
    return res.status(400).json({ message: 'Unsupported payment status' })
  }
  const result = await prisma.paymentRecord.updateMany({
    where: { id: req.params.id },
    data: { status: req.body.status, paidAt: req.body.status === 'paid' ? new Date() : null },
  })
  if (!result.count) return res.status(404).json({ message: 'Payment record not found' })
  res.json({
    item: await prisma.paymentRecord.findUnique({ where: { id: req.params.id } }),
    message: 'Payment status recorded. No payment was processed.',
  })
})

router.get('/membership-plans', async (_req, res) => {
  res.json({ items: await prisma.membershipPlan.findMany({ orderBy: { price: 'asc' } }) })
})

router.post('/membership-plans', async (req, res) => {
  const { name, price, durationDays, description } = req.body || {}
  if (typeof name !== 'string' || !name.trim() || !Number.isFinite(Number(price)) || Number(price) < 0
    || !Number.isInteger(Number(durationDays)) || Number(durationDays) < 1) {
    return res.status(400).json({ message: 'Provide a plan name, non-negative price, and positive duration' })
  }
  const item = await prisma.membershipPlan.create({
    data: { name: name.trim(), price: Number(price), durationDays: Number(durationDays), description: description ? String(description).slice(0, 500) : null },
  })
  res.status(201).json({ item })
})

router.put('/membership-plans/:id', async (req, res) => {
  const data = {}
  if (req.body?.name != null) data.name = String(req.body.name).trim()
  if (req.body?.description != null) data.description = String(req.body.description).slice(0, 500)
  if (req.body?.price != null) {
    data.price = Number(req.body.price)
    if (!Number.isFinite(data.price) || data.price < 0) return res.status(400).json({ message: 'Price must be non-negative' })
  }
  if (req.body?.durationDays != null) {
    data.durationDays = Number(req.body.durationDays)
    if (!Number.isInteger(data.durationDays) || data.durationDays < 1) return res.status(400).json({ message: 'Duration must be a positive number of days' })
  }
  const result = await prisma.membershipPlan.updateMany({ where: { id: req.params.id }, data })
  if (!result.count) return res.status(404).json({ message: 'Membership plan not found' })
  res.json({ item: await prisma.membershipPlan.findUnique({ where: { id: req.params.id } }) })
})

router.delete('/membership-plans/:id', async (req, res) => {
  const plan = await prisma.membershipPlan.findUnique({ where: { id: req.params.id } })
  if (!plan) return res.status(404).json({ message: 'Membership plan not found' })
  await prisma.membershipPlan.update({ where: { id: plan.id }, data: { isActive: false } })
  res.json({ item: { ...plan, isActive: false } })
})

router.post('/memberships', async (req, res) => {
  const result = await createMembership(req.body?.userId, req.body?.planId)
  if (result.error) return res.status(404).json({ message: result.error })
  if (result.conflict) return res.status(409).json({ message: result.conflict })
  res.status(201).json({ item: result.item, message: 'Membership and pending payment record created. No payment was processed.' })
})

router.patch('/memberships/:id/status', async (req, res) => {
  if (!['active', 'expired', 'cancelled'].includes(req.body?.status)) {
    return res.status(400).json({ message: 'Unsupported membership status' })
  }
  const result = await prisma.membership.updateMany({ where: { id: req.params.id }, data: { status: req.body.status } })
  if (!result.count) return res.status(404).json({ message: 'Membership not found' })
  res.json({ item: await prisma.membership.findUnique({ where: { id: req.params.id }, include: { plan: true } }) })
})

router.get('/workout-templates', async (_req, res) => {
  res.json({ items: await prisma.workoutTemplate.findMany({ orderBy: { updatedAt: 'desc' } }) })
})

router.post('/workout-templates', async (req, res) => {
  const { title, description, goal, weeklySchedule } = req.body || {}
  if (typeof title !== 'string' || !title.trim()) return res.status(400).json({ message: 'Template title is required' })
  const item = await prisma.workoutTemplate.create({
    data: { title: title.trim().slice(0, 120), description: description ? String(description).slice(0, 1000) : null, goal: goal ? String(goal).slice(0, 120) : null, weeklySchedule: weeklySchedule ? String(weeklySchedule).slice(0, 300) : null },
  })
  res.status(201).json({ item })
})

router.put('/workout-templates/:id', async (req, res) => {
  const data = {}
  for (const field of ['title', 'description', 'goal', 'weeklySchedule']) {
    if (Object.hasOwn(req.body || {}, field)) data[field] = req.body[field] == null ? null : String(req.body[field]).slice(0, field === 'description' ? 1000 : 300)
  }
  const result = await prisma.workoutTemplate.updateMany({ where: { id: req.params.id }, data })
  if (!result.count) return res.status(404).json({ message: 'Workout template not found' })
  res.json({ item: await prisma.workoutTemplate.findUnique({ where: { id: req.params.id } }) })
})

router.delete('/workout-templates/:id', async (req, res) => {
  const item = await prisma.workoutTemplate.findUnique({ where: { id: req.params.id } })
  if (!item) return res.status(404).json({ message: 'Workout template not found' })
  await prisma.workoutTemplate.delete({ where: { id: item.id } })
  res.json({ item })
})

router.get('/notifications', async (_req, res) => {
  const items = await prisma.gymNotification.findMany({ include: { createdBy: { select: { name: true } } }, orderBy: { createdAt: 'desc' } })
  res.json({ items: items.map(({ createdBy, ...item }) => ({ ...item, createdByName: createdBy.name })) })
})

router.post('/notifications', async (req, res) => {
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : ''
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : ''
  if (!title || !message) return res.status(400).json({ message: 'Notification title and message are required' })
  const item = await prisma.gymNotification.create({
    data: { title: title.slice(0, 120), message: message.slice(0, 2000), createdById: req.user.id },
  })
  res.status(201).json({ item })
})

router.delete('/notifications/:id', async (req, res) => {
  const item = await prisma.gymNotification.findUnique({ where: { id: req.params.id } })
  if (!item) return res.status(404).json({ message: 'Announcement not found' })
  await prisma.gymNotification.delete({ where: { id: item.id } })
  res.json({ item })
})

router.get('/settings', async (_req, res) => {
  res.json({ items: await prisma.systemSetting.findMany({ orderBy: { key: 'asc' } }) })
})

router.put('/settings', async (req, res) => {
  const entries = req.body?.settings
  if (!entries || typeof entries !== 'object' || Array.isArray(entries)) {
    return res.status(400).json({ message: 'Settings must be provided as a key/value object' })
  }
  const data = Object.entries(entries).map(([key, value]) => ({
    key: key.trim().slice(0, 100),
    value: String(value).slice(0, 1000),
  }))
  if (data.some((entry) => !entry.key)) return res.status(400).json({ message: 'Setting keys cannot be empty' })
  await prisma.$transaction(data.map(({ key, value }) => prisma.systemSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  })))
  res.json({ items: await prisma.systemSetting.findMany({ orderBy: { key: 'asc' } }) })
})

export default router
