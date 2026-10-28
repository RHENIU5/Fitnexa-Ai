import { LogOut } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function TopBar() {
  const { user, signOut, selectTab } = useApp()

  return (
    <header className="topbar">
      <button className="brand-wrap brand-button" type="button" onClick={() => selectTab('Dashboard')}>
        <span className="brand-mark">F</span><span><span className="brand-name">FitNexa AI</span><span className="brand-tag">Your Body. Your Goals. Your AI.</span></span>
      </button>
      <div className="nav-actions">
        {user ? <><span className="signed-in-user">{user.name}</span><button className="secondary-btn" type="button" onClick={signOut}><LogOut size={15} /> Sign out</button></> : <a className="nav-link-btn" href="#account">Sign In</a>}
        <button className="primary-btn" type="button" onClick={() => user ? selectTab(user.role === 'admin' ? 'Admin' : 'Workouts') : document.getElementById('account')?.scrollIntoView({ behavior: 'smooth' })}>{user ? user.role === 'admin' ? 'Manage gym' : 'Start training' : 'Get Started'}</button>
      </div>
    </header>
  )
}
