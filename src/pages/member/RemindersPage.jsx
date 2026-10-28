import { Bell } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function RemindersPage() {
  const { saveReminder, reminderForm, setReminderForm, busy, memberReminders } = useApp()

  return (
    <div className="workspace-grid">
      <form className="list-card workspace-card form-stack" onSubmit={saveReminder}>
        <h4>Create a reminder</h4>
        <label className="field-control">Title<input required maxLength="120" value={reminderForm.title} onChange={(event) => setReminderForm({ ...reminderForm, title: event.target.value })} placeholder="Workout, meal prep…" /></label>
        <label className="field-control">Details<textarea required maxLength="1000" rows="3" value={reminderForm.message} onChange={(event) => setReminderForm({ ...reminderForm, message: event.target.value })} /></label>
        <label className="field-control">Date and time<input type="datetime-local" value={reminderForm.scheduledAt} onChange={(event) => setReminderForm({ ...reminderForm, scheduledAt: event.target.value })} /></label>
        <button className="primary-btn" type="submit" disabled={busy}>Save reminder</button>
      </form>
      <section className="list-card workspace-card"><div className="card-head"><h4>Your reminders</h4><Bell size={18} /></div>
        {memberReminders.map((reminder) => <div className="list-item" key={reminder.id}><div><strong>{reminder.title}</strong><span>{reminder.message}</span></div><em>{new Date(reminder.scheduledAt).toLocaleString()}</em></div>)}
        {memberReminders.length === 0 && <div className="empty-state">Your personal reminders and gym announcements appear here.</div>}
      </section>
    </div>
  )
}
