import { PARTS, SEGMENTS, segmentsByPart } from '../data/segments'

const SCALE = Array.from({ length: 10 }, (_, i) => i + 1)

export default function RankingScreen({ ratings, onRate, onDone, onCancel }) {
  const ratedCount = Object.keys(ratings).length
  const allRated = ratedCount === SEGMENTS.length

  return (
    <div className="stack">
      <div>
        <h2>Rate your week</h2>
        <p className="muted">1 is terrible, 10 is terrific. Rate every area &mdash; go with your gut.</p>
      </div>

      {PARTS.map((part) => (
        <div className="stack" key={part.id} style={{ gap: 10 }}>
          <h3 className="part-title">{part.title}</h3>
          <div className="card">
            {segmentsByPart(part.id).map((segment) => (
              <div className="segment-row" key={segment.id}>
                <div className="segment-label">
                  <span className="segment-emoji">{segment.emoji}</span>
                  <span>{segment.label}</span>
                </div>
                <p className="muted segment-focus">{segment.focus}</p>
                <div className="scale-row">
                  {SCALE.map((n) => (
                    <button
                      key={n}
                      className={`scale-btn${ratings[segment.id] === n ? ' selected' : ''}`}
                      onClick={() => onRate(segment.id, n)}
                      aria-pressed={ratings[segment.id] === n}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="scale-hint">
                  <span>Terrible</span>
                  <span>Terrific</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="row-actions">
        <button className="secondary-btn" onClick={onCancel}>
          Save &amp; exit
        </button>
        <button className="primary-btn" disabled={!allRated} onClick={onDone}>
          {allRated ? 'Continue to reflection' : `${ratedCount}/${SEGMENTS.length} rated`}
        </button>
      </div>
    </div>
  )
}
