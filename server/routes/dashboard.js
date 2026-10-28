import { Router } from 'express'
import { prisma } from '../db.js'
import { authRequired, memberOnly } from '../middleware/auth.js'
import { getFitnessRecommendations, getWorkoutStreak } from '../lib/recommendations.js'

const router = Router()

router.get('/metrics', authRequired, memberOnly, async (req, res) => {
  const [user, sessions, measurements, reminders] = await Promise.all([
    prisma.user.findUnique({ where: { id: req.user.id }, include: { fitnessProfile: true } }),
    prisma.workoutSession.findMany({ where: { userId: req.user.id }, orderBy: { startedAt: 'desc' } }),
    prisma.progressRecord.findMany({ where: { userId: req.user.id, weightKg: { not: null } }, orderBy: { date: 'desc' } }),
    prisma.reminder.findMany({ where: { userId: req.user.id, scheduledAt: { gte: new Date() } }, orderBy: { scheduledAt: 'asc' }, take: 5 }),
  ])
  const profile = user?.fitnessProfile || {}
  const currentWeight = measurements[0]?.weightKg ?? profile.currentWeightKg ?? null
  const targetWeight = profile.targetWeightKg
  const startWeight = measurements.at(-1)?.weightKg ?? profile.currentWeightKg
  const goalProgress = currentWeight != null && targetWeight && startWeight && startWeight !== targetWeight
    ? Math.max(0, Math.min(100, Math.round(((startWeight - currentWeight) / (startWeight - targetWeight)) * 100)))
    : 0
  const completed = sessions.filter((session) => session.status === 'completed')
  res.json({
    welcome: `Welcome back, ${user?.name?.split(' ')[0] || 'Athlete'}!`,
    todaysWorkout: null,
    weeklySchedule: [],
    totalCompletedWorkouts: completed.length,
    currentConsistencyStreak: getWorkoutStreak(completed),
    currentWeight,
    goalCompletionProgress: goalProgress,
    workoutsThisWeek: completed.filter((session) => session.completedAt && new Date(session.completedAt) >= new Date(Date.now() - 7 * 86400000)).length,
    recentWorkouts: sessions.slice(0, 5),
    aiCoachRecommendations: getFitnessRecommendations(profile, completed),
    upcomingReminders: reminders.map((reminder) => ({ id: reminder.id, title: reminder.title, time: reminder.scheduledAt })),
  })
})

export default router
