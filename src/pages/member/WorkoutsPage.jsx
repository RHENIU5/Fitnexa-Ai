import { useApp } from '../../context/AppContext'

export default function WorkoutsPage() {
  const {
    createPlan, workoutTitle, setWorkoutTitle, busy, plans, startWorkout, sessions, completeWorkout,
  } = useApp()

  return (
    <>
      <form className="inline-create-form" onSubmit={createPlan}>
        <label className="field-control">Plan name<input required minLength="3" maxLength="70" value={workoutTitle} onChange={(event) => setWorkoutTitle(event.target.value)} placeholder="e.g. Stronger every week" /></label>
        <button className="primary-btn" type="submit" disabled={busy}>Create plan</button>
      </form>
      <div className="workspace-grid">
        {plans.map((plan) => (
          <article className="list-card workspace-card" key={plan.id}>
            <div className="card-head"><h4>{plan.title}</h4><span className="status-pill">{plan.status || 'draft'}</span></div>
            <p className="helper-text">{plan.goal || 'Personal training plan'} · {plan.weeklySchedule || 'Flexible schedule'}</p>
            <button className="secondary-btn action-button" type="button" onClick={() => startWorkout(plan.id)} disabled={busy}>Start workout</button>
          </article>
        ))}
        {plans.length === 0 && <div className="empty-state">No saved plans yet. Create your first plan above.</div>}
      </div>
      <section className="list-card workspace-card">
        <div className="card-head"><h4>Workout history</h4><span>{sessions.length} sessions</span></div>
        {sessions.map((session) => (
          <div className="list-item" key={session.id}>
            <div><strong>{session.status === 'in_progress' ? 'Workout in progress' : 'Training session'}</strong><span>{session.completedAt ? new Date(session.completedAt).toLocaleString() : 'Started just now'}</span></div>
            {session.status === 'in_progress' ? <button className="primary-btn small" type="button" onClick={() => completeWorkout(session.id)} disabled={busy}>Complete</button> : <em>{session.durationMin || 0} min</em>}
          </div>
        ))}
        {sessions.length === 0 && <div className="empty-state">Completed workouts will appear here.</div>}
      </section>
    </>
  )
}
