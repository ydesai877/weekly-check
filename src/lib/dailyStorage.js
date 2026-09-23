const STORAGE_KEY = 'weekly-check.daily.v1'

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

function writeAll(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

// Local-timezone ISO date string for "today" — meant to be filled in each
// night, so this always means the calendar day the user is currently in,
// not a UTC day that might already have rolled over.
export function todayDate(date = new Date()) {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

export function listDailyEntries() {
  return readAll().sort((a, b) => b.date.localeCompare(a.date))
}

export function getDailyEntry(date) {
  return readAll().find((e) => e.date === date) ?? null
}

// Returns today's entry, creating an empty draft for it if none exists yet.
export function ensureTodayEntry() {
  const date = todayDate()
  const existing = getDailyEntry(date)
  if (existing) return existing
  const now = new Date().toISOString()
  const entry = {
    id: makeId(),
    date,
    chosenToday: '',
    satisfaction: null,
    chosenTomorrow: '',
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  }
  const entries = readAll()
  entries.push(entry)
  writeAll(entries)
  return entry
}

export function saveDailyEntry(entry) {
  const entries = readAll()
  const idx = entries.findIndex((e) => e.id === entry.id)
  const updated = { ...entry, updatedAt: new Date().toISOString() }
  if (idx === -1) entries.push(updated)
  else entries[idx] = updated
  writeAll(entries)
  return updated
}

export function deleteDailyEntry(id) {
  writeAll(readAll().filter((e) => e.id !== id))
}

// Removes every saved daily check-in.
export function clearAllDailyEntries() {
  writeAll([])
}
