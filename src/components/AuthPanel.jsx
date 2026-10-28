import { BarChart3, CheckCircle2, Dumbbell, Sparkles } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function AuthPanel() {
  const {
    authMode, setAuthMode, authPortal, setAuthPortal, authFields, setAuthFields, setError, submitAuth, busy,
  } = useApp()

  return (
    <>
      <div className="auth-card">
        <div className="portal-picker" role="tablist" aria-label="Choose a login portal">
          <button type="button" role="tab" aria-selected={authPortal === 'member'} className={authPortal === 'member' ? 'portal-option active' : 'portal-option'} onClick={() => { setAuthPortal('member'); setAuthMode('login'); setError('') }}>Member Login</button>
          <button type="button" role="tab" aria-selected={authPortal === 'admin'} className={authPortal === 'admin' ? 'portal-option active' : 'portal-option'} onClick={() => { setAuthPortal('admin'); setAuthMode('login'); setError('') }}>Admin Login</button>
        </div>
        {authPortal === 'member' && <div className="auth-tabs" aria-label="Member account options">
          <button type="button" className={authMode === 'login' ? 'auth-tab active' : 'auth-tab'} onClick={() => setAuthMode('login')}>Sign in</button>
          <button type="button" className={authMode === 'register' ? 'auth-tab active' : 'auth-tab'} onClick={() => setAuthMode('register')}>Create member account</button>
        </div>}
        <div className="auth-portal-intro">
          <strong>{authMode === 'register' ? 'Create your member account' : authPortal === 'admin' ? 'Administrator access' : 'Your personal fitness workspace'}</strong>
          <span>{authPortal === 'admin' ? 'Admin accounts are created through secure administrator setup.' : 'Plans, coaching, nutrition, progress, and gym access in one place.'}</span>
        </div>
        <form className="auth-form" onSubmit={submitAuth}>
          {authMode === 'register' && authPortal === 'member' && <div className="field-row"><label>Full name<input name="name" value={authFields.name} onChange={(event) => setAuthFields({ ...authFields, name: event.target.value })} required minLength="2" autoComplete="name" placeholder="Your name" /></label></div>}
          <div className="field-row"><label>Email<input name="email" value={authFields.email} onChange={(event) => setAuthFields({ ...authFields, email: event.target.value })} type="email" required autoComplete="email" placeholder="you@example.com" /></label></div>
          <div className="field-row"><label>Password<input name="password" value={authFields.password} onChange={(event) => setAuthFields({ ...authFields, password: event.target.value })} type="password" required minLength={authMode === 'login' ? 1 : 8} autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} placeholder={authMode === 'login' ? 'Your password' : 'At least 8 characters'} /></label></div>
          <button type="submit" className="primary-btn full" disabled={busy}>{busy ? 'Please wait…' : authMode === 'login' ? `Sign in to ${authPortal === 'admin' ? 'Admin' : 'Member'} Portal` : 'Create member account'}</button>
        </form>
        {authPortal === 'member' && <p className="helper-text">Registration always creates a member account. Need administrator access? Ask your gym administrator to provision your account.</p>}
      </div>
      <div className="journey-card"><div className="journey-badge"><CheckCircle2 size={18} /> Your fitness workspace</div><h3>More than buttons. Built for your training.</h3><ul><li><Dumbbell size={16} /> Create workout plans and record sessions</li><li><Sparkles size={16} /> Get clearly labeled coaching guidance</li><li><BarChart3 size={16} /> Log meals and track body progress</li></ul></div>
    </>
  )
}
