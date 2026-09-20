import { useEffect, useState } from 'react'
import Home from './components/Home'
import RankingScreen from './components/RankingScreen'
import ReflectionFlow from './components/ReflectionFlow'
import ClosingSection from './components/ClosingSection'
import SessionDetail from './components/SessionDetail'
import DailyCheckin from './components/DailyCheckin'
import DailyDetail from './components/DailyDetail'
import {
  buildReflectionOrder,
  createSession,
  currentWeekStart,
  deleteSession,
  getInProgressSession,
  getSessionForWeek,
  listSessions,
  saveSession,
} from './lib/storage'
import { ensureTodayEntry, getDailyEntry, listDailyEntries, saveDailyEntry, todayDate } from './lib/dailyStorage'

export default function App() {
  const [session, setSession] = useState(null) // active weekly session being edited
  const [viewingSession, setViewingSession] = useState(null) // read-only past weekly session
  const [inProgress, setInProgress] = useState(null)
  const [sessions, setSessions] = useState([])

  const [dailyEntry, setDailyEntry] = useState(null) // active daily entry being edited
  const [viewingDaily, setViewingDaily] = useState(null) // read-only past daily entry
  const [dailyEntries, setDailyEntries] = useState([])

  useEffect(() => {
    refreshHome()
  }, [])

  function refreshHome() {
    setInProgress(getInProgressSession())
    setSessions(listSessions())
    setDailyEntries(listDailyEntries())
  }

  function persist(next) {
    const saved = saveSession(next)
    setSession(saved)
    return saved
  }
  
  function handleStart() {
    // Never silently create a second, blank session for a week that
    // already has one — that's how answers used to "go missing": a new
    // empty session would shadow the real, filled-in one.
    const existing = getSessionForWeek()
    if (existing && existing.status === 'complete') {
      setViewingSession(existing)
      return
    }
    if (existing) {
      setSession(existing)
      return
    }
    const created = createSession()
    setSession(created)
  }

  function handleResume(existing) {
    setSession(existing)
  }

  function handleExitToHome() {
    setSession(null)
    setDailyEntry(null)
    refreshHome()
  }

  function handleRate(segmentId, value) {
    const next = { ...session, ratings: { ...session.ratings, [segmentId]: value } }
    persist(next)
  }

  function handleRatingDone() {
    const order = buildReflectionOrder(session.ratings)
    persist({ ...session, status: 'reflecting', reflectionOrder: order, currentReflectionIndex: 0 })
  }

   function handleReflectionNext(draft) {
    const segmentId = session.reflectionOrder[session.currentReflectionIndex]
    const reflections = { ...session.reflections, [segmentId]: draft }
    const nextIndex = session.currentReflectionIndex + 1
    if (nextIndex >= session.reflectionOrder.length) {
      persist({ ...session, reflections, status: 'closing' })
    } else {
      persist({ ...session, reflections, currentReflectionIndex: nextIndex })
    }
  }

  function handleReflectionBack(draft) {
    const segmentId = session.reflectionOrder[session.currentReflectionIndex]
    const reflections = { ...session.reflections, [segmentId]: draft }
    const prevIndex = Math.max(0, session.currentReflectionIndex - 1)
    if (session.currentReflectionIndex === 0) {
      persist({ ...session, reflections, status: 'rating' })
    } else {
      persist({ ...session, reflections, currentReflectionIndex: prevIndex })
    }
  }

  function handleReflectionExit(draft) {
    const segmentId = session.reflectionOrder[session.currentReflectionIndex]
    const reflections = { ...session.reflections, [segmentId]: draft }
    persist({ ...session, reflections })
    setSession(null)
    refreshHome()
  }

  function handleSaveClosing(answers) {
    persist({ ...session, closingAnswers: answers })
  }

  function handleFinish() {
    const finished = {
      ...session,
      status: 'complete',
      completedAt: new Date().toISOString(),
    }
    saveSession(finished)
    setSession(null)
    refreshHome()
  }

  function handleOpenSession(s) {
    setViewingSession(s)
  }

  function handleStartDaily() {
    setDailyEntry(ensureTodayEntry())
  }

  function handleSaveDaily(next) {
    const saved = saveDailyEntry(next)
    setDailyEntry(saved)
  }

  function handleFinishDaily(next) {
    const finished = { ...next, completedAt: new Date().toISOString() }
    saveDailyEntry(finished)
    setDailyEntry(null)
    refreshHome()
  }

  function handleOpenDaily(entry) {
    // Reopen today's own entry for editing; anything older is read-only.
    if (entry.date === todayDate()) {
      setDailyEntry(getDailyEntry(entry.date))
    } else {
      setViewingDaily(entry)
    }
  }

  let body
  if (viewingSession) {
    body = <SessionDetail session={viewingSession} onClose={() => setViewingSession(null)} />
  } else if (viewingDaily) {
    body = <DailyDetail entry={viewingDaily} onClose={() => setViewingDaily(null)} />
  } else if (dailyEntry) {
    body = (
      <DailyCheckin
        entry={dailyEntry}
        onSave={handleSaveDaily}
        onFinish={handleFinishDaily}
        onExit={handleExitToHome}
      />
    )
  } else if (!session) {
    const todayEntry = dailyEntries.find((e) => e.date === todayDate())
    const thisWeekSession = sessions.find((s) => s.weekStart === currentWeekStart())
    body = (
      <Home
        inProgress={inProgress}
        thisWeekComplete={thisWeekSession?.status === 'complete'}
        completedSessions={sessions.filter((s) => s.status === 'complete')}
        onStart={handleStart}
        onResume={handleResume}
        onOpenSession={handleOpenSession}
        todayEntryComplete={Boolean(todayEntry?.completedAt)}
        recentDailyEntries={dailyEntries.slice(0, 7)}
        onStartDaily={handleStartDaily}
        onOpenDaily={handleOpenDaily}
      />
    )
  } else if (session.status === 'rating') {
    body = (
      <RankingScreen
        ratings={session.ratings}
        onRate={handleRate}
        onDone={handleRatingDone}
        onCancel={handleExitToHome}
      />
    )
  } else if (session.status === 'reflecting') {
    body = (
      <ReflectionFlow
        key={session.reflectionOrder[session.currentReflectionIndex]}
        reflectionOrder={session.reflectionOrder}
        currentIndex={session.currentReflectionIndex}
        ratings={session.ratings}
        reflections={session.reflections}
        onNext={handleReflectionNext}
        onBack={handleReflectionBack}
        onExit={handleReflectionExit}
      />
    )
  } else if (session.status === 'closing') {
    body = (
      <ClosingSection
        closingAnswers={session.closingAnswers}
        onSave={handleSaveClosing}
        onFinish={handleFinish}
        onBack={() =>
          persist({
            ...session,
            status: 'reflecting',
            currentReflectionIndex: session.reflectionOrder.length - 1,
          })
        }
      />
    )
  }

  return (
    <div className="app-shell">
      <div className="top-bar">
        <div className="brand">
          <div className="brand-mark">1</div>
          <span className="brand-name">OneSelf</span>
        </div>
        {(session || viewingSession || dailyEntry || viewingDaily) && (
          <button
            className="link-btn"
            onClick={() => {
              setSession(null)
              setViewingSession(null)
              setDailyEntry(null)
              setViewingDaily(null)
              refreshHome()
            }}
          >
            Home
          </button>
        )}
      </div>
      {body}
    </div>
  )
}
