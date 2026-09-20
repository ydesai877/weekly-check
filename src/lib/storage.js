import { SEGMENTS } from '../data/segments'

const STORAGE_KEY = 'oneself2.sessions.v1'

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

// Sunday-anchored ISO date string for "the week this check-in belongs to".
// The week runs Sunday through Saturday (e.g. Sept 13-19).
export function currentWeekStart(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay() // 0 = Sunday, ..., 6 = Saturday
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

// The Saturday that closes out the week starting on weekStart.
export function weekEnd(weekStart) {
  const d = new Date(`${weekStart}T00:00:00`)
  d.setDate(d.getDate() + 6)
  return d.toISOString().slice(0, 10)
}

export function listSessions() {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getSession(id) {
  return readAll().find((s) => s.id === id) ?? null
}

// The most recent session that hasn't been completed yet, if any.
export function getInProgressSession() {
  const sessions = listSessions()
  return sessions.find((s) => s.status !== 'complete') ?? null
}
// Any session — in progress or completed — already created for the given
// week (defaults to the current week). Used to stop a second, blank
// session from ever getting created for a week that already has one.
export function getSessionForWeek(weekStart = currentWeekStart()) {
  const sessions = listSessions()
  return sessions.find((s) => s.weekStart === weekStart) ?? null
}
export function createSession() {
  const now = new Date().toISOString()
  const session = {
    id: makeId(),
    weekStart: currentWeekStart(),
    status: 'rating', // 'rating' -> 'reflecting' -> 'closing' -> 'complete'
    ratings: {},
    reflections: {},
    reflectionOrder: [],
    currentReflectionIndex: 0,
    closingAnswers: {},
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  }
  const sessions = readAll()
  sessions.push(session)
  writeAll(sessions)
  return session
}

export function saveSession(session) {
  const sessions = readAll()
  const idx = sessions.findIndex((s) => s.id === session.id)
  const updated = { ...session, updatedAt: new Date().toISOString() }
  if (idx === -1) sessions.push(updated)
  else sessions[idx] = updated
  writeAll(sessions)
  return updated
}

export function deleteSession(id) {
  writeAll(readAll().filter((s) => s.id !== id))
}

// Once all 14 segments are rated, decide the order to walk through
// reflections in: lowest-rated first, so the segments that need the most
// attention come up while focus is freshest.
export function buildReflectionOrder(ratings) {
  return SEGMENTS.map((s) => s.id)
    .filter((id) => typeof ratings[id] === 'number')
    .sort((a, b) => ratings[a] - ratings[b])
}
