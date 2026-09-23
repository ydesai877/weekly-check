import { SEGMENTS } from '../data/segments'
import { ratingColor } from '../lib/ratingColor'
import { weekEnd } from '../lib/storage'

function formatWeekRange(weekStart) {
  const start = new Date(`${weekStart}T00:00:00`)
  const end = new Date(`${weekEnd(weekStart)}T00:00:00`)
  const startStr = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const endStr = end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
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
  onRedoSession,
  onClearSessions,
  todayEntryComplete,
  recentDailyEntries,
  onStartDaily,
  onOpenDaily,
  onDeleteDaily,
  onClearDaily,
}) {
  function handleDeleteDaily(e, entry) {
    e.stopPropagation()
    if (window.confirm(`Delete the check-in for ${formatDay(entry.date)}? This can't be undone.`)) {
      onDeleteDaily(entry)
    }
  }

  function handleDeleteSession(e, session) {
    e.stopPropagation()
    if (
      window.confirm(`Delete the week of ${formatWeekRange(session.weekStart)}? This can't be undone.`)
    ) {
      onDeleteSession(session)
    }
  }

  function handleRedoSession(e, session) {
    e.stopPropagation()
    if (
      window.confirm(
        `Redo the week of ${formatWeekRange(session.weekStart)}? Your existing answers stay in place until you save changes through to Finish.`
      )
    ) {
      onRedoSession(session)
    }
  }

  function handleClearSessions() {
    if (
      window.confirm(
        'Delete every saved weekly check-in? This removes all past weeks and cannot be undone.'
      )
    ) {
      onClearSessions()
    }
  }

  function handleClearDaily() {
    if (
      window.confirm('Delete every saved daily check-in? This removes all past days and cannot be undone.')
    ) {
      onClearDaily()
    }
  }

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
          <div className="top-bar" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '1rem' }}>Recent days</h3>
            <button className="delete-btn" onClick={handleClearDaily}>
              Delete all
            </button>
          </div>
          <div className="card" style={{ padding: '4px 20px' }}>
            {recentDailyEntries.map((e) => (
              <div
                key={e.id}
                className="history-item"
                role="button"
                tabIndex={0}
                onClick={() => onOpenDaily(e)}
                onKeyDown={(ev) => (ev.key === 'Enter' ? onOpenDaily(e) : null)}
              >
                <span className="history-item-main">{formatDay(e.date)}</span>
                <span className="history-item-actions">
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
                  <button className="delete-btn" onClick={(ev) => handleDeleteDaily(ev, e)}>
                    Delete
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card stack">
        <h2>Weekly check-in</h2>
        <p className="muted">
          Score {SEGMENTS.length} life domains from 1 (neglected) to 5 (optimized), then reflect on
          what went well, why you scored each the way you did, and what&rsquo;s next.
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
        <div className="top-bar" style={{ marginBottom: 0 }}>
          <h3 style={{ fontSize: '1rem' }}>Past check-ins</h3>
          {completedSessions.length > 0 && (
            <button className="delete-btn" onClick={handleClearSessions}>
              Delete all
            </button>
          )}
        </div>
        {completedSessions.length === 0 ? (
          <p className="muted">Nothing here yet. Finish your first check-in and it will show up.</p>
        ) : (
          <div className="card" style={{ padding: '4px 20px' }}>
            {completedSessions.map((s) => {
              const values = Object.values(s.ratings)
              const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
              return (
                <div
                  key={s.id}
                  className="history-item"
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenSession(s)}
                  onKeyDown={(ev) => (ev.key === 'Enter' ? onOpenSession(s) : null)}
                >
                  <span className="history-item-main">
                    <strong>Week of {formatWeekRange(s.weekStart)}</strong>
                    <br />
                    <span className="muted">{values.length} of {SEGMENTS.length} areas rated</span>
                  </span>
                  <span className="history-item-actions">
                    <span
                      className="rating-badge"
                      style={{ background: ratingColor(avg, 5) }}
                      title="Average rating"
                    >
                      {avg.toFixed(1)}
                    </span>
                    <button className="redo-btn" onClick={(ev) => handleRedoSession(ev, s)}>
                      Redo
                    </button>
                    <button className="delete-btn" onClick={(ev) => handleDeleteSession(ev, s)}>
                      Delete
                    </button>
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
