import { useApp } from '../../context/AppContext'

export default function PaymentsSection() {
  const { adminPayments, changePaymentStatus } = useApp()

  return (
    <>
      <div className="feedback">Payment records are administrative records only. Updating a status does not charge a customer.</div>
      <section className="list-card workspace-card"><div className="card-head"><h4>Payment register</h4><span>${adminPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0).toFixed(2)} recorded</span></div>{adminPayments.map((payment) => <div className="list-item admin-membership-row" key={payment.id}><div><strong>{payment.memberName} · ${Number(payment.amount).toFixed(2)}</strong><span>Due {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : 'Not set'}</span></div><select aria-label={`Payment status for ${payment.id}`} value={payment.status} onChange={(event) => changePaymentStatus(payment, event.target.value)}><option>pending</option><option>paid</option><option>overdue</option><option>cancelled</option></select></div>)}{adminPayments.length === 0 && <div className="empty-state">No payment records yet.</div>}</section>
    </>
  )
}
