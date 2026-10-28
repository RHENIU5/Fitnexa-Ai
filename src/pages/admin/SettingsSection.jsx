import { Settings } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function SettingsSection() {
  const { saveSystemSettings, settingsDraft, setSettingsDraft, busy, adminSettings } = useApp()

  return (
    <>
      <form className="list-card workspace-card form-stack" onSubmit={saveSystemSettings}>
        <div className="card-head"><h4>Gym system settings</h4><Settings size={18} /></div>
        <label className="field-control">Gym name<input maxLength="100" value={settingsDraft.gymName || ''} onChange={(event) => setSettingsDraft({ ...settingsDraft, gymName: event.target.value })} placeholder="FitNexa AI" /></label>
        <label className="field-control">Timezone<input maxLength="100" value={settingsDraft.timezone || ''} onChange={(event) => setSettingsDraft({ ...settingsDraft, timezone: event.target.value })} placeholder="e.g. Asia/Kolkata" /></label>
        <label className="field-control">Contact email<input type="email" maxLength="254" value={settingsDraft.contactEmail || ''} onChange={(event) => setSettingsDraft({ ...settingsDraft, contactEmail: event.target.value })} /></label>
        <button className="primary-btn" type="submit" disabled={busy}>Save settings</button>
        <p className="helper-text">Settings are stored in MongoDB Atlas. Email delivery and payment processing require external services that are not configured.</p>
      </form>
      <section className="list-card workspace-card"><div className="card-head"><h4>Saved configuration</h4><span>{adminSettings.length} values</span></div>
        {adminSettings.map((setting) => <div className="list-item" key={setting.key}><div><strong>{setting.key}</strong><span>{setting.value}</span></div><em>{new Date(setting.updatedAt).toLocaleDateString()}</em></div>)}
        {!adminSettings.length && <div className="empty-state">No system settings have been saved.</div>}
      </section>
    </>
  )
}
