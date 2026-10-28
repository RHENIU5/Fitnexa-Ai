import {
  Activity,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  Dumbbell,
  TimerReset,
  Users,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useApp } from '../../context/AppContext'

export default function OverviewSection() {
  const { adminReport, adminMembers, setAdminSection } = useApp()

  return (
    <>
      <div className="stat-grid">
        {[
          ['Total members', adminReport?.overview.totalMembers ?? 0, Users],
          ['Active members', adminReport?.overview.activeMembers ?? 0, CheckCircle2],
          ['New this month', adminReport?.overview.newMembersThisMonth ?? 0, Activity],
          ['Visits today', adminReport?.overview.attendanceToday ?? 0, CalendarCheck],
          ['Workouts this month', adminReport?.overview.workoutsThisMonth ?? 0, Dumbbell],
          ['Active memberships', adminReport?.overview.activeMemberships ?? 0, CheckCircle2],
          ['Paid revenue', `$${(adminReport?.overview.paidRevenue ?? 0).toFixed(2)}`, BarChart3],
          ['Payments pending', `$${(adminReport?.overview.pendingRevenue ?? 0).toFixed(2)}`, TimerReset],
        ].map(([label, value, Icon]) => <div className="stat-card" key={label}><Icon size={20} /><span>{label}</span><strong>{value}</strong></div>)}
      </div>
      <div className="workspace-grid admin-overview-grid">
        <section className="chart-card workspace-card"><div className="card-head"><h4>Gym visits · last 7 days</h4><span>Attendance records</span></div>
          {(adminReport?.attendanceTrend || []).length ? <ResponsiveContainer width="100%" height={220}><AreaChart data={adminReport.attendanceTrend}><CartesianGrid stroke="#293129" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" stroke="#A2AAA1" /><YAxis allowDecimals={false} stroke="#A2AAA1" /><Tooltip /><Area type="monotone" dataKey="visits" stroke="#C6FF4D" fill="#C6FF4D" fillOpacity={0.12} /></AreaChart></ResponsiveContainer> : <div className="empty-state">Attendance records will appear here.</div>}
        </section>
        <section className="list-card workspace-card"><div className="card-head"><h4>Member goals</h4><button type="button" className="text-action" onClick={() => setAdminSection('Analytics')}>All analytics</button></div>
          {(adminReport?.goalBreakdown || []).map(({ goal, count }) => <div className="goal-report-row" key={goal}><div><span>{goal}</span><strong>{count}</strong></div><div className="goal-report-track"><i style={{ width: `${adminReport.overview.totalMembers ? (count / adminReport.overview.totalMembers) * 100 : 0}%` }} /></div></div>)}
          {!adminReport?.goalBreakdown?.length && <div className="empty-state">Member goal data will appear here.</div>}
        </section>
      </div>
      <div className="workspace-grid admin-overview-grid">
        <section className="list-card workspace-card"><div className="card-head"><h4>Top workout activity</h4><button type="button" className="text-action" onClick={() => setAdminSection('Members')}>Manage members</button></div>
          {adminMembers.slice(0, 5).map((member) => <div className="list-item" key={member.id}><div><strong>{member.name}</strong><span>{member.fitnessProfile?.primaryGoal || 'Goal not set'} · {member.attendanceCount} visits</span></div><em>{member.completedWorkouts} workouts</em></div>)}
          {adminMembers.length === 0 && <div className="empty-state">Member reports will appear after members join.</div>}
        </section>
        <section className="list-card workspace-card"><div className="card-head"><h4>Recent gym activity</h4><button type="button" className="text-action" onClick={() => setAdminSection('Attendance')}>Attendance</button></div>
          {(adminReport?.recentActivity || []).slice(0, 6).map((entry) => <div className="list-item" key={entry.id}><div><strong>{entry.memberName}</strong><span>{entry.description}</span></div><em>{entry.at ? new Date(entry.at).toLocaleDateString() : ''}</em></div>)}
          {!adminReport?.recentActivity?.length && <div className="empty-state">Recent member activity will appear here.</div>}
        </section>
      </div>
    </>
  )
}
