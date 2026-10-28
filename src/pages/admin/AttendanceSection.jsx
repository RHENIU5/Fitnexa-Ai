import { useApp } from '../../context/AppContext'

export default function AttendanceSection() {
  const { adminCheckIn, adminMembers, busy, adminAttendance, adminCheckOut } = useApp()

  return (
    <>
      <form className="inline-create-form" onSubmit={adminCheckIn}><label className="field-control">Record check-in for<select name="userId" required defaultValue=""><option value="" disabled>Choose active member</option>{adminMembers.filter((member) => member.isActive).map((member) => <option value={member.id} key={member.id}>{member.name}</option>)}</select></label><button className="primary-btn" type="submit" disabled={busy}>Check in member</button></form>
      <section className="list-card workspace-card"><div className="card-head"><h4>Attendance log</h4><span>{adminAttendance.length} visits</span></div>{[...adminAttendance].reverse().map((entry) => <div className="list-item" key={entry.id}><div><strong>{entry.memberName}</strong><span>{new Date(entry.checkInAt).toLocaleString()} · {entry.location}</span></div>{entry.checkOutAt ? <em>Out {new Date(entry.checkOutAt).toLocaleTimeString()}</em> : <button className="secondary-btn small" type="button" onClick={() => adminCheckOut(entry.id)} disabled={busy}>Check out</button>}</div>)}{adminAttendance.length === 0 && <div className="empty-state">No attendance has been recorded.</div>}</section>
    </>
  )
}
