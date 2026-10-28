import {
  Activity,
  BarChart3,
  Bell,
  CheckCircle2,
  Dumbbell,
  Search,
  Sparkles,
  Utensils,
} from 'lucide-react'

export const MEMBER_NAVIGATION = [
  { label: 'Dashboard', icon: Activity },
  { label: 'AI Coach', icon: Sparkles },
  { label: 'Workouts', icon: Dumbbell },
  { label: 'Exercises', icon: Search },
  { label: 'Nutrition', icon: Utensils },
  { label: 'Progress', icon: BarChart3 },
  { label: 'Membership', icon: CheckCircle2 },
  { label: 'Reminders', icon: Bell },
]

export const ADMIN_SECTIONS = [
  'Overview',
  'Members',
  'Trainers',
  'Memberships',
  'Attendance',
  'Payments',
  'Exercises',
  'Workout Templates',
  'Notifications',
  'Analytics',
  'Settings',
]
