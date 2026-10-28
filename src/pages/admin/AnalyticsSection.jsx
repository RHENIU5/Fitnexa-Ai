import { BarChart3 } from 'lucide-react'
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

export default function AnalyticsSection() {
  const { adminReport } = useApp()

  return (
    <>
      <div className="stat-grid">
        {[
          ['Membership coverage', `${adminReport?.overview.membershipCoverage ?? 0}%`],
          ['Inactive members', adminReport?.overview.inactiveMembers ?? 0],
          ['Expired memberships', adminReport?.overview.expiredMemberships ?? 0],
          ['Paid payment records', adminReport?.overview.paidPaymentCount ?? 0],
          ['Pending payment records', adminReport?.overview.pendingPaymentCount ?? 0],
          ['Active trainers', adminReport?.overview.activeTrainers ?? 0],
        ].map(([label, value]) => <div className="stat-card" key={label}><BarChart3 size={20} /><span>{label}</span><strong>{value}</strong></div>)}
      </div>
      <div className="workspace-grid admin-overview-grid">
        <section className="chart-card workspace-card"><div className="card-head"><h4>Attendance trend</h4><span>Recorded check-ins, last 7 days</span></div>
          {(adminReport?.attendanceTrend || []).length ? <ResponsiveContainer width="100%" height={260}><AreaChart data={adminReport.attendanceTrend}><CartesianGrid stroke="#293129" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" stroke="#A2AAA1" /><YAxis allowDecimals={false} stroke="#A2AAA1" /><Tooltip /><Area type="monotone" dataKey="visits" stroke="#C6FF4D" fill="#C6FF4D" fillOpacity={0.12} /></AreaChart></ResponsiveContainer> : <div className="empty-state">No attendance data yet.</div>}
        </section>
        <section className="list-card workspace-card"><div className="card-head"><h4>Goal distribution</h4><span>From member profiles</span></div>
          {(adminReport?.goalBreakdown || []).map(({ goal, count }) => <div className="goal-report-row" key={goal}><div><span>{goal}</span><strong>{count}</strong></div><div className="goal-report-track"><i style={{ width: `${adminReport.overview.totalMembers ? (count / adminReport.overview.totalMembers) * 100 : 0}%` }} /></div></div>)}
          {!adminReport?.goalBreakdown?.length && <div className="empty-state">No profile goals have been recorded.</div>}
        </section>
      </div>
      <p className="helper-text">All figures are calculated from current MongoDB Atlas member, attendance, membership, workout, and payment records.</p>
    </>
  )
}
