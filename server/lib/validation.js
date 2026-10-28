const fitnessGoals = new Set([
  'muscle building',
  'fat loss',
  'strength improvement',
  'endurance',
  'general fitness',
  'flexibility and mobility',
])
const experienceLevels = new Set(['Beginner', 'Intermediate', 'Advanced'])
const profileFields = [
  'age',
  'heightCm',
  'currentWeightKg',
  'targetWeightKg',
  'experience',
  'primaryGoal',
  'workoutFrequency',
  'preferredDuration',
  'equipment',
  'trainingLocation',
  'dietaryPreferences',
  'allergies',
  'limitations',
]

export function validateProfile(input) {
  const numericRanges = {
    age: [13, 100],
    heightCm: [80, 250],
    currentWeightKg: [25, 350],
    targetWeightKg: [25, 350],
  }
  const data = {}
  for (const [field, [min, max]] of Object.entries(numericRanges)) {
    if (!Object.hasOwn(input, field) || input[field] == null || input[field] === '') continue
    const value = Number(input[field])
    if (!Number.isFinite(value) || value < min || value > max || (field === 'age' && !Number.isInteger(value))) {
      throw Object.assign(new Error(`${field} must be between ${min} and ${max}`), { status: 400 })
    }
    data[field] = value
  }
  if (input.primaryGoal && !fitnessGoals.has(input.primaryGoal)) {
    throw Object.assign(new Error('Choose a supported fitness goal'), { status: 400 })
  }
  if (input.experience && !experienceLevels.has(input.experience)) {
    throw Object.assign(new Error('Choose a supported experience level'), { status: 400 })
  }
  for (const field of profileFields) {
    if (!Object.hasOwn(input, field) || Object.hasOwn(data, field)) continue
    const value = input[field]
    if (value == null || value === '') {
      data[field] = null
    } else if (typeof value !== 'string' || value.length > 500) {
      throw Object.assign(new Error(`${field} must be text no longer than 500 characters`), { status: 400 })
    } else {
      data[field] = value.trim()
    }
  }
  return data
}
