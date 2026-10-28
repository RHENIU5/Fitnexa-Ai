import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useApp } from '../../context/AppContext'

export default function ProgressPage() {
  const { chartProgress, addProgressRecord, progressForm, setProgressForm, busy } = useApp()

  return (
    <div className="workspace-grid">
      <section className="chart-card workspace-card">
        <div className="card-head"><h4>Weight history</h4><span>Logged measurements</span></div>
        {chartProgress.length > 0 ? <ResponsiveContainer width="100%" height={280}><AreaChart data={chartProgress}><CartesianGrid stroke="#293129" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" stroke="#A2AAA1" /><YAxis stroke="#A2AAA1" domain={['dataMin - 2', 'dataMax + 2']} /><Tooltip /><Area type="monotone" dataKey="weight" stroke="#C6FF4D" fill="#C6FF4D" fillOpacity={0.12} /></AreaChart></ResponsiveContainer> : <div className="empty-state">Add a measurement to start your progress chart.</div>}
      </section>
      <form className="list-card workspace-card form-stack" onSubmit={addProgressRecord}>
        <h4>Record progress</h4>
        <label className="field-control">Weight (kg)<input required type="number" min="1" max="500" step="0.1" value={progressForm.weightKg} onChange={(event) => setProgressForm({ ...progressForm, weightKg: event.target.value })} /></label>
        <label className="field-control">Body fat % (optional)<input type="number" min="1" max="75" step="0.1" value={progressForm.bodyFatPct} onChange={(event) => setProgressForm({ ...progressForm, bodyFatPct: event.target.value })} /></label>
        <label className="field-control">Notes<input value={progressForm.notes} onChange={(event) => setProgressForm({ ...progressForm, notes: event.target.value })} /></label>
        <button className="primary-btn" type="submit" disabled={busy}>Save measurement</button>
      </form>
    </div>
  )
}
