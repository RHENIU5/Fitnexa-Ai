import { Sparkles, Target } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function ProfilePage() {
  const { profileDraft, setProfileDraft, saveProfile, busy, dashboard } = useApp()

  return (
    <div className="profile-workspace">
      <section className="profile-intro">
        <span className="journey-badge"><Target size={16} /> Personal setup</span>
        <h4>Let’s make your plan fit your life.</h4>
        <p>Share only what you’re comfortable sharing. These details stay in your FitNexa profile and help tailor workout suggestions.</p>
      </section>
      <form className="profile-form" onSubmit={saveProfile}>
        <section className="profile-group">
          <div><h4>Your goals</h4><p>Tell us what you want to work toward.</p></div>
          <div className="form-grid">
            <label className="field-control">Primary goal<select required value={profileDraft.primaryGoal || ''} onChange={(event) => setProfileDraft({ ...profileDraft, primaryGoal: event.target.value })}><option value="">Choose a goal</option><option value="muscle building">Build muscle</option><option value="fat loss">Fat loss</option><option value="strength improvement">Get stronger</option><option value="endurance">Improve endurance</option><option value="general fitness">General fitness</option><option value="flexibility and mobility">Flexibility and mobility</option></select></label>
            <label className="field-control">Experience<select required value={profileDraft.experience || ''} onChange={(event) => setProfileDraft({ ...profileDraft, experience: event.target.value })}><option value="">Choose your level</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
            <label className="field-control">Age (optional)<input type="number" min="13" max="100" value={profileDraft.age ?? ''} onChange={(event) => setProfileDraft({ ...profileDraft, age: event.target.value })} placeholder="Years" /></label>
            <label className="field-control">Current weight (optional)<input type="number" min="25" max="350" step="0.1" value={profileDraft.currentWeightKg ?? ''} onChange={(event) => setProfileDraft({ ...profileDraft, currentWeightKg: event.target.value })} placeholder="kg" /></label>
            <label className="field-control">Target weight (optional)<input type="number" min="25" max="350" step="0.1" value={profileDraft.targetWeightKg ?? ''} onChange={(event) => setProfileDraft({ ...profileDraft, targetWeightKg: event.target.value })} placeholder="kg" /></label>
            <label className="field-control">Height (optional)<input type="number" min="80" max="250" step="0.1" value={profileDraft.heightCm ?? ''} onChange={(event) => setProfileDraft({ ...profileDraft, heightCm: event.target.value })} placeholder="cm" /></label>
          </div>
        </section>
        <section className="profile-group">
          <div><h4>Your routine</h4><p>We’ll keep recommendations realistic for your schedule and setup.</p></div>
          <div className="form-grid">
            <label className="field-control">Days you can train<select required value={profileDraft.workoutFrequency || ''} onChange={(event) => setProfileDraft({ ...profileDraft, workoutFrequency: event.target.value })}><option value="">Choose days per week</option><option>1-2 days/week</option><option>3 days/week</option><option>4 days/week</option><option>5 days/week</option><option>6+ days/week</option></select></label>
            <label className="field-control">Time per workout<select required value={profileDraft.preferredDuration || ''} onChange={(event) => setProfileDraft({ ...profileDraft, preferredDuration: event.target.value })}><option value="">Choose a duration</option><option>20-30 min</option><option>30-45 min</option><option>45-60 min</option><option>60+ min</option></select></label>
            <label className="field-control">Training location<select required value={profileDraft.trainingLocation || ''} onChange={(event) => setProfileDraft({ ...profileDraft, trainingLocation: event.target.value })}><option value="">Choose your setup</option><option>Home</option><option>Gym</option><option>Both</option></select></label>
            <label className="field-control">Available equipment<input value={profileDraft.equipment || ''} onChange={(event) => setProfileDraft({ ...profileDraft, equipment: event.target.value })} placeholder="e.g. bodyweight, dumbbells" /></label>
          </div>
        </section>
        <section className="profile-group">
          <div><h4>Helpful context</h4><p>Optional information can help us avoid unsuitable general suggestions.</p></div>
          <div className="form-grid">
            <label className="field-control">Dietary preferences<input value={profileDraft.dietaryPreferences || ''} onChange={(event) => setProfileDraft({ ...profileDraft, dietaryPreferences: event.target.value })} placeholder="e.g. vegetarian" /></label>
            <label className="field-control">Food allergies<input value={profileDraft.allergies || ''} onChange={(event) => setProfileDraft({ ...profileDraft, allergies: event.target.value })} placeholder="Optional" /></label>
            <label className="field-control full-span">Exercise limitations or considerations<textarea rows="3" value={profileDraft.limitations || ''} onChange={(event) => setProfileDraft({ ...profileDraft, limitations: event.target.value })} placeholder="For example: movements you prefer to avoid. Do not include information you do not want stored." /></label>
          </div>
          <p className="safety-note">FitNexa provides general fitness guidance, not medical care. If you have an injury, health condition, pain, or uncertainty about exercise, check with a qualified healthcare professional before changing activity.</p>
        </section>
        <div className="profile-submit"><button className="primary-btn" disabled={busy} type="submit">{busy ? 'Saving…' : 'Save my profile'}</button><span>Update anytime from My Profile.</span></div>
      </form>
      <section className="suggestion-panel">
        <div><Sparkles size={18} /><h4>Your tailored starting points</h4></div>
        <ul>{dashboard?.aiCoachRecommendations?.map((suggestion) => <li key={suggestion}>{suggestion}</li>)}</ul>
        <p>Suggestions are generated from your saved preferences and activity, and are not medical or dietary prescriptions.</p>
      </section>
    </div>
  )
}
