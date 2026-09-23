import { PARTS, segmentsByPart } from '../data/segments'
import { ratingColor } from '../lib/ratingColor'
import { CLOSING_PAGES } from '../data/closingQuestions'
import { weekEnd } from '../lib/storage'

function formatClosingAnswer(question, value) {
  if (value == null) return null
  if (question.type === 'list') {
    const filled = value.filter((v) => v && v.trim().length > 0)
    return filled.length > 0 ? filled : null
  }
  return value
}

function formatWeek(weekStart) {
  const start = new Date(`${weekStart}T00:00:00`)
  const end = new Date(`${weekEnd(weekStart)}T00:00:00`)
  const startStr = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const endStr = end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  return `${startStr} – ${endStr}`
}

export default function SessionDetail({ session, onClose, onDelete, onRedo }) {
  function handleDelete() {
    if (window.confirm("Delete this week's check-in? This can't be undone.")) {
      onDelete()
    }
  }

  function handleRedo() {
    if (
      window.confirm(
        'Redo this week? Your existing answers stay in place until you save changes through to Finish.'
      )
    ) {
      onRedo()
    }
  }

  return (
    <div className="stack">
      <div className="top-bar" style={{ marginBottom: 0 }}>
        <h2>Week of {formatWeek(session.weekStart)}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="redo-btn" onClick={handleRedo}>
            Redo
          </button>
          <button className="delete-btn" onClick={handleDelete}>
            Delete
          </button>
          <button className="link-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {session.status !== 'complete' && (
        <p className="muted">This check-in isn&rsquo;t finished yet.</p>
      )}

      {PARTS.map((part) => {
        const partSegments = segmentsByPart(part.id).filter((s) => session.ratings[s.id] != null)
        if (partSegments.length === 0) return null
        return (
          <div className="part-card" key={part.id}>
            <h3 className="part-title">{part.title}</h3>
            {partSegments.map((segment) => {
              const rating = session.ratings[segment.id]
              const reflection = session.reflections?.[segment.id]
              const hasAnyAnswer =
                reflection && (reflection.wentWell || reflection.whyRating || reflection.whatsNext)
              return (
                <div className="segment-row" key={segment.id}>
                  <div className="segment-label">
                    <span className="segment-emoji">{segment.emoji}</span>
                    <span>{segment.label}</span>
                    <span
                      className="rating-badge"
                      style={{ background: ratingColor(rating, 5), marginLeft: 'auto' }}
                    >
                      {rating}
                    </span>
                  </div>
                  {hasAnyAnswer ? (
                    <>
                      <div>
                        <p className="muted" style={{ fontWeight: 600, color: 'var(--navy)', margin: '0 0 4px' }}>
                          What went well?
                        </p>
                        <p style={{ margin: 0 }}>{reflection.wentWell || '—'}</p>
                      </div>
                      <div>
                        <p className="muted" style={{ fontWeight: 600, color: 'var(--navy)', margin: '0 0 4px' }}>
                          Why did you rate it {rating}?
                        </p>
                        <p style={{ margin: 0 }}>{reflection.whyRating || '—'}</p>
                      </div>
                      <div>
                        <p className="muted" style={{ fontWeight: 600, color: 'var(--navy)', margin: '0 0 4px' }}>
                          What&rsquo;s next?
                        </p>
                        <p style={{ margin: 0 }}>{reflection.whatsNext || '—'}</p>
                      </div>
                    </>
                  ) : (
                    <p className="muted" style={{ margin: 0 }}>
                      No reflection was saved for this area.
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}

      {session.closingAnswers && Object.keys(session.closingAnswers).length > 0 && (
        <div className="card stack">
          <h3 style={{ fontSize: '1rem' }}>Closing thoughts</h3>
          {CLOSING_PAGES.flatMap((page) => page.questions).map((q) => {
            const value = formatClosingAnswer(q, session.closingAnswers[q.id])
            if (value == null) return null
            return (
              <div key={q.id}>
                <p className="muted" style={{ fontWeight: 600, color: 'var(--navy)', margin: '0 0 4px' }}>
                  {q.prompt}
                </p>
                {Array.isArray(value) ? (
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {value.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ margin: 0 }}>{value}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
