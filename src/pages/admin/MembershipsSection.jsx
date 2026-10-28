import { useApp } from '../../context/AppContext'

export default function MembershipsSection() {
  const {
    saveMembershipPlan, editingPlanId, setEditingPlanId, membershipPlanForm, setMembershipPlanForm,
    membershipPlans, busy, editMembershipPlan, archiveMembershipPlan, assignMembership, membershipForm,
    setMembershipForm, adminMembers, memberships, changeMembershipStatus,
  } = useApp()

  return (
    <>
      <form className="list-card workspace-card form-grid admin-create-form" onSubmit={saveMembershipPlan}>
        <h4>{editingPlanId ? 'Edit membership plan' : 'Create membership plan'}</h4>
        <label className="field-control">Plan name<input required value={membershipPlanForm.name} onChange={(event) => setMembershipPlanForm({ ...membershipPlanForm, name: event.target.value })} /></label>
        <label className="field-control">Price<input required type="number" min="0" step="0.01" value={membershipPlanForm.price} onChange={(event) => setMembershipPlanForm({ ...membershipPlanForm, price: event.target.value })} /></label>
        <label className="field-control">Duration (days)<input required type="number" min="1" step="1" value={membershipPlanForm.durationDays} onChange={(event) => setMembershipPlanForm({ ...membershipPlanForm, durationDays: event.target.value })} /></label>
        <label className="field-control full-span">Description<input value={membershipPlanForm.description} onChange={(event) => setMembershipPlanForm({ ...membershipPlanForm, description: event.target.value })} /></label>
        <div className="admin-form-actions"><button className="primary-btn" type="submit" disabled={busy}>{editingPlanId ? 'Save plan' : 'Create plan'}</button>{editingPlanId && <button className="secondary-btn" type="button" onClick={() => { setEditingPlanId(''); setMembershipPlanForm({ name: '', price: '', durationDays: '30', description: '' }) }}>Cancel</button>}</div>
      </form>
      <section className="list-card workspace-card"><div className="card-head"><h4>Membership plan catalog</h4><span>{membershipPlans.length} plans</span></div>
        {membershipPlans.map((plan) => <div className="list-item" key={plan.id}><div><strong>{plan.name} · ${Number(plan.price).toFixed(2)}</strong><span>{plan.durationDays} days · {plan.isActive === false ? 'Archived' : plan.description || 'No description'}</span></div><div className="admin-record-actions"><button type="button" className="secondary-btn small" onClick={() => editMembershipPlan(plan)} disabled={plan.isActive === false}>Edit</button>{plan.isActive !== false && <button type="button" className="secondary-btn small danger-action" onClick={() => archiveMembershipPlan(plan)} disabled={busy}>Archive</button>}</div></div>)}
        {!membershipPlans.length && <div className="empty-state">Create a plan to offer gym memberships.</div>}
      </section>
      <form className="list-card workspace-card form-grid admin-create-form" onSubmit={assignMembership}>
        <h4>Enroll a member</h4>
        <label className="field-control">Member<select required value={membershipForm.userId} onChange={(event) => setMembershipForm({ ...membershipForm, userId: event.target.value })}><option value="">Choose member</option>{adminMembers.filter((member) => member.isActive).map((member) => <option value={member.id} key={member.id}>{member.name}</option>)}</select></label>
        <label className="field-control">Plan<select required value={membershipForm.planId} onChange={(event) => setMembershipForm({ ...membershipForm, planId: event.target.value })}><option value="">Choose membership</option>{membershipPlans.filter((plan) => plan.isActive !== false).map((plan) => <option value={plan.id} key={plan.id}>{plan.name} · ${plan.price}</option>)}</select></label>
        <button className="primary-btn" type="submit" disabled={busy}>Assign membership</button>
        <p className="helper-text full-span">Creates an enrollment and pending payment record only. No payment is processed.</p>
      </form>
      <section className="list-card workspace-card"><div className="card-head"><h4>Membership register</h4><span>{memberships.length} records</span></div>{memberships.map((membership) => <div className="list-item admin-membership-row" key={membership.id}><div><strong>{adminMembers.find((member) => member.id === membership.userId)?.name || 'Admin account'} · {membershipPlans.find((plan) => plan.id === membership.planId)?.name || 'Membership'}</strong><span>{new Date(membership.startDate).toLocaleDateString()} – {new Date(membership.expiryDate).toLocaleDateString()}</span></div><select aria-label={`Membership status for ${membership.id}`} value={membership.status} onChange={(event) => changeMembershipStatus(membership, event.target.value)}><option>active</option><option>expired</option><option>cancelled</option></select></div>)}</section>
    </>
  )
}
