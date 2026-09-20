import { SEGMENTS } from '../data/segments'
import { ratingColor } from '../lib/ratingColor'
import { weekEnd } from '../lib/storage'

function formatWeekRange(weekStart) {
  const start = new Date(`${weekStart}T00:00:00`)
  const end = new Date(`${weekEnd(weekStart)}T00:00:00`)
  const startStr = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const endStr = end.toLocaleDateString(undefined, {
    month: start.getMonth() === end.getMonth() ? undefined : 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return `${startStr} – ${endStr}`
}

function formatDay(date) {
  const d = new Date(`${date}T00:00:00`)
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function Home({
  inProgress,
  thisWeekComplete,
  completedSessions,
  onStart,
  onResume,
  onOpenSession,
  onDeleteSession,
  todayEntryComplete,
  recentDailyEntries,
  onStartDaily,
  onOpenDaily,
  onDeleteDaily,
}) {
  return (
    <div className="stack">
      <div className="card stack">
        <h2>Tonight&rsquo;s check-in</h2>
        <p className="muted">
          What did you choose to do today? Were you satisfied with your choices? What are you
          choosing to do tomorrow?
        </p>
        <button className="primary-btn" onClick={onStartDaily}>
          {todayEntryComplete ? 'Review tonight’s check-in' : 'Start tonight’s check-in'}
        </button>
      </div>

      {recentDailyEntries.length > 0 && (
        <div className="stack">
          <h3 style={{ fontSize: '1rem' }}>Recent days</h3>
          <div className="card" style={{ padding: '4px 20px' }}>
            {recentDailyEntries.map((e) => (
              <button key={e.id} className="history-item" onClick={() => onOpenDaily(e)}>
                <span>{formatDay(e.date)}</span>
                {e.satisfaction != null ? (
                  <span
                    className="rating-badge"
                    style={{ background: ratingColor(e.satisfaction) }}
                    title="Satisfaction"
                  >
                    {e.satisfaction}
                  </span>
                ) : (
                  <span className="pill">In progress</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card stack">
        <h2>Weekly check-in</h2>
        <p className="muted">
          Rate {SEGMENTS.length} areas of your life from 1 (terrible) to 10 (terrific), then reflect
          on what went well, why you rated each the way you did, and what&rsquo;s next.
        </p>
        {inProgress ? (
          <button className="primary-btn" onClick={() => onResume(inProgress)}>
            Continue this week&rsquo;s check-in
          </button>
        ) : thisWeekComplete ? (
          <button className="primary-btn" onClick={onStart}>
            View this week&rsquo;s check-in
          </button>
        ) : (
          <button className="primary-btn" onClick={onStart}>
            Start this week&rsquo;s check-in
          </button>
        )}
      </div>

      <div className="stack">
        <h3 style={{ fontSize: '1rem' }}>Past check-ins</h3>
        {completedSessions.length === 0 ? (
          <p className="muted">Nothing here yet. Finish your first check-in and it will show up.</p>
        ) : (
          <div className="card" style={{ padding: '4px 20px' }}>
            {completedSessions.map((s) => {
              const values = Object.values(s.ratings)
              const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
              return (
                <button key={s.id} className="history-item" onClick={() => onOpenSession(s)}>
                  <span>
                    <strong>Week of {formatWeekRange(s.weekStart)}</strong>
                    <br />
                    <span className="muted">{values.length} of {SEGMENTS.length} areas rated</span>
                  </span>
                  <span
                    className="rating-badge"
                    style={{ background: ratingColor(avg) }}
                    title="Average rating"
                  >
                    {avg.toFixed(1)}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
