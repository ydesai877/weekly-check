import { useState } from 'react'
import { segmentById } from '../data/segments'
import { ratingColor } from '../lib/ratingColor'
import ProgressBar from './ProgressBar'

const FIELDS = [
  { key: 'wentWell', prompt: 'What went well?' },
  { key: 'whyRating', prompt: 'Why did you rate it that way?' },
  { key: 'whatsNext', prompt: "What's next?" },
]

export default function ReflectionFlow({
  reflectionOrder,
  currentIndex,
  ratings,
  reflections,
  onNext,
  onBack,
  onExit,
}) {
  const segmentId = reflectionOrder[currentIndex]
  const segment = segmentById(segmentId)
  const rating = ratings[segmentId]
  const answers = reflections[segmentId] ?? {}
  const [draft, setDraft] = useState(answers)

  if (!segment) return null

  const allFilled = FIELDS.every((f) => (draft[f.key] ?? '').trim().length > 0)
  const isLast = currentIndex === reflectionOrder.length - 1

  function updateField(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="stack">
      <ProgressBar current={currentIndex} total={reflectionOrder.length} />

      <div className="card stack">
        <div className="segment-label">
          <span className="segment-emoji">{segment.emoji}</span>
          <span>{segment.label}</span>
          <span
            className="rating-badge"
            style={{ background: ratingColor(rating), marginLeft: 'auto' }}
          >
            {rating}
          </span>
        </div>
        {segment.focus && <p className="muted segment-focus">{segment.focus}</p>}

        {FIELDS.map((field) => (
          <div key={field.key} className="stack" style={{ gap: 6 }}>
            <label className="muted" style={{ fontWeight: 600, color: 'var(--navy)' }}>
              {field.key === 'whyRating' ? `Why did you rate it ${rating}?` : field.prompt}
            </label>
            <textarea
              value={draft[field.key] ?? ''}
              onChange={(e) => updateField(field.key, e.target.value)}
              placeholder="Type your answer..."
            />
          </div>
        ))}
      </div>

      <div className="row-actions">
        <button
          className="secondary-btn"
          onClick={() => (currentIndex === 0 ? onExit(draft) : onBack(draft))}
        >
          {currentIndex === 0 ? 'Save & exit' : 'Back'}
        </button>
        <button className="primary-btn" disabled={!allFilled} onClick={() => onNext(draft)}>
          {isLast ? 'Continue' : 'Next area'}
        </button>
      </div>

      <p className="muted" style={{ textAlign: 'center' }}>
        {currentIndex + 1} of {reflectionOrder.length}
      </p>
    </div>
  )
}
