import { Shield, Users } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { MEMBER_NAVIGATION } from '../constants/navigation'
import DashboardPage from '../pages/member/DashboardPage'
import CoachPage from '../pages/member/CoachPage'
import WorkoutsPage from '../pages/member/WorkoutsPage'
import ExercisesPage from '../pages/member/ExercisesPage'
import NutritionPage from '../pages/member/NutritionPage'
import ProgressPage from '../pages/member/ProgressPage'
import MembershipPage from '../pages/member/MembershipPage'
import RemindersPage from '../pages/member/RemindersPage'
import ProfilePage from '../pages/member/ProfilePage'
import AdminWorkspace from '../pages/admin/AdminWorkspace'

const PAGES = {
  Dashboard: DashboardPage,
  'AI Coach': CoachPage,
  Workouts: WorkoutsPage,
  Exercises: ExercisesPage,
  Nutrition: NutritionPage,
  Progress: ProgressPage,
  Membership: MembershipPage,
  Reminders: RemindersPage,
  Profile: ProfilePage,
  Admin: AdminWorkspace,
}

export default function Workspace() {
  const { user, activeTab, error, notice, busy, dashboard, selectTab, openProfile } = useApp()
  const Page = PAGES[activeTab] || DashboardPage
  const sidebarItems = user.role === 'admin'
    ? [{ label: 'Admin', icon: Shield }]
    : [...MEMBER_NAVIGATION, { label: 'My Profile', icon: Users }]

  return (
    <section className="dashboard-shell" id="app-workspace">
      <aside className="sidebar-panel">
        <div className="sidebar-title">{user.role === 'admin' ? 'Admin portal' : 'Member portal'}</div>
        <div className="sidebar-nav">
          {sidebarItems.map(({ label, icon: Icon }) => <button type="button" className={activeTab === (label === 'My Profile' ? 'Profile' : label) ? 'sidebar-item active' : 'sidebar-item'} key={label} onClick={() => label === 'My Profile' ? openProfile() : selectTab(label)}><Icon size={16} /> {label}</button>)}
        </div>
      </aside>
      <div className="dashboard-main">
        <div className="dashboard-header"><div><div className="dashboard-kicker">{activeTab}</div><h3>{dashboard?.welcome || `Welcome, ${user.name}`}</h3></div><span className="status-pill">{user.role}</span></div>
        {error && <div className="feedback error" role="alert">{error}</div>}
        {notice && <div className="feedback success" role="status">{notice}</div>}
        {busy && dashboard && <div className="saving-indicator">Updating…</div>}
        {busy && !dashboard ? <div className="loading-state">Loading your fitness data…</div> : <Page />}
      </div>
    </section>
  )
}
