import { useApp } from '../../context/AppContext'
import { ADMIN_SECTIONS } from '../../constants/navigation'
import OverviewSection from './OverviewSection'
import MembersSection from './MembersSection'
import TrainersSection from './TrainersSection'
import MembershipsSection from './MembershipsSection'
import AttendanceSection from './AttendanceSection'
import PaymentsSection from './PaymentsSection'
import ExercisesSection from './ExercisesSection'
import TemplatesSection from './TemplatesSection'
import NotificationsSection from './NotificationsSection'
import AnalyticsSection from './AnalyticsSection'
import SettingsSection from './SettingsSection'

const SECTIONS = {
  Overview: OverviewSection,
  Members: MembersSection,
  Trainers: TrainersSection,
  Memberships: MembershipsSection,
  Attendance: AttendanceSection,
  Payments: PaymentsSection,
  Exercises: ExercisesSection,
  'Workout Templates': TemplatesSection,
  Notifications: NotificationsSection,
  Analytics: AnalyticsSection,
  Settings: SettingsSection,
}

export default function AdminWorkspace() {
  const { user, adminSection, setAdminSection } = useApp()

  if (user?.role !== 'admin') {
    return <div className="empty-state">Admin access is required for this view.</div>
  }

  const Section = SECTIONS[adminSection] || OverviewSection

  return (
    <>
      <nav className="admin-section-nav" aria-label="Administration sections">
        {ADMIN_SECTIONS.map((section) => <button key={section} className={adminSection === section ? 'admin-section-tab active' : 'admin-section-tab'} type="button" onClick={() => setAdminSection(section)}>{section}</button>)}
        <span className="live-sync-indicator"><i /> MongoDB Atlas reports · live refresh</span>
      </nav>
      <Section />
    </>
  )
}
