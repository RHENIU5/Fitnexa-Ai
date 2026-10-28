export function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    fitnessProfile: user.fitnessProfile || {},
  }
}

export function serializePlan(plan) {
  return {
    ...plan,
    exercises: (plan.planExercises || []).map(({ exercise, ...item }) => ({
      ...item,
      exercise: exercise?.name,
    })),
  }
}

export function serializeSession(session) {
  const { sessionExercises = [], ...item } = session
  return { ...item, exercises: sessionExercises }
}
