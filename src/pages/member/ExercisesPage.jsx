import { Search } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function ExercisesPage() {
  const { search, setSearch, visibleExercises } = useApp()

  return (
    <>
      <label className="search-control"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search exercises or muscle groups" /></label>
      <div className="workspace-grid exercise-grid">
        {visibleExercises.map((exercise) => (
          <article className="list-card workspace-card exercise-card" key={exercise.id}>
            <div className="card-head"><h4>{exercise.name}</h4><span className="status-pill">{exercise.difficulty}</span></div>
            <p>{exercise.description}</p>
            <div className="exercise-meta">{exercise.category} · {exercise.equipment}</div>
            <details><summary>Instructions and safety</summary><p>{exercise.instructions}</p><small>{exercise.safetyNotes}</small></details>
          </article>
        ))}
        {visibleExercises.length === 0 && <div className="empty-state">No exercises match that search.</div>}
      </div>
    </>
  )
}
