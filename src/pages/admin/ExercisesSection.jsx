import { useApp } from '../../context/AppContext'

export default function ExercisesSection() {
  const {
    saveAdminExercise, editingExerciseId, setEditingExerciseId, exerciseForm, setExerciseForm,
    busy, exercises, editAdminExercise, deleteAdminExercise,
  } = useApp()

  return (
    <>
      <form className="list-card workspace-card form-grid admin-create-form" onSubmit={saveAdminExercise}>
        <h4>{editingExerciseId ? 'Edit exercise' : 'Add exercise'}</h4>
        <label className="field-control">Name<input required value={exerciseForm.name} onChange={(event) => setExerciseForm({ ...exerciseForm, name: event.target.value })} /></label>
        <label className="field-control">Category<input required value={exerciseForm.category} onChange={(event) => setExerciseForm({ ...exerciseForm, category: event.target.value })} placeholder="Chest, legs, cardio…" /></label>
        <label className="field-control">Primary muscle<input required value={exerciseForm.primaryMuscle} onChange={(event) => setExerciseForm({ ...exerciseForm, primaryMuscle: event.target.value })} /></label>
        <label className="field-control">Difficulty<select value={exerciseForm.difficulty} onChange={(event) => setExerciseForm({ ...exerciseForm, difficulty: event.target.value })}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
        <label className="field-control">Equipment<input required value={exerciseForm.equipment} onChange={(event) => setExerciseForm({ ...exerciseForm, equipment: event.target.value })} /></label>
        <label className="field-control full-span">Description<input required value={exerciseForm.description} onChange={(event) => setExerciseForm({ ...exerciseForm, description: event.target.value })} /></label>
        <label className="field-control full-span">Instructions<textarea required rows="2" value={exerciseForm.instructions} onChange={(event) => setExerciseForm({ ...exerciseForm, instructions: event.target.value })} /></label>
        <label className="field-control full-span">Safety notes<textarea rows="2" value={exerciseForm.safetyNotes} onChange={(event) => setExerciseForm({ ...exerciseForm, safetyNotes: event.target.value })} /></label>
        <div className="admin-form-actions"><button className="primary-btn" type="submit" disabled={busy}>{editingExerciseId ? 'Save exercise' : 'Add exercise'}</button>{editingExerciseId && <button className="secondary-btn" type="button" onClick={() => { setEditingExerciseId(''); setExerciseForm({ name: '', description: '', instructions: '', primaryMuscle: '', difficulty: 'Beginner', equipment: 'None', category: '', safetyNotes: '' }) }}>Cancel edit</button>}</div>
      </form>
      <div className="admin-member-list">{exercises.map((exercise) => <article className="list-card workspace-card admin-record-row" key={exercise.id}><div><strong>{exercise.name}</strong><span>{exercise.category} · {exercise.primaryMuscle} · {exercise.difficulty}</span></div><button className="secondary-btn small" type="button" onClick={() => editAdminExercise(exercise)}>Edit</button><button className="secondary-btn small danger-action" type="button" onClick={() => deleteAdminExercise(exercise)} disabled={busy}>Delete</button></article>)}</div>
    </>
  )
}
