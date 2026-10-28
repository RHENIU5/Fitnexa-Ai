import { Sparkles } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="hero-section" id="features">
      <div className="hero-copy">
        <div className="eyebrow">Premium fitness intelligence</div>
        <h1>Train Smarter. Become Stronger.</h1>
        <p>Your personal fitness intelligence platform. Get personalized guidance, track every milestone, and build a routine that works for you.</p>
        <div className="hero-actions">
          <button className="primary-btn large" type="button" onClick={() => document.getElementById('account')?.scrollIntoView({ behavior: 'smooth' })}>Start Your Fitness Journey</button>
          <button className="secondary-btn large" type="button" onClick={() => document.getElementById('account')?.scrollIntoView({ behavior: 'smooth' })}>Explore the Platform</button>
        </div>
        <div className="trust-row"><span>Personalized workouts</span><span>Progress tracking</span><span>Gym management</span></div>
      </div>
      <div className="hero-visual">
        <div className="floating-card top-card"><div className="mini-label">Your next step</div><div className="mini-score"><Sparkles size={28} /></div><div className="mini-meta">Sign in to unlock your fitness workspace</div></div>
        <div className="dashboard-preview"><div className="preview-header"><div><div className="preview-kicker">Made for your goals</div><h3>Train with purpose.</h3></div><span className="status-pill">FitNexa AI</span></div><div className="metric-blocks"><div><span>Plan</span><strong>Personal</strong></div><div><span>Progress</span><strong>Tracked</strong></div><div><span>Coach</span><strong>Ready</strong></div></div><p className="helper-text">Sign in to access your training plans, exercise library, nutrition log, and progress history.</p></div>
      </div>
    </section>
  )
}
