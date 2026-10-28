import { useApp } from '../../context/AppContext'

export default function NotificationsSection() {
  const {
    sendGymNotification, notificationForm, setNotificationForm, busy, adminNotifications, deleteGymNotification,
  } = useApp()

  return (
    <>
      <form className="list-card workspace-card form-stack" onSubmit={sendGymNotification}>
        <h4>Publish a gym announcement</h4>
        <label className="field-control">Title<input required maxLength="120" value={notificationForm.title} onChange={(event) => setNotificationForm({ ...notificationForm, title: event.target.value })} /></label>
        <label className="field-control">Message<textarea required maxLength="2000" rows="4" value={notificationForm.message} onChange={(event) => setNotificationForm({ ...notificationForm, message: event.target.value })} /></label>
        <button className="primary-btn" type="submit" disabled={busy}>Publish to member portal</button>
        <p className="helper-text">Announcements are stored in the database and shown in each member’s Reminders view.</p>
      </form>
      <section className="list-card workspace-card"><div className="card-head"><h4>Published announcements</h4><span>{adminNotifications.length} records</span></div>
        {adminNotifications.map((item) => <div className="list-item" key={item.id}><div><strong>{item.title}</strong><span>{item.message}</span><small className="helper-text">By {item.createdByName} · {new Date(item.createdAt).toLocaleString()}</small></div><button className="secondary-btn small danger-action" type="button" onClick={() => deleteGymNotification(item)} disabled={busy}>Remove</button></div>)}
        {!adminNotifications.length && <div className="empty-state">No announcements have been published.</div>}
      </section>
    </>
  )
}
