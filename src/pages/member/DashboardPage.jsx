import { Dumbbell, Flame, HeartPulse, Sparkles, Target, TimerReset } from 'lucide-react'
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
import { hasProfileNote } from '../../utils/profile'

export default function DashboardPage() {
  const {
    profileComplete, openProfile, dashboard, chartProgress, activeSession, completeWorkout,
    startWorkout, plans, busy, sessions, selectTab, profile,
  } = useApp()

  return (
    <>
      {!profileComplete && <button className="profile-prompt" type="button" onClick={openProfile}><span><strong>Make your dashboard personal</strong><small>Add your goals and training preferences to get more relevant suggestions.</small></span><span className="prompt-action">Set up profile →</span></button>}
      <div className="stat-grid">
        {[
          ['Completed workouts', dashboard?.totalCompletedWorkouts ?? 0, Dumbbell],
          ['Consistency streak', `${dashboard?.currentConsistencyStreak ?? 0} days`, Flame],
          ['Goal progress', `${dashboard?.goalCompletionProgress ?? 0}%`, Target],
          ['Current weight', `${dashboard?.currentWeight ?? '—'} kg`, HeartPulse],
        ].map(([label, value, Icon]) => <div className="stat-card" key={label}><Icon size={20} /><span>{label}</span><strong>{value}</strong></div>)}
      </div>
      <div className="analytics-grid">
        <section className="chart-card"><div className="card-head"><h4>Weight trend</h4><span>From saved measurements</span></div>{chartProgress.length > 0 ? <ResponsiveContainer width="100%" height={220}><AreaChart data={chartProgress}><CartesianGrid stroke="#293129" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" stroke="#A2AAA1" /><YAxis hide /><Tooltip /><Area type="monotone" dataKey="weight" stroke="#C6FF4D" fill="#C6FF4D" fillOpacity={0.12} /></AreaChart></ResponsiveContainer> : <div className="empty-state">Start logging measurements in Progress.</div>}</section>
        <section className="list-card"><div className="card-head"><h4>Today's workout</h4><TimerReset size={18} /></div><p className="helper-text">{dashboard?.todaysWorkout || 'Create a plan to see your workout here.'}</p><button className="primary-btn action-button" type="button" onClick={() => activeSession ? completeWorkout(activeSession.id) : startWorkout(plans[0]?.id)} disabled={busy || (!activeSession && plans.length === 0)}>{activeSession ? 'Complete workout' : 'Start workout'}</button></section>
      </div>
      <div className="bottom-panels">
        <section className="list-card"><h4>Recent workouts</h4>{sessions.slice(0, 4).map((session) => <div className="list-item" key={session.id}><div><strong>{session.status === 'completed' ? 'Training session' : 'In progress'}</strong><span>{session.completedAt ? new Date(session.completedAt).toLocaleDateString() : 'Today'}</span></div><em>{session.durationMin || '—'} min</em></div>)}{sessions.length === 0 && <div className="empty-state">Your completed sessions will show up here.</div>}</section>
        <section className="list-card"><div className="card-head"><h4>Coach recommendations</h4><button type="button" className="text-action" onClick={() => selectTab('AI Coach')}>Ask coach</button></div>{(dashboard?.aiCoachRecommendations || []).map((item) => <div className="coach-item" key={item}><Sparkles size={15} /><span>{item}</span></div>)}{hasProfileNote(profile.limitations) && <p className="safety-note compact">Your activity considerations are saved. Stop if an activity causes pain and ask a qualified professional for guidance.</p>}</section>
      </div>
    </>
  )
}
