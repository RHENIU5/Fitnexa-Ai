import { Search } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function MembersSection() {
  const {
    createAdminMember, createMemberForm, setCreateMemberForm, busy, memberSearch, setMemberSearch,
    adminMembers, editingMemberId, setEditingMemberId, adminProfileDraft, setAdminProfileDraft,
    saveAdminMemberProfile, editAdminMember, setMemberStatus, deleteAdminMember,
  } = useApp()

  return (
    <>
      <form className="list-card workspace-card form-grid admin-create-form" onSubmit={createAdminMember}>
        <h4>Create member account</h4>
        <label className="field-control">Name<input required minLength="2" maxLength="100" value={createMemberForm.name} onChange={(event) => setCreateMemberForm({ ...createMemberForm, name: event.target.value })} /></label>
        <label className="field-control">Email<input required type="email" value={createMemberForm.email} onChange={(event) => setCreateMemberForm({ ...createMemberForm, email: event.target.value })} /></label>
        <label className="field-control">Initial password<input required type="password" minLength="8" maxLength="128" value={createMemberForm.password} onChange={(event) => setCreateMemberForm({ ...createMemberForm, password: event.target.value })} /></label>
        <button className="primary-btn" type="submit" disabled={busy}>Create member</button>
      </form>
      <div className="admin-toolbar"><label className="search-control"><Search size={18} /><input value={memberSearch} onChange={(event) => setMemberSearch(event.target.value)} placeholder="Search members by name or email" /></label><span>{adminMembers.length} member profiles · member edits sync live</span></div>
      <div className="admin-member-list">
        {adminMembers.filter((member) => `${member.name} ${member.email}`.toLowerCase().includes(memberSearch.toLowerCase())).map((member) => <article className="list-card workspace-card admin-member-card" key={member.id}>
          <div className="card-head"><div><h4>{member.name}</h4><span className="helper-text">{member.email}</span></div><span className={member.isActive ? 'status-pill' : 'status-pill inactive'}>{member.isActive ? 'Active' : 'Inactive'}</span></div>
          <div className="member-profile-summary"><span><small>Goal</small>{member.fitnessProfile?.primaryGoal || 'Not set'}</span><span><small>Experience</small>{member.fitnessProfile?.experience || 'Not set'}</span><span><small>Schedule</small>{member.fitnessProfile?.workoutFrequency || 'Not set'}</span><span><small>Workouts</small>{member.completedWorkouts}</span></div>
          {editingMemberId === member.id ? <form className="form-grid admin-edit-form" onSubmit={(event) => saveAdminMemberProfile(event, member.id)}>
            <label className="field-control">Name<input required minLength="2" maxLength="100" value={adminProfileDraft.name || ''} onChange={(event) => setAdminProfileDraft({ ...adminProfileDraft, name: event.target.value })} /></label>
            <label className="field-control">Email<input required type="email" value={adminProfileDraft.email || ''} onChange={(event) => setAdminProfileDraft({ ...adminProfileDraft, email: event.target.value })} /></label>
            <label className="field-control">Goal<select value={adminProfileDraft.primaryGoal || ''} onChange={(event) => setAdminProfileDraft({ ...adminProfileDraft, primaryGoal: event.target.value })}><option value="">Not set</option><option value="muscle building">Build muscle</option><option value="fat loss">Fat loss</option><option value="strength improvement">Strength</option><option value="endurance">Endurance</option><option value="general fitness">General fitness</option><option value="flexibility and mobility">Mobility</option></select></label>
            <label className="field-control">Experience<select value={adminProfileDraft.experience || ''} onChange={(event) => setAdminProfileDraft({ ...adminProfileDraft, experience: event.target.value })}><option value="">Not set</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
            <label className="field-control">Current weight (kg)<input type="number" min="25" max="350" step="0.1" value={adminProfileDraft.currentWeightKg ?? ''} onChange={(event) => setAdminProfileDraft({ ...adminProfileDraft, currentWeightKg: event.target.value })} /></label>
            <label className="field-control">Target weight (kg)<input type="number" min="25" max="350" step="0.1" value={adminProfileDraft.targetWeightKg ?? ''} onChange={(event) => setAdminProfileDraft({ ...adminProfileDraft, targetWeightKg: event.target.value })} /></label>
            <label className="field-control">Training days<input value={adminProfileDraft.workoutFrequency || ''} onChange={(event) => setAdminProfileDraft({ ...adminProfileDraft, workoutFrequency: event.target.value })} /></label>
            <label className="field-control">Session duration<input value={adminProfileDraft.preferredDuration || ''} onChange={(event) => setAdminProfileDraft({ ...adminProfileDraft, preferredDuration: event.target.value })} /></label>
            <label className="field-control">Location<input value={adminProfileDraft.trainingLocation || ''} onChange={(event) => setAdminProfileDraft({ ...adminProfileDraft, trainingLocation: event.target.value })} /></label>
            <label className="field-control">Equipment<input value={adminProfileDraft.equipment || ''} onChange={(event) => setAdminProfileDraft({ ...adminProfileDraft, equipment: event.target.value })} /></label>
            <label className="field-control">Food allergies<input value={adminProfileDraft.allergies || ''} onChange={(event) => setAdminProfileDraft({ ...adminProfileDraft, allergies: event.target.value })} /></label>
            <label className="field-control full-span">Exercise considerations<textarea rows="2" value={adminProfileDraft.limitations || ''} onChange={(event) => setAdminProfileDraft({ ...adminProfileDraft, limitations: event.target.value })} /></label>
            <div className="admin-form-actions"><button className="primary-btn small" type="submit" disabled={busy}>Save shared profile</button><button className="secondary-btn small" type="button" onClick={() => setEditingMemberId('')}>Cancel</button></div>
          </form> : <div className="admin-member-actions"><button type="button" className="secondary-btn small" onClick={() => editAdminMember(member)}>Edit member profile</button><button type="button" className="secondary-btn small" onClick={() => setMemberStatus(member, !member.isActive)} disabled={busy}>{member.isActive ? 'Deactivate account' : 'Reactivate account'}</button><button type="button" className="secondary-btn small danger-action" onClick={() => deleteAdminMember(member)} disabled={busy}>Delete member</button></div>}
        </article>)}
        {adminMembers.length === 0 && <div className="empty-state">No members have registered yet.</div>}
      </div>
    </>
  )
}
