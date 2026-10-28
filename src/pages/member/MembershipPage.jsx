import { useState } from 'react'
import { useApp } from '../../context/AppContext'

export default function MembershipPage() {
  const {
    memberAttendance, checkIn, busy, checkOut, memberships, membershipPlans, enrollMembership, memberPayments,
  } = useApp()
  const [today] = useState(() => new Date().toDateString())

  return (
    <>
      <section className="list-card workspace-card member-attendance">
        <div className="card-head"><div><h4>Gym attendance</h4><span className="helper-text">Record a visit or close your current check-in.</span></div><button className="primary-btn small" type="button" onClick={checkIn} disabled={busy || memberAttendance.some((entry) => !entry.checkOutAt && new Date(entry.checkInAt).toDateString() === today)}>Check in</button></div>
        {memberAttendance.slice(-5).reverse().map((entry) => <div className="list-item" key={entry.id}><div><strong>{entry.location || 'Gym visit'}</strong><span>{new Date(entry.checkInAt).toLocaleString()}</span></div>{entry.checkOutAt ? <em>Checked out</em> : <button className="secondary-btn small" type="button" onClick={() => checkOut(entry.id)} disabled={busy}>Check out</button>}</div>)}
        {memberAttendance.length === 0 && <div className="empty-state">Your gym visits will show here.</div>}
      </section>
      <section className="list-card workspace-card"><div className="card-head"><h4>Your memberships</h4><span>Gym access</span></div>
        {memberships.map((membership) => <div className="list-item" key={membership.id}><div><strong>{membership.status} membership</strong><span>{new Date(membership.startDate).toLocaleDateString()} – {new Date(membership.expiryDate).toLocaleDateString()}</span></div><em>{membership.status}</em></div>)}
        {memberships.length === 0 && <div className="empty-state">No membership found for this account.</div>}
      </section>
      <section className="workspace-grid">
        {membershipPlans.map((plan) => <article className="list-card workspace-card" key={plan.id}><div className="card-head"><h4>{plan.name}</h4><span className="status-pill">${plan.price}/month</span></div><p>{plan.description}</p><p className="helper-text">{plan.durationDays} days · Payment processing is not connected.</p><button className="secondary-btn action-button" type="button" onClick={() => enrollMembership(plan.id)} disabled={busy || memberships.some((item) => item.status === 'active')}>{memberships.some((item) => item.status === 'active') ? 'Active membership exists' : 'Enroll'}</button></article>)}
      </section>
      <section className="list-card workspace-card"><div className="card-head"><h4>My payment records</h4><span>Read-only</span></div>
        {memberPayments.map((payment) => <div className="list-item" key={payment.id}><div><strong>${Number(payment.amount).toFixed(2)} · {payment.status}</strong><span>{payment.dueDate ? `Due ${new Date(payment.dueDate).toLocaleDateString()}` : 'No due date'}</span></div><em>{payment.paidAt ? `Paid ${new Date(payment.paidAt).toLocaleDateString()}` : 'No payment processed'}</em></div>)}
        {memberPayments.length === 0 && <div className="empty-state">No payment records yet.</div>}
      </section>
    </>
  )
}
