import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiRequest } from './api/client'
import { AppContext } from './context/AppContext'
import TopBar from './components/TopBar'
import HeroSection from './components/HeroSection'
import AuthPanel from './components/AuthPanel'
import Workspace from './components/Workspace'
import SiteFooter from './components/SiteFooter'
import './styles/app.css'

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('fitnexa-token') || '')
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [authMode, setAuthMode] = useState('login')
  const [authPortal, setAuthPortal] = useState('member')
  const [authFields, setAuthFields] = useState({ name: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [dashboard, setDashboard] = useState(null)
  const [plans, setPlans] = useState([])
  const [sessions, setSessions] = useState([])
  const [exercises, setExercises] = useState([])
  const [foodLogs, setFoodLogs] = useState([])
  const [progress, setProgress] = useState([])
  const [memberships, setMemberships] = useState([])
  const [membershipPlans, setMembershipPlans] = useState([])
  const [adminMembers, setAdminMembers] = useState([])
  const [adminTrainers, setAdminTrainers] = useState([])
  const [adminTrainerAssignments, setAdminTrainerAssignments] = useState([])
  const [adminAttendance, setAdminAttendance] = useState([])
  const [adminPayments, setAdminPayments] = useState([])
  const [adminReport, setAdminReport] = useState(null)
  const [adminTemplates, setAdminTemplates] = useState([])
  const [adminNotifications, setAdminNotifications] = useState([])
  const [adminSettings, setAdminSettings] = useState([])
  const [editingTemplateId, setEditingTemplateId] = useState('')
  const [memberAttendance, setMemberAttendance] = useState([])
  const [memberPayments, setMemberPayments] = useState([])
  const [memberReminders, setMemberReminders] = useState([])
  const [adminSection, setAdminSection] = useState('Overview')
  const [memberSearch, setMemberSearch] = useState('')
  const [editingMemberId, setEditingMemberId] = useState('')
  const [adminProfileDraft, setAdminProfileDraft] = useState({})
  const [trainerForm, setTrainerForm] = useState({ name: '', email: '', specialty: '' })
  const [trainerAssignmentForm, setTrainerAssignmentForm] = useState({ trainerId: '', memberId: '' })
  const [membershipForm, setMembershipForm] = useState({ userId: '', planId: '' })
  const [exerciseForm, setExerciseForm] = useState({ name: '', description: '', instructions: '', primaryMuscle: '', difficulty: 'Beginner', equipment: 'None', category: '', safetyNotes: '' })
  const [editingExerciseId, setEditingExerciseId] = useState('')
  const [search, setSearch] = useState('')
  const [coachMessages, setCoachMessages] = useState([])
  const [chatText, setChatText] = useState('')
  const [workoutTitle, setWorkoutTitle] = useState('')
  const [profileDraft, setProfileDraft] = useState({})
  const [foodForm, setFoodForm] = useState({ name: '', mealType: 'lunch', servingSize: '1 serving', calories: '', protein: '', carbs: '', fats: '' })
  const [progressForm, setProgressForm] = useState({ weightKg: '', bodyFatPct: '', notes: '' })
  const [templateForm, setTemplateForm] = useState({ title: '', description: '', goal: '', weeklySchedule: '' })
  const [notificationForm, setNotificationForm] = useState({ title: '', message: '' })
  const [settingsDraft, setSettingsDraft] = useState({ gymName: '', timezone: '', contactEmail: '' })
  const [reminderForm, setReminderForm] = useState({ title: '', message: '', scheduledAt: '' })
  const [membershipPlanForm, setMembershipPlanForm] = useState({ name: '', price: '', durationDays: '30', description: '' })
  const [editingPlanId, setEditingPlanId] = useState('')
  const [createMemberForm, setCreateMemberForm] = useState({ name: '', email: '', password: '' })

  const handleError = useCallback((exception) => {
    setError(exception.message || 'Something went wrong. Please try again.')
    setNotice('')
  }, [])

  const loadData = useCallback(async (currentToken, currentUser) => {
    if (!currentToken) return
    setBusy(true)
    setError('')
    try {
      if (currentUser?.role === 'admin') {
        const [report, trainerList, assignmentList, attendanceList, paymentList, membershipList, membershipPlanList, exerciseList, templateList, notificationList, settingList] = await Promise.all([
          apiRequest('/gym/admin/report', currentToken),
          apiRequest('/gym/admin/trainers', currentToken),
          apiRequest('/gym/admin/trainer-assignments', currentToken),
          apiRequest('/gym/admin/attendance', currentToken),
          apiRequest('/gym/admin/payments', currentToken),
          apiRequest('/gym/memberships', currentToken),
          apiRequest('/gym/admin/membership-plans', currentToken),
          apiRequest('/exercises', currentToken),
          apiRequest('/gym/admin/workout-templates', currentToken),
          apiRequest('/gym/admin/notifications', currentToken),
          apiRequest('/gym/admin/settings', currentToken),
        ])
        setAdminReport(report)
        setAdminMembers(report.members || [])
        setAdminTrainers(trainerList.items || [])
        setAdminTrainerAssignments(assignmentList.items || [])
        setAdminAttendance(attendanceList.items || [])
        setAdminPayments(paymentList.items || [])
        setMemberships(membershipList.items || [])
        setMembershipPlans(membershipPlanList.items || [])
        setExercises(exerciseList.items || [])
        setAdminTemplates(templateList.items || [])
        setAdminNotifications(notificationList.items || [])
        setAdminSettings(settingList.items || [])
        setSettingsDraft(Object.fromEntries((settingList.items || []).map(({ key, value }) => [key, value])))
        setDashboard({ welcome: `Gym operations, ${currentUser.name}` })
        setPlans([])
        setSessions([])
        setFoodLogs([])
        setProgress([])
        setMemberAttendance([])
        setMemberPayments([])
        setMemberReminders([])
        return
      }
      const [metrics, workoutPlans, workoutHistory, exerciseList, logs, records, memberData, membershipPlanData, ownAttendance, paymentData, reminderData] = await Promise.all([
        apiRequest('/dashboard/metrics', currentToken),
        apiRequest('/workouts/plans', currentToken),
        apiRequest('/workouts/history', currentToken),
        apiRequest('/exercises', currentToken),
        apiRequest('/nutrition/logs', currentToken),
        apiRequest('/progress', currentToken),
        apiRequest('/gym/memberships', currentToken),
        apiRequest('/gym/membership-plans', currentToken),
        apiRequest('/gym/attendance', currentToken),
        apiRequest('/gym/payments', currentToken),
        apiRequest('/reminders', currentToken),
      ])
      setDashboard(metrics)
      setPlans(workoutPlans.items || [])
      setSessions(workoutHistory.items || [])
      setExercises(exerciseList.items || [])
      setFoodLogs(logs.items || [])
      setProgress(records.items || [])
      setMemberships(memberData.items || [])
      setMembershipPlans(membershipPlanData.items || [])
      setAdminReport(null)
      setMemberAttendance(ownAttendance.items || [])
      setMemberPayments(paymentData.items || [])
      setMemberReminders(reminderData.items || [])
    } catch (exception) {
      handleError(exception)
    } finally {
      setBusy(false)
    }
  }, [handleError])

  const syncSharedProfile = useCallback(async () => {
    if (!token || !user) return
    try {
      if (user.role === 'admin') {
        const [report, trainerList, assignmentList, attendanceList, paymentList, membershipList, membershipPlanList, exerciseList, templateList, notificationList, settingList] = await Promise.all([
          apiRequest('/gym/admin/report', token),
          apiRequest('/gym/admin/trainers', token),
          apiRequest('/gym/admin/trainer-assignments', token),
          apiRequest('/gym/admin/attendance', token),
          apiRequest('/gym/admin/payments', token),
          apiRequest('/gym/memberships', token),
          apiRequest('/gym/admin/membership-plans', token),
          apiRequest('/exercises', token),
          apiRequest('/gym/admin/workout-templates', token),
          apiRequest('/gym/admin/notifications', token),
          apiRequest('/gym/admin/settings', token),
        ])
        setAdminReport(report)
        setAdminMembers(report.members || [])
        setAdminTrainers(trainerList.items || [])
        setAdminTrainerAssignments(assignmentList.items || [])
        setAdminAttendance(attendanceList.items || [])
        setAdminPayments(paymentList.items || [])
        setMemberships(membershipList.items || [])
        setMembershipPlans(membershipPlanList.items || [])
        setExercises(exerciseList.items || [])
        setAdminTemplates(templateList.items || [])
        setAdminNotifications(notificationList.items || [])
        setAdminSettings(settingList.items || [])
      } else {
        const [{ user: freshUser }, metrics, ownAttendance, ownMemberships, paymentData, reminderData] = await Promise.all([
          apiRequest('/auth/me', token),
          apiRequest('/dashboard/metrics', token),
          apiRequest('/gym/attendance', token),
          apiRequest('/gym/memberships', token),
          apiRequest('/gym/payments', token),
          apiRequest('/reminders', token),
        ])
        setUser((currentUser) => currentUser && JSON.stringify(currentUser.fitnessProfile) !== JSON.stringify(freshUser.fitnessProfile)
          ? { ...currentUser, fitnessProfile: freshUser.fitnessProfile }
          : currentUser)
        setDashboard(metrics)
        setMemberAttendance(ownAttendance.items || [])
        setMemberships(ownMemberships.items || [])
        setMemberPayments(paymentData.items || [])
        setMemberReminders(reminderData.items || [])
      }
    } catch (exception) {
      handleError(exception)
    }
  }, [handleError, token, user])

  useEffect(() => {
    if (!token || !user) return undefined
    const timer = window.setInterval(syncSharedProfile, 2500)
    return () => window.clearInterval(timer)
  }, [token, user, syncSharedProfile])

  useEffect(() => {
    if (!token) {
      return
    }
    let active = true
    apiRequest('/auth/me', token)
      .then(({ user: currentUser }) => {
        if (!active) return
        setUser(currentUser)
        setActiveTab(currentUser.role === 'admin' ? 'Admin' : 'Dashboard')
        loadData(token, currentUser)
      })
      .catch(() => {
        if (!active) return
        localStorage.removeItem('fitnexa-token')
        setToken('')
      })
    return () => { active = false }
  }, [token, loadData])

  const withAction = useCallback(async (action, successMessage) => {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const result = await action()
      if (successMessage) setNotice(successMessage)
      await loadData(token, user)
      return result
    } catch (exception) {
      handleError(exception)
      return null
    } finally {
      setBusy(false)
    }
  }, [handleError, loadData, token, user])

  async function submitAuth(event) {
    event.preventDefault()
    const body = authMode === 'login'
      ? { email: authFields.email, password: authFields.password, portal: authPortal }
      : authFields
    setBusy(true)
    setError('')
    try {
      const response = await apiRequest(`/auth/${authMode === 'login' ? 'login' : 'register'}`, '', {
        method: 'POST',
        body,
      })
      localStorage.setItem('fitnexa-token', response.token)
      setUser(response.user)
      setToken(response.token)
      setNotice(`You're signed in as ${response.user.name}.`)
      setAuthFields({ name: '', email: '', password: '' })
      setActiveTab(response.user.role === 'admin' ? 'Admin' : 'Dashboard')
      setAdminSection('Overview')
    } catch (exception) {
      handleError(exception)
    } finally {
      setBusy(false)
    }
  }

  function signOut() {
    localStorage.removeItem('fitnexa-token')
    setToken('')
    setUser(null)
    setDashboard(null)
    setAdminReport(null)
    setAdminMembers([])
    setAdminTrainers([])
    setAdminTrainerAssignments([])
    setAdminAttendance([])
    setAdminPayments([])
    setAdminTemplates([])
    setAdminNotifications([])
    setAdminSettings([])
    setMemberAttendance([])
    setNotice('You have signed out.')
    setActiveTab('Dashboard')
    setAuthPortal('member')
    setAuthMode('login')
  }

  async function startWorkout(planId) {
    const response = await withAction(
      () => apiRequest('/workouts/sessions/start', token, { method: 'POST', body: { planId } }),
      'Workout started. Finish it when you are done.',
    )
    if (response?.item) setActiveTab('Workouts')
  }

  async function completeWorkout(sessionId) {
    await withAction(
      () => apiRequest(`/workouts/sessions/${sessionId}/complete`, token, {
        method: 'PATCH',
        body: { durationMin: 45, notes: 'Completed in FitNexa' },
      }),
      'Workout completed and saved to your history.',
    )
  }

  async function createPlan(event) {
    event.preventDefault()
    const response = await withAction(
      () => apiRequest('/workouts/plans', token, {
        method: 'POST',
        body: { title: workoutTitle.trim(), goal: user?.fitnessProfile?.primaryGoal || 'General fitness', weeklySchedule: 'Flexible' },
      }),
      'Your workout plan was created.',
    )
    if (response) setWorkoutTitle('')
  }

  async function sendCoachMessage(event) {
    event.preventDefault()
    const message = chatText.trim()
    if (!message) return
    setError('')
    setCoachMessages((current) => [...current, { role: 'user', content: message }])
    setChatText('')
    const response = await withAction(
      () => apiRequest('/ai/chat', token, { method: 'POST', body: { message } }),
    )
    if (response?.message) setCoachMessages((current) => [...current, response.message])
  }

  async function addFoodLog(event) {
    event.preventDefault()
    const response = await withAction(
      () => apiRequest('/nutrition/logs', token, {
        method: 'POST',
        body: {
          ...foodForm,
          calories: Number(foodForm.calories || 0),
          protein: Number(foodForm.protein || 0),
          carbs: Number(foodForm.carbs || 0),
          fats: Number(foodForm.fats || 0),
        },
      }),
      'Meal saved to your nutrition log.',
    )
    if (response) setFoodForm({ name: '', mealType: 'lunch', servingSize: '1 serving', calories: '', protein: '', carbs: '', fats: '' })
  }

  async function addProgressRecord(event) {
    event.preventDefault()
    const response = await withAction(
      () => apiRequest('/progress', token, {
        method: 'POST',
        body: {
          ...progressForm,
          weightKg: Number(progressForm.weightKg),
          bodyFatPct: progressForm.bodyFatPct ? Number(progressForm.bodyFatPct) : undefined,
        },
      }),
      'Progress entry saved.',
    )
    if (response) setProgressForm({ weightKg: '', bodyFatPct: '', notes: '' })
  }

  function openProfile() {
    setProfileDraft({
      age: '',
      heightCm: '',
      currentWeightKg: '',
      targetWeightKg: '',
      experience: '',
      primaryGoal: '',
      workoutFrequency: '',
      preferredDuration: '',
      equipment: '',
      trainingLocation: '',
      dietaryPreferences: '',
      allergies: '',
      limitations: '',
      ...user?.fitnessProfile,
    })
    setError('')
    setActiveTab('Profile')
    document.getElementById('app-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function saveProfile(event) {
    event.preventDefault()
    const updated = await withAction(
      () => apiRequest('/profile', token, { method: 'PUT', body: profileDraft }),
      'Your profile is saved. Your suggestions now reflect these preferences.',
    )
    if (updated?.profile) {
      setUser((currentUser) => ({ ...currentUser, fitnessProfile: updated.profile }))
      setProfileDraft(updated.profile)
    }
  }

  async function enrollMembership(planId) {
    await withAction(
      () => apiRequest('/gym/memberships', token, { method: 'POST', body: { planId } }),
      'Membership activated. No payment was processed.',
    )
  }

  async function checkIn() {
    await withAction(
      () => apiRequest('/gym/attendance/check-in', token, { method: 'POST', body: { location: 'Main gym' } }),
      'Gym check-in recorded.',
    )
  }

  async function checkOut(attendanceId) {
    await withAction(
      () => apiRequest(`/gym/attendance/${attendanceId}/check-out`, token, { method: 'PATCH' }),
      'Gym check-out recorded.',
    )
  }

  async function saveAdminMemberProfile(event, memberId) {
    event.preventDefault()
    const response = await withAction(
      () => apiRequest(`/gym/admin/members/${memberId}/profile`, token, { method: 'PUT', body: adminProfileDraft }),
      'Member profile updated. The member app will sync this change automatically.',
    )
    if (response) setEditingMemberId('')
  }

  async function createAdminMember(event) {
    event.preventDefault()
    const response = await withAction(
      () => apiRequest('/gym/admin/members', token, { method: 'POST', body: createMemberForm }),
      'Member account created.',
    )
    if (response) setCreateMemberForm({ name: '', email: '', password: '' })
  }

  function editAdminMember(member) {
    setEditingMemberId(member.id)
    setAdminProfileDraft({ ...member.fitnessProfile, name: member.name, email: member.email })
  }

  async function setMemberStatus(member, isActive) {
    await withAction(
      () => apiRequest(`/gym/admin/members/${member.id}/status`, token, { method: 'PATCH', body: { isActive } }),
      `${member.name}’s account was ${isActive ? 'activated' : 'deactivated'}.`,
    )
  }

  async function deleteAdminMember(member) {
    if (!window.confirm(`Permanently remove ${member.name}'s account and personal training records?`)) return
    await withAction(
      () => apiRequest(`/gym/admin/members/${member.id}`, token, { method: 'DELETE' }),
      `${member.name}'s account and associated private records were removed.`,
    )
  }

  async function addTrainer(event) {
    event.preventDefault()
    const response = await withAction(
      () => apiRequest('/gym/admin/trainers', token, { method: 'POST', body: trainerForm }),
      'Trainer profile created.',
    )
    if (response) setTrainerForm({ name: '', email: '', specialty: '' })
  }

  async function assignTrainer(event) {
    event.preventDefault()
    const response = await withAction(
      () => apiRequest('/gym/admin/trainer-assignments', token, { method: 'POST', body: trainerAssignmentForm }),
      'Trainer assignment created.',
    )
    if (response) setTrainerAssignmentForm({ trainerId: '', memberId: '' })
  }

  async function removeTrainerAssignment(assignment) {
    await withAction(
      () => apiRequest(`/gym/admin/trainer-assignments/${assignment.id}`, token, { method: 'DELETE' }),
      'Trainer assignment removed.',
    )
  }

  async function toggleTrainer(trainer) {
    const status = trainer.status === 'active' ? 'inactive' : 'active'
    await withAction(
      () => apiRequest(`/gym/admin/trainers/${trainer.id}`, token, { method: 'PATCH', body: { status } }),
      `${trainer.name} is now ${status}.`,
    )
  }

  async function deleteTrainer(trainer) {
    await withAction(
      () => apiRequest(`/gym/admin/trainers/${trainer.id}`, token, { method: 'DELETE' }),
      `${trainer.name} was removed from the trainer directory.`,
    )
  }

  async function saveAdminExercise(event) {
    event.preventDefault()
    const response = await withAction(
      () => apiRequest(editingExerciseId ? `/exercises/${editingExerciseId}` : '/exercises', token, {
        method: editingExerciseId ? 'PUT' : 'POST',
        body: exerciseForm,
      }),
      editingExerciseId ? 'Exercise updated.' : 'Exercise added to the library.',
    )
    if (response) {
      setExerciseForm({ name: '', description: '', instructions: '', primaryMuscle: '', difficulty: 'Beginner', equipment: 'None', category: '', safetyNotes: '' })
      setEditingExerciseId('')
    }
  }

  function editAdminExercise(exercise) {
    setExerciseForm({
      name: exercise.name,
      description: exercise.description,
      instructions: exercise.instructions,
      primaryMuscle: exercise.primaryMuscle,
      difficulty: exercise.difficulty,
      equipment: exercise.equipment,
      category: exercise.category,
      safetyNotes: exercise.safetyNotes || '',
    })
    setEditingExerciseId(exercise.id)
  }

  async function deleteAdminExercise(exercise) {
    const response = await withAction(
      () => apiRequest(`/exercises/${exercise.id}`, token, { method: 'DELETE' }),
      `${exercise.name} removed from the library.`,
    )
    if (response?.item?.id === editingExerciseId) {
      setEditingExerciseId('')
      setExerciseForm({ name: '', description: '', instructions: '', primaryMuscle: '', difficulty: 'Beginner', equipment: 'None', category: '', safetyNotes: '' })
    }
  }

  async function assignMembership(event) {
    event.preventDefault()
    const response = await withAction(
      () => apiRequest('/gym/admin/memberships', token, { method: 'POST', body: membershipForm }),
      'Membership and a pending payment record were created. No payment was processed.',
    )
    if (response) setMembershipForm({ userId: '', planId: '' })
  }

  async function saveMembershipPlan(event) {
    event.preventDefault()
    const response = await withAction(
      () => apiRequest(editingPlanId ? `/gym/admin/membership-plans/${editingPlanId}` : '/gym/admin/membership-plans', token, {
        method: editingPlanId ? 'PUT' : 'POST',
        body: { ...membershipPlanForm, price: Number(membershipPlanForm.price), durationDays: Number(membershipPlanForm.durationDays) },
      }),
      editingPlanId ? 'Membership plan updated.' : 'Membership plan created.',
    )
    if (response) {
      setMembershipPlanForm({ name: '', price: '', durationDays: '30', description: '' })
      setEditingPlanId('')
    }
  }

  function editMembershipPlan(plan) {
    setMembershipPlanForm({ name: plan.name, price: String(plan.price), durationDays: String(plan.durationDays), description: plan.description || '' })
    setEditingPlanId(plan.id)
  }

  async function archiveMembershipPlan(plan) {
    await withAction(
      () => apiRequest(`/gym/admin/membership-plans/${plan.id}`, token, { method: 'DELETE' }),
      `${plan.name} was archived and will no longer be offered.`,
    )
  }

  async function saveWorkoutTemplate(event) {
    event.preventDefault()
    const response = await withAction(
      () => apiRequest(editingTemplateId ? `/gym/admin/workout-templates/${editingTemplateId}` : '/gym/admin/workout-templates', token, {
        method: editingTemplateId ? 'PUT' : 'POST',
        body: templateForm,
      }),
      editingTemplateId ? 'Workout template updated.' : 'Workout template created.',
    )
    if (response) {
      setTemplateForm({ title: '', description: '', goal: '', weeklySchedule: '' })
      setEditingTemplateId('')
    }
  }

  async function removeWorkoutTemplate(template) {
    await withAction(
      () => apiRequest(`/gym/admin/workout-templates/${template.id}`, token, { method: 'DELETE' }),
      'Workout template deleted.',
    )
  }

  async function sendGymNotification(event) {
    event.preventDefault()
    const response = await withAction(
      () => apiRequest('/gym/admin/notifications', token, { method: 'POST', body: notificationForm }),
      'Gym-wide notification published.',
    )
    if (response) setNotificationForm({ title: '', message: '' })
  }

  async function deleteGymNotification(item) {
    await withAction(
      () => apiRequest(`/gym/admin/notifications/${item.id}`, token, { method: 'DELETE' }),
      'Gym announcement removed.',
    )
  }

  async function saveSystemSettings(event) {
    event.preventDefault()
    const response = await withAction(
      () => apiRequest('/gym/admin/settings', token, { method: 'PUT', body: { settings: settingsDraft } }),
      'System settings saved.',
    )
    if (response?.items) {
      setSettingsDraft(Object.fromEntries(response.items.map(({ key, value }) => [key, value])))
    }
  }

  async function saveReminder(event) {
    event.preventDefault()
    const response = await withAction(
      () => apiRequest('/reminders', token, {
        method: 'POST',
        body: { ...reminderForm, scheduledAt: reminderForm.scheduledAt || undefined },
      }),
      'Reminder saved.',
    )
    if (response) setReminderForm({ title: '', message: '', scheduledAt: '' })
  }

  async function changeMembershipStatus(membership, status) {
    await withAction(
      () => apiRequest(`/gym/admin/memberships/${membership.id}/status`, token, { method: 'PATCH', body: { status } }),
      'Membership status updated.',
    )
  }

  async function changePaymentStatus(payment, status) {
    await withAction(
      () => apiRequest(`/gym/admin/payments/${payment.id}/status`, token, { method: 'PATCH', body: { status } }),
      'Payment record status updated. No payment was processed.',
    )
  }

  async function adminCheckIn(event) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const userId = formData.get('userId')
    await withAction(
      () => apiRequest('/gym/admin/attendance/check-in', token, { method: 'POST', body: { userId } }),
      'Member check-in recorded.',
    )
    form.reset()
  }

  async function adminCheckOut(attendanceId) {
    await withAction(
      () => apiRequest(`/gym/admin/attendance/${attendanceId}/check-out`, token, { method: 'PATCH' }),
      'Member check-out recorded.',
    )
  }

  const visibleExercises = useMemo(() => exercises.filter((exercise) => (
    `${exercise.name} ${exercise.category} ${exercise.primaryMuscle}`.toLowerCase().includes(search.toLowerCase())
  )), [exercises, search])

  const activeSession = sessions.find((session) => session.status === 'in_progress')
  const mealTotals = foodLogs.reduce((totals, meal) => ({
    calories: totals.calories + Number(meal.calories || 0),
    protein: totals.protein + Number(meal.protein || 0),
    carbs: totals.carbs + Number(meal.carbs || 0),
    fats: totals.fats + Number(meal.fats || 0),
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 })
  const chartProgress = [...progress]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((record) => ({ date: new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), weight: Number(record.weightKg) }))
  const profile = user?.fitnessProfile || {}
  const profileComplete = Boolean(profile.primaryGoal && profile.experience && profile.workoutFrequency && profile.preferredDuration && profile.trainingLocation)

  function selectTab(tab) {
    if (user?.role === 'admin' && tab !== 'Admin') tab = 'Admin'
    if (user?.role === 'member' && tab === 'Admin') return
    setActiveTab(tab)
    setError('')
    document.getElementById('app-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const app = {
    user, busy, error, notice, activeTab, selectTab, openProfile,
    authMode, setAuthMode, authPortal, setAuthPortal, authFields, setAuthFields, setError, submitAuth, signOut,
    dashboard, plans, sessions, exercises, foodLogs, progress, memberships, membershipPlans,
    memberAttendance, memberPayments, memberReminders,
    adminSection, setAdminSection, adminReport, adminMembers, adminTrainers, adminTrainerAssignments,
    adminAttendance, adminPayments, adminTemplates, adminNotifications, adminSettings,
    memberSearch, setMemberSearch, editingMemberId, setEditingMemberId, adminProfileDraft, setAdminProfileDraft,
    trainerForm, setTrainerForm, trainerAssignmentForm, setTrainerAssignmentForm,
    membershipForm, setMembershipForm, membershipPlanForm, setMembershipPlanForm, editingPlanId, setEditingPlanId,
    exerciseForm, setExerciseForm, editingExerciseId, setEditingExerciseId,
    search, setSearch, visibleExercises,
    coachMessages, chatText, setChatText,
    workoutTitle, setWorkoutTitle,
    profileDraft, setProfileDraft, profile, profileComplete,
    foodForm, setFoodForm, mealTotals,
    progressForm, setProgressForm, chartProgress, activeSession,
    reminderForm, setReminderForm,
    templateForm, setTemplateForm, editingTemplateId, setEditingTemplateId,
    notificationForm, setNotificationForm,
    settingsDraft, setSettingsDraft,
    createMemberForm, setCreateMemberForm,
    startWorkout, completeWorkout, createPlan, sendCoachMessage, addFoodLog, addProgressRecord,
    saveProfile, enrollMembership, checkIn, checkOut,
    saveAdminMemberProfile, createAdminMember, editAdminMember, setMemberStatus, deleteAdminMember,
    addTrainer, assignTrainer, removeTrainerAssignment, toggleTrainer, deleteTrainer,
    saveAdminExercise, editAdminExercise, deleteAdminExercise,
    assignMembership, saveMembershipPlan, editMembershipPlan, archiveMembershipPlan,
    saveWorkoutTemplate, removeWorkoutTemplate,
    sendGymNotification, deleteGymNotification, saveSystemSettings, saveReminder,
    changeMembershipStatus, changePaymentStatus, adminCheckIn, adminCheckOut,
  }

  return (
    <AppContext.Provider value={app}>
      <div className="fitnexa-shell">
        <TopBar />
        <main>
          {!user && <HeroSection />}
          <section className={user ? 'auth-section workspace-section' : 'auth-section'} id="account">
            {user ? <Workspace /> : <AuthPanel />}
            {!user && error && <div className="feedback error" role="alert">{error}</div>}
            {notice && !user && <div className="feedback success" role="status">{notice}</div>}
          </section>
        </main>
        <SiteFooter />
      </div>
    </AppContext.Provider>
  )
}

export default App
