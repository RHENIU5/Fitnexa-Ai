export function getFitnessRecommendations(profile = {}, sessions = []) {
  const goal = String(profile.primaryGoal || '').toLowerCase()
  const frequency = profile.workoutFrequency || '3 days/week'
  const duration = profile.preferredDuration || '30-45 min'
  const recommendations = []
  if (!goal || !profile.experience) {
    recommendations.push('Complete your profile to get suggestions that match your goals and experience.')
  } else if (goal.includes('muscle')) {
    recommendations.push(`Build a repeatable strength routine ${String(frequency).toLowerCase()} and allow recovery between challenging sessions.`)
  } else if (goal.includes('fat loss')) {
    recommendations.push(`Combine sustainable strength training with regular movement on a schedule you can maintain (${frequency}).`)
  } else if (goal.includes('strength')) {
    recommendations.push(`Use controlled repetitions and gradual progression during your ${duration} sessions.`)
  } else if (goal.includes('endurance')) {
    recommendations.push('Build weekly activity gradually and mix comfortable efforts with recovery days.')
  } else if (goal.includes('flexibility')) {
    recommendations.push('Start with short, comfortable mobility sessions and increase range gradually.')
  } else {
    recommendations.push(`Aim for a balanced routine that fits your ${frequency} schedule.`)
  }
  if (profile.equipment || profile.trainingLocation) {
    recommendations.push(`Choose comfortable movements for ${profile.trainingLocation || 'your setting'}${profile.equipment ? ` using ${profile.equipment}` : ''}.`)
  }
  recommendations.push(sessions.length
    ? 'You have logged training. Keep building consistency before increasing workout difficulty.'
    : 'Start with an easy first session and note how you feel afterward.')
  if (profile.allergies && !['none', 'no', 'n/a'].includes(profile.allergies.toLowerCase())) {
    recommendations.push('Check ingredient labels against your saved food-allergy notes.')
  }
  if (profile.limitations && !['none', 'no', 'n/a'].includes(profile.limitations.toLowerCase())) {
    recommendations.push('Avoid movements that trigger your noted concerns and ask a qualified clinician for tailored advice.')
  }
  return recommendations.slice(0, 4)
}

export function getWorkoutStreak(sessions) {
  const completedDays = new Set(sessions
    .filter((session) => session.status === 'completed' && session.completedAt)
    .map((session) => new Date(session.completedAt).toISOString().slice(0, 10)))
  const day = new Date()
  day.setUTCHours(0, 0, 0, 0)
  if (!completedDays.has(day.toISOString().slice(0, 10))) day.setUTCDate(day.getUTCDate() - 1)
  let streak = 0
  while (completedDays.has(day.toISOString().slice(0, 10))) {
    streak += 1
    day.setUTCDate(day.getUTCDate() - 1)
  }
  return streak
}
