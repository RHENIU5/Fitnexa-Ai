import { useApp } from '../../context/AppContext'

export default function TemplatesSection() {
  const {
    saveWorkoutTemplate, editingTemplateId, setEditingTemplateId, templateForm, setTemplateForm,
    busy, adminTemplates, removeWorkoutTemplate,
  } = useApp()

  return (
    <>
      <form className="list-card workspace-card form-grid admin-create-form" onSubmit={saveWorkoutTemplate}>
        <h4>{editingTemplateId ? 'Edit workout template' : 'Create workout template'}</h4>
        <label className="field-control">Title<input required maxLength="120" value={templateForm.title} onChange={(event) => setTemplateForm({ ...templateForm, title: event.target.value })} /></label>
        <label className="field-control">Goal<input value={templateForm.goal} onChange={(event) => setTemplateForm({ ...templateForm, goal: event.target.value })} placeholder="Strength, endurance…" /></label>
        <label className="field-control">Weekly schedule<input value={templateForm.weeklySchedule} onChange={(event) => setTemplateForm({ ...templateForm, weeklySchedule: event.target.value })} placeholder="Mon, Wed, Fri" /></label>
        <label className="field-control full-span">Description<textarea rows="3" value={templateForm.description} onChange={(event) => setTemplateForm({ ...templateForm, description: event.target.value })} /></label>
        <div className="admin-form-actions"><button className="primary-btn" type="submit" disabled={busy}>{editingTemplateId ? 'Save template' : 'Create template'}</button>{editingTemplateId && <button className="secondary-btn" type="button" onClick={() => { setEditingTemplateId(''); setTemplateForm({ title: '', description: '', goal: '', weeklySchedule: '' }) }}>Cancel</button>}</div>
      </form>
      <div className="admin-member-list">{adminTemplates.map((template) => <article className="list-card workspace-card admin-template-card" key={template.id}>
        <div className="card-head"><div><h4>{template.title}</h4><span className="helper-text">{template.goal || 'General fitness'} · {template.weeklySchedule || 'Schedule not set'}</span></div><span className="status-pill">Template</span></div>
        <p>{template.description || 'No description provided.'}</p>
        <div className="admin-record-actions"><button className="secondary-btn small" type="button" onClick={() => { setEditingTemplateId(template.id); setTemplateForm({ title: template.title, description: template.description || '', goal: template.goal || '', weeklySchedule: template.weeklySchedule || '' }) }}>Edit</button><button className="secondary-btn small danger-action" type="button" onClick={() => removeWorkoutTemplate(template)} disabled={busy}>Delete</button></div>
      </article>)}
      {!adminTemplates.length && <div className="empty-state">No workout templates yet. Create one to establish repeatable training plans.</div>}</div>
    </>
  )
}
