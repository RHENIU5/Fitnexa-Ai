import { Utensils } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function NutritionPage() {
  const { mealTotals, addFoodLog, foodForm, setFoodForm, busy, foodLogs } = useApp()

  return (
    <>
      <div className="stat-grid nutrition-totals">
        <div className="stat-card"><Utensils size={20} /><span>Calories</span><strong>{mealTotals.calories} kcal</strong></div>
        <div className="stat-card"><span>Protein</span><strong>{mealTotals.protein} g</strong></div>
        <div className="stat-card"><span>Carbs</span><strong>{mealTotals.carbs} g</strong></div>
        <div className="stat-card"><span>Fats</span><strong>{mealTotals.fats} g</strong></div>
      </div>
      <form className="list-card workspace-card form-grid" onSubmit={addFoodLog}>
        <h4>Log a meal <span className="estimated-label">Nutrition values are user-entered estimates</span></h4>
        <label className="field-control">Meal name<input required value={foodForm.name} onChange={(event) => setFoodForm({ ...foodForm, name: event.target.value })} placeholder="e.g. Oatmeal with berries" /></label>
        <label className="field-control">Meal<select value={foodForm.mealType} onChange={(event) => setFoodForm({ ...foodForm, mealType: event.target.value })}><option>breakfast</option><option>lunch</option><option>dinner</option><option>snack</option></select></label>
        <label className="field-control">Serving<input required value={foodForm.servingSize} onChange={(event) => setFoodForm({ ...foodForm, servingSize: event.target.value })} /></label>
        {['calories', 'protein', 'carbs', 'fats'].map((key) => <label className="field-control" key={key}>{key[0].toUpperCase() + key.slice(1)}{key === 'calories' ? ' (kcal)' : ' (g)'}<input type="number" min="0" step="any" value={foodForm[key]} onChange={(event) => setFoodForm({ ...foodForm, [key]: event.target.value })} /></label>)}
        <button className="primary-btn" type="submit" disabled={busy}>Save meal</button>
      </form>
      <section className="list-card workspace-card"><h4>Food diary</h4>
        {foodLogs.map((meal) => <div className="list-item" key={meal.id}><div><strong>{meal.name}</strong><span>{meal.mealType} · {meal.servingSize}</span></div><em>{meal.calories} kcal</em></div>)}
        {foodLogs.length === 0 && <div className="empty-state">No meals logged. Add your first meal above.</div>}
      </section>
    </>
  )
}
