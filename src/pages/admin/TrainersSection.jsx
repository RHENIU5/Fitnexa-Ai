import { useApp } from '../../context/AppContext'

export default function TrainersSection() {
  const {
    addTrainer, trainerForm, setTrainerForm, adminTrainers, toggleTrainer, deleteTrainer, busy,
    assignTrainer, trainerAssignmentForm, setTrainerAssignmentForm, adminMembers,
    adminTrainerAssignments, removeTrainerAssignment,
  } = useApp()

  return (
    <>
      <form className="list-card workspace-card form-grid admin-create-form" onSubmit={addTrainer}>
        <h4>Add trainer</h4>
        <label className="field-control">Name<input required value={trainerForm.name} onChange={(event) => setTrainerForm({ ...trainerForm, name: event.target.value })} /></label>
        <label className="field-control">Email<input required type="email" value={trainerForm.email} onChange={(event) => setTrainerForm({ ...trainerForm, email: event.target.value })} /></label>
        <label className="field-control">Specialty<input required value={trainerForm.specialty} onChange={(event) => setTrainerForm({ ...trainerForm, specialty: event.target.value })} placeholder="Strength, mobility…" /></label>
        <button className="primary-btn" type="submit" disabled={busy}>Add trainer</button>
      </form>
      <div className="admin-member-list">{adminTrainers.map((trainer) => <article className="list-card workspace-card admin-record-row" key={trainer.id}><div><strong>{trainer.name}</strong><span>{trainer.email} · {trainer.specialty}</span></div><span className="status-pill">{trainer.status}</span><div className="admin-record-actions"><button className="secondary-btn small" type="button" onClick={() => toggleTrainer(trainer)} disabled={busy}>{trainer.status === 'active' ? 'Deactivate' : 'Activate'}</button><button className="secondary-btn small danger-action" type="button" onClick={() => deleteTrainer(trainer)} disabled={busy}>Remove</button></div></article>)}</div>
      <form className="list-card workspace-card form-grid admin-create-form" onSubmit={assignTrainer}>
        <h4>Assign a trainer to a member</h4>
        <label className="field-control">Trainer<select required value={trainerAssignmentForm.trainerId} onChange={(event) => setTrainerAssignmentForm({ ...trainerAssignmentForm, trainerId: event.target.value })}><option value="">Choose trainer</option>{adminTrainers.filter((trainer) => trainer.status === 'active').map((trainer) => <option value={trainer.id} key={trainer.id}>{trainer.name} · {trainer.specialty}</option>)}</select></label>
        <label className="field-control">Member<select required value={trainerAssignmentForm.memberId} onChange={(event) => setTrainerAssignmentForm({ ...trainerAssignmentForm, memberId: event.target.value })}><option value="">Choose member</option>{adminMembers.filter((member) => member.isActive).map((member) => <option value={member.id} key={member.id}>{member.name}</option>)}</select></label>
        <button className="primary-btn" type="submit" disabled={busy}>Assign trainer</button>
      </form>
      <section className="list-card workspace-card"><div className="card-head"><h4>Trainer assignments</h4><span>{adminTrainerAssignments.length} records</span></div>
        {adminTrainerAssignments.map((assignment) => <div className="list-item" key={assignment.id}><div><strong>{assignment.member.name} · {assignment.trainer.name}</strong><span>{assignment.trainer.specialty} · assigned {new Date(assignment.assignmentDate).toLocaleDateString()}</span></div><button className="secondary-btn small danger-action" type="button" onClick={() => removeTrainerAssignment(assignment)} disabled={busy}>Remove</button></div>)}
        {!adminTrainerAssignments.length && <div className="empty-state">Assign a trainer to a member to track their coaching relationship.</div>}
      </section>
    </>
  )
}
