import { Send } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function CoachPage() {
  const { coachMessages, sendCoachMessage, chatText, setChatText, busy } = useApp()

  return (
    <div className="workspace-grid">
      <section className="list-card workspace-card">
        <div className="card-head"><h4>Talk to your coach</h4><span className="status-pill">Rule-based fallback</span></div>
        <p className="helper-text">Recommendations are clearly labeled and based on your current goal and training context.</p>
        <div className="chat-log" aria-live="polite">
          {coachMessages.length === 0 && <div className="empty-state">Ask about training, recovery, your schedule, or nutrition basics.</div>}
          {coachMessages.map((message, index) => <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}><strong>{message.role === 'user' ? 'You' : 'FitNexa Coach'}</strong><p>{message.content}</p>{message.label && <small>{message.label}</small>}</div>)}
        </div>
        <form className="chat-form" onSubmit={sendCoachMessage}>
          <input aria-label="Message the coach" value={chatText} onChange={(event) => setChatText(event.target.value)} placeholder="Ask your coach anything…" />
          <button className="primary-btn" disabled={busy || !chatText.trim()} type="submit"><Send size={16} /> Send</button>
        </form>
      </section>
      <section className="list-card workspace-card">
        <h4>Suggested questions</h4>
        {['How should I structure my week?', 'What can I do on a recovery day?', 'How can I progress my current plan?'].map((question) => <button className="suggestion-btn" key={question} onClick={() => setChatText(question)} type="button">{question}</button>)}
      </section>
    </div>
  )
}
