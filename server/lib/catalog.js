import { prisma } from '../db.js'

export const exerciseCatalog = [
  {
    name: 'Barbell Squat',
    description: 'Compound lower-body strength movement.',
    instructions: 'Brace your core, lower with control, and drive through the floor.',
    primaryMuscle: 'Legs',
    secondaryMuscles: ['Core', 'Glutes'],
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    category: 'Legs',
    safetyNotes: 'Keep knees tracking over toes and maintain a comfortable range.',
  },
  {
    name: 'Push-Up',
    description: 'Bodyweight pressing movement for chest, shoulders, and triceps.',
    instructions: 'Keep your body straight, lower with control, then press up.',
    primaryMuscle: 'Chest',
    secondaryMuscles: ['Shoulders', 'Arms'],
    difficulty: 'Beginner',
    equipment: 'None',
    category: 'Chest',
    safetyNotes: 'Scale to an incline if needed and avoid letting hips sag.',
  },
  {
    name: 'Romanian Deadlift',
    description: 'Hip hinge exercise for the hamstrings and posterior chain.',
    instructions: 'Keep a slight knee bend, hinge at your hips, and maintain a flat back.',
    primaryMuscle: 'Hamstrings',
    secondaryMuscles: ['Glutes', 'Core'],
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    category: 'Legs',
    safetyNotes: 'Use a comfortable range and stop if your back rounds.',
  },
  {
    name: 'Burpee',
    description: 'Full-body conditioning exercise.',
    instructions: 'Move from a squat to a plank, return to standing, then jump if comfortable.',
    primaryMuscle: 'Full body',
    secondaryMuscles: ['Cardio', 'Core'],
    difficulty: 'Advanced',
    equipment: 'None',
    category: 'Cardio',
    safetyNotes: 'Step rather than jump if you need a lower-impact option.',
  },
  {
    name: 'Plank',
    description: 'Core stability exercise.',
    instructions: 'Brace your abs and hold a straight line from head to heels.',
    primaryMuscle: 'Core',
    secondaryMuscles: ['Back', 'Shoulders'],
    difficulty: 'Beginner',
    equipment: 'None',
    category: 'Core',
    safetyNotes: 'Stop if you feel back discomfort.',
  },
]

export const membershipCatalog = [
  { name: 'Core Membership', price: 39, durationDays: 30, description: 'Gym access and guided training sessions.' },
  { name: 'Elite Performance', price: 69, durationDays: 30, description: 'Premium coaching and recovery add-ons.' },
]

export const foodCatalog = [
  { name: 'Oats', category: 'Grains', caloriesPer100g: 389, proteinPer100g: 16.9, carbsPer100g: 66.3, fatsPer100g: 6.9, servingSize: '100 g', allergenInfo: 'May contain gluten' },
  { name: 'Greek yogurt', category: 'Dairy', caloriesPer100g: 59, proteinPer100g: 10.3, carbsPer100g: 3.6, fatsPer100g: 0.4, servingSize: '100 g', allergenInfo: 'Milk' },
  { name: 'Chicken breast', category: 'Protein', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatsPer100g: 3.6, servingSize: '100 g', allergenInfo: null },
]

export async function seedCatalog() {
  if (!(await prisma.exercise.count())) {
    await prisma.exercise.createMany({ data: exerciseCatalog })
  }
  if (!(await prisma.membershipPlan.count())) {
    await prisma.membershipPlan.createMany({ data: membershipCatalog })
  }
  if (!(await prisma.food.count())) {
    await prisma.food.createMany({ data: foodCatalog })
  }
}
