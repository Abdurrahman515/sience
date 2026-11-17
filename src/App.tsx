import { useCallback, useEffect, useState } from 'react'
import { getLesson, nextLesson } from './content/registry'
import { getExam } from './content/exams'
import { loadProgress, recordExam, recordLab, recordLesson, saveProgress, type ProgressData } from './lib/progress'
import { parseHash } from './lib/route'
import { loadUi, saveUi, toggle, type UiState } from './lib/uiState'
import { Home } from './components/Home'
import { LessonPlayer } from './components/LessonPlayer'
import { ExamRunner } from './components/ExamRunner'
import { Settings } from './components/Settings'
import { LabHome } from './components/LabHome'
import { LabRunner } from './components/LabRunner'
import { LAB_EXPERIMENTS, getExperiment } from './lab/experiments'
import { lockedUntil, lockText } from './lib/examRules'

function storage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export default function App() {
  const [hash, setHash] = useState(() => window.location.hash)
  const [progress, setProgress] = useState<ProgressData>(() => loadProgress(storage()))
  const [ui, setUi] = useState<UiState>(() => loadUi(storage()))
  const [attempt, setAttempt] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const on = () => {
      setHash(window.location.hash)
      setNow(Date.now())
      window.scrollTo?.(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  const update = useCallback((fn: (p: ProgressData) => ProgressData) => {
    setProgress((p) => {
      const n = fn(p)
      saveProgress(storage(), n)
      return n
    })
  }, [])

  const toggleFold = useCallback((key: string) => {
    setUi((u) => {
      const n = toggle(u, key)
      saveUi(storage(), n)
      return n
    })
  }, [])

  const go = useCallback((h: string) => {
    window.location.hash = h
  }, [])

  const route = parseHash(hash)

  if (route.name === 'lesson') {
    const lesson = getLesson(route.id)
    if (lesson) {
      const next = nextLesson(lesson.id)
      return (
        <main>
          <LessonPlayer
            key={lesson.id}
            lesson={lesson}
            onFinish={(f, t) => update((p) => recordLesson(p, lesson.id, f, t))}
            onExit={() => go('#/')}
            nextTitle={next?.title}
            onNext={next ? () => go(`#/lesson/${next.id}`) : undefined}
          />
        </main>
      )
    }
  }

  if (route.name === 'exam') {
    const exam = getExam(route.id)
    if (exam) {
      const until = lockedUntil(progress, exam.id, now)
      if (until > 0) {
        return (
          <main>
            <div className="card confirm" role="status">
              <h3>🔒 الاختبار مقفل مؤقتاً</h3>
              <p>تقدرين تعيدين هذا الاختبار بعد {lockText(until - now)}. راجعي دروسك خلال هالوقت.</p>
              <button type="button" className="btn" onClick={() => go('#/')}>
                الرئيسية
              </button>
            </div>
          </main>
        )
      }
      return (
        <main>
          <ExamRunner
            key={`${exam.id}-${attempt}`}
            exam={exam}
            onFinish={(s, t) => update((p) => recordExam(p, exam.id, s, t))}
            onExit={() => go('#/')}
            onRetry={() => setAttempt((n) => n + 1)}
          />
        </main>
      )
    }
  }

  if (route.name === 'lab') {
    return (
      <main>
        <LabHome progress={progress} go={go} />
      </main>
    )
  }

  if (route.name === 'experiment') {
    const exp = getExperiment(route.id)
    if (exp) {
      const idx = LAB_EXPERIMENTS.findIndex((e) => e.id === exp.id)
      const next = LAB_EXPERIMENTS[idx + 1]
      return (
        <main>
          <LabRunner
            key={exp.id}
            exp={exp}
            lessonDone={!!progress.lessons[exp.after.lessonId]?.done}
            onFinish={(f, t) => update((p) => recordLab(p, exp.id, f, t))}
            onExit={() => go('#/lab')}
            nextTitle={next?.title}
            onNext={next ? () => go(`#/lab/${next.id}`) : undefined}
          />
        </main>
      )
    }
  }

  if (route.name === 'settings') {
    return (
      <main>
        <Settings progress={progress} onReplace={(p) => update(() => p)} onExit={() => go('#/')} />
      </main>
    )
  }

  return (
    <main>
      <Home progress={progress} ui={ui} onToggle={toggleFold} go={go} />
    </main>
  )
}
