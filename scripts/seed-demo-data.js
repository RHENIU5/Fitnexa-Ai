import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'node:crypto'
import { prisma } from '../server/db.js'
import { seedCatalog } from '../server/lib/catalog.js'

const demoPassword = randomBytes(18).toString('base64url')
const now = new Date()
const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

const memberFixtures = [
  {
    name: 'Demo Member Alex',
    email: 'demo.alex@fitnexa.ai',
    active: true,
    profile: {
      age: 29,
      heightCm: 178,
      currentWeightKg: 78,
      targetWeightKg: 74,
      experience: 'Intermediate',
      primaryGoal: 'strength improvement',
      workoutFrequency: '4 days/week',
      preferredDuration: '45-60 min',
      equipment: 'Barbell, dumbbells',
      trainingLocation: 'Gym',
      dietaryPreferences: 'Balanced',
      allergies: 'None',
    },
    planName: 'Core Membership',
    membershipStatus: 'active',
    membershipStartDaysAgo: 12,
    attendanceDaysAgo: [0, 2, 4, 6],
    workouts: [
      { daysAgo: 1, durationMin: 48, title: 'Upper body strength' },
      { daysAgo: 4, durationMin: 52, title: 'Lower body strength' },
      { daysAgo: 7, durationMin: 45, title: 'Full body strength' },
    ],
  },
  {
    name: 'Demo Member Jamie',
    email: 'demo.jamie@fitnexa.ai',
    active: true,
    profile: {
      age: 34,
      heightCm: 165,
      currentWeightKg: 68,
      targetWeightKg: 64,
      experience: 'Beginner',
      primaryGoal: 'general fitness',
      workoutFrequency: '3 days/week',
      preferredDuration: '30-45 min',
      equipment: 'Bodyweight, resistance bands',
      trainingLocation: 'Both',
      dietaryPreferences: 'Vegetarian',
      allergies: 'None',
    },
    planName: 'Elite Performance',
    membershipStatus: 'active',
    membershipStartDaysAgo: 5,
    attendanceDaysAgo: [1, 3, 5],
    workouts: [
      { daysAgo: 2, durationMin: 35, title: 'Mobility and conditioning' },
      { daysAgo: 5, durationMin: 40, title: 'Full body foundations' },
    ],
  },
  {
    name: 'Demo Member Taylor',
    email: 'demo.taylor@fitnexa.ai',
    active: false,
    profile: {
      age: 42,
      heightCm: 172,
      currentWeightKg: 86,
      targetWeightKg: 80,
      experience: 'Beginner',
      primaryGoal: 'endurance',
      workoutFrequency: '1-2 days/week',
      preferredDuration: '20-30 min',
      equipment: 'None',
      trainingLocation: 'Home',
      dietaryPreferences: 'No preference',
      allergies: 'None',
    },
    planName: 'Core Membership',
    membershipStatus: 'expired',
    membershipStartDaysAgo: 75,
    attendanceDaysAgo: [9],
    workouts: [{ daysAgo: 12, durationMin: 28, title: 'Cardio and mobility' }],
  },
]

async function getOrCreateMember(fixture, passwordHash) {
  const existing = await prisma.user.findUnique({
    where: { email: fixture.email },
    include: { fitnessProfile: true },
  })
  if (existing && existing.role !== 'member') {
    throw new Error(`Reserved demo email ${fixture.email} belongs to a non-member account; refusing to modify it.`)
  }
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        passwordHash,
        isActive: fixture.active,
        fitnessProfile: {
          upsert: {
            create: fixture.profile,
            update: fixture.profile,
          },
        },
      },
    })
    return existing
  }
  return prisma.user.create({
    data: {
      name: fixture.name,
      email: fixture.email,
      passwordHash,
      role: 'member',
      isActive: fixture.active,
      fitnessProfile: { create: fixture.profile },
    },
  })
}

async function seedTrainer(trainer) {
  return prisma.trainer.upsert({
    where: { email: trainer.email },
    create: trainer,
    update: { name: trainer.name, specialty: trainer.specialty, bio: trainer.bio, status: 'active' },
  })
}

async function seedMemberRecords(member, fixture, plans, exercises) {
  const plan = plans.get(fixture.planName)
  if (!plan) throw new Error(`Membership plan "${fixture.planName}" is missing from the catalog.`)

  const existingMembership = await prisma.membership.findFirst({
    where: { userId: member.id, planId: plan.id, status: fixture.membershipStatus },
  })
  if (!existingMembership) {
    const startDate = daysAgo(fixture.membershipStartDaysAgo)
    const expiryDate = new Date(startDate)
    expiryDate.setDate(expiryDate.getDate() + plan.durationDays)
    await prisma.membership.create({
      data: {
        userId: member.id,
        planId: plan.id,
        startDate,
        expiryDate: fixture.membershipStatus === 'expired' ? daysAgo(5) : expiryDate,
        status: fixture.membershipStatus,
      },
    })
  }

  for (const [index, attendanceDay] of fixture.attendanceDaysAgo.entries()) {
    const checkInAt = daysAgo(attendanceDay)
    const startOfDay = new Date(checkInAt)
    startOfDay.setHours(0, 0, 0, 0)
    const nextDay = new Date(startOfDay)
    nextDay.setDate(nextDay.getDate() + 1)
    const existing = await prisma.attendance.findFirst({
      where: { userId: member.id, location: 'FitNexa demo studio', checkInAt: { gte: startOfDay, lt: nextDay } },
    })
    if (!existing) {
      const checkedIn = new Date(checkInAt)
      checkedIn.setHours(8 + (index % 4), 15, 0, 0)
      await prisma.attendance.create({
        data: {
          userId: member.id,
          location: 'FitNexa demo studio',
          checkInAt: checkedIn,
          checkOutAt: new Date(checkedIn.getTime() + 55 * 60 * 1000),
        },
      })
    }
  }

  const workoutPlanTitle = 'Demo: ' + fixture.profile.primaryGoal
  let workoutPlan = await prisma.workoutPlan.findFirst({
    where: { userId: member.id, title: workoutPlanTitle },
  })
  if (!workoutPlan) {
    workoutPlan = await prisma.workoutPlan.create({
      data: {
        userId: member.id,
        title: workoutPlanTitle,
        status: 'active',
        goal: fixture.profile.primaryGoal,
        weeklySchedule: fixture.profile.workoutFrequency,
      },
    })
    const exercise = exercises.get('Push-Up')
    if (exercise) {
      await prisma.workoutPlanExercise.create({
        data: {
          workoutPlanId: workoutPlan.id,
          exerciseId: exercise.id,
          day: 'Day 1',
          sets: 3,
          reps: 10,
          restSeconds: 60,
          notes: 'Demo plan exercise',
        },
      })
    }
  }

  for (const workout of fixture.workouts) {
    const completedAt = daysAgo(workout.daysAgo)
    const marker = `FitNexa demo seed: ${workout.title}`
    const existing = await prisma.workoutSession.findFirst({
      where: { userId: member.id, notes: marker },
    })
    if (!existing) {
      await prisma.workoutSession.create({
        data: {
          userId: member.id,
          planId: workoutPlan.id,
          status: 'completed',
          startedAt: new Date(completedAt.getTime() - workout.durationMin * 60 * 1000),
          completedAt,
          durationMin: workout.durationMin,
          notes: marker,
          sessionExercises: {
            create: [
              { exerciseName: 'Push-Up', setsCompleted: 3, repsCompleted: 10, completed: true },
              { exerciseName: 'Plank', setsCompleted: 3, repsCompleted: 30, completed: true },
            ],
          },
        },
      })
    }
  }

  for (const [index, weightKg] of [fixture.profile.currentWeightKg + 1, fixture.profile.currentWeightKg + 0.4, fixture.profile.currentWeightKg].entries()) {
    const date = daysAgo(14 - index * 7)
    const notes = `FitNexa demo progress ${index + 1}`
    const existing = await prisma.progressRecord.findFirst({ where: { userId: member.id, notes } })
    if (!existing) {
      await prisma.progressRecord.create({
        data: { userId: member.id, date, weightKg, bodyFatPct: 22 - index * 0.5, notes },
      })
    }
  }

  const foodLogExists = await prisma.foodLog.findFirst({
    where: { userId: member.id, name: 'Demo overnight oats' },
  })
  if (!foodLogExists) {
    await prisma.foodLog.create({
      data: {
        userId: member.id,
        name: 'Demo overnight oats',
        mealType: 'breakfast',
        servingSize: '1 bowl',
        calories: 320,
        protein: 18,
        carbs: 44,
        fats: 8,
        loggedAt: daysAgo(0),
      },
    })
  }

  const paymentFixtures = [
    { status: 'paid', amount: plan.price, daysAgo: 4 },
    ...(fixture.membershipStatus === 'active' ? [{ status: 'pending', amount: plan.price, daysAgo: 0 }] : []),
  ]
  for (const payment of paymentFixtures) {
    const existing = await prisma.paymentRecord.findFirst({
      where: { userId: member.id, status: payment.status, amount: payment.amount },
    })
    if (!existing) {
      await prisma.paymentRecord.create({
        data: {
          userId: member.id,
          status: payment.status,
          amount: payment.amount,
          dueDate: daysAgo(payment.daysAgo),
          paidAt: payment.status === 'paid' ? daysAgo(payment.daysAgo) : null,
        },
      })
    }
  }

  const reminder = await prisma.reminder.findFirst({
    where: { userId: member.id, title: 'Demo: weekly check-in' },
  })
  if (!reminder) {
    await prisma.reminder.create({
      data: {
        userId: member.id,
        title: 'Demo: weekly check-in',
        message: 'Review your training consistency and update your progress.',
        scheduledAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      },
    })
  }
}

async function main() {
  await prisma.$connect()
  await seedCatalog()

  const passwordHash = await bcrypt.hash(demoPassword, 12)
  const members = []
  for (const fixture of memberFixtures) {
    members.push(await getOrCreateMember(fixture, passwordHash))
  }

  const plans = new Map((await prisma.membershipPlan.findMany()).map((plan) => [plan.name, plan]))
  const exercises = new Map((await prisma.exercise.findMany()).map((exercise) => [exercise.name, exercise]))
  for (let index = 0; index < memberFixtures.length; index += 1) {
    await seedMemberRecords(members[index], memberFixtures[index], plans, exercises)
  }

  const trainers = await Promise.all([
    seedTrainer({
      name: 'Demo Trainer Morgan',
      email: 'demo.morgan.trainer@fitnexa.ai',
      specialty: 'Strength and conditioning',
      bio: 'Demo trainer profile for gym operations.',
      status: 'active',
    }),
    seedTrainer({
      name: 'Demo Trainer Casey',
      email: 'demo.casey.trainer@fitnexa.ai',
      specialty: 'Mobility and fitness foundations',
      bio: 'Demo trainer profile for gym operations.',
      status: 'active',
    }),
  ])
  for (let index = 0; index < trainers.length; index += 1) {
    const exists = await prisma.trainerAssignment.findFirst({
      where: { trainerId: trainers[index].id, memberId: members[index].id },
    })
    if (!exists) {
      await prisma.trainerAssignment.create({
        data: { trainerId: trainers[index].id, memberId: members[index].id, status: 'active' },
      })
    }
  }

  await prisma.workoutTemplate.upsert({
    where: { id: 'fitnexa-demo-template-strength' },
    create: {
      id: 'fitnexa-demo-template-strength',
      title: 'Demo: Strength foundations',
      description: 'A balanced starter template for strength and movement practice.',
      goal: 'strength improvement',
      weeklySchedule: '3 days/week',
    },
    update: {},
  })

  const admin = await prisma.user.findFirst({ where: { role: 'admin', isActive: true } })
  if (admin) {
    await prisma.gymNotification.upsert({
      where: { id: 'fitnexa-demo-notification' },
      create: {
        id: 'fitnexa-demo-notification',
        title: 'Demo: welcome to FitNexa',
        message: 'Demo announcement for the gym notification center.',
        createdById: admin.id,
      },
      update: { createdById: admin.id },
    })
  }

  console.log(JSON.stringify({
    seededMembers: memberFixtures.length,
    seededTrainers: trainers.length,
    demoMemberLogin: { email: memberFixtures[0].email, password: demoPassword },
    adminAccountProvisioned: Boolean(admin),
    repeatable: true,
  }, null, 2))
}

main()
  .catch((error) => {
    console.error('Unable to seed FitNexa demo data.')
    console.error(error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
