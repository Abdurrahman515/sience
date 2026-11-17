import { examPassed } from './examRules'

export const STORAGE_KEY = 'science-app:v1'

export interface LessonProgress {
  stars: number
  firstTry: number
  total: number
  done: boolean
  updatedAt: number
}

export interface ExamProgress {
  best: number
  total: number
  attempts: number
  lastAt: number
  /** وقت آخر رسوب في اختبار صارم (يبدأ منه قفل ٢٤ ساعة)؛ يُمسح عند النجاح */
  lastFailAt?: number
}

/** تقدم تجارب المختبر (اختياري للتوافق مع النسخ القديمة) */
export interface LabProgress {
  stars: number
  firstTry: number
  total: number
  done: boolean
  updatedAt: number
}

export interface ProgressData {
  version: 1
  lessons: Record<string, LessonProgress>
  exams: Record<string, ExamProgress>
  labs?: Record<string, LabProgress>
}

export interface StorageLike {
  getItem(k: string): string | null
  setItem(k: string, v: string): void
}

export function emptyProgress(): ProgressData {
  return { version: 1, lessons: {}, exams: {} }
}

export function starsFor(firstTry: number, total: number): number {
  if (total <= 0) return 3
  const r = firstTry / total
  if (r >= 0.85) return 3
  if (r >= 0.6) return 2
  return 1
}

export function recordLesson(p: ProgressData, id: string, firstTry: number, total: number, now = Date.now()): ProgressData {
  const stars = starsFor(firstTry, total)
  const old = p.lessons[id]
  const better = !old || stars > old.stars || (stars === old.stars && firstTry >= old.firstTry)
  const next: LessonProgress = better
    ? { stars, firstTry, total, done: true, updatedAt: now }
    : { ...old, done: true, updatedAt: now }
  return { ...p, lessons: { ...p.lessons, [id]: next } }
}

export function recordExam(p: ProgressData, id: string, score: number, total: number, now = Date.now()): ProgressData {
  const old = p.exams[id]
  const e: ExamProgress = {
    best: old ? Math.max(old.best, score) : score,
    total,
    attempts: (old?.attempts ?? 0) + 1,
    lastAt: now,
  }
  if (!examPassed(id, score, total)) e.lastFailAt = now
  return { ...p, exams: { ...p.exams, [id]: e } }
}

export function recordLab(p: ProgressData, id: string, firstTry: number, total: number, now = Date.now()): ProgressData {
  const stars = starsFor(firstTry, total)
  const old = p.labs?.[id]
  const better = !old || stars > old.stars || (stars === old.stars && firstTry >= old.firstTry)
  const next: LabProgress = better ? { stars, firstTry, total, done: true, updatedAt: now } : { ...old, done: true, updatedAt: now }
  return { ...p, labs: { ...(p.labs ?? {}), [id]: next } }
}

export function labStars(p: ProgressData): number {
  return Object.values(p.labs ?? {}).reduce((s, l) => s + l.stars, 0)
}

export function totalStars(p: ProgressData): number {
  return Object.values(p.lessons).reduce((s, l) => s + l.stars, 0)
}

export function isValidProgress(x: unknown): x is ProgressData {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  if (o.version !== 1 || typeof o.lessons !== 'object' || typeof o.exams !== 'object') return false
  if (!o.lessons || !o.exams) return false
  for (const l of Object.values(o.lessons as object)) {
    const v = l as Record<string, unknown>
    if (typeof v.stars !== 'number' || v.stars < 0 || v.stars > 3 || typeof v.done !== 'boolean') return false
  }
  if (o.labs !== undefined) {
    if (!o.labs || typeof o.labs !== 'object') return false
    for (const l of Object.values(o.labs as object)) {
      const v = l as Record<string, unknown>
      if (typeof v.stars !== 'number' || v.stars < 0 || v.stars > 3 || typeof v.done !== 'boolean') return false
    }
  }
  for (const e of Object.values(o.exams as object)) {
    const v = e as Record<string, unknown>
    if (typeof v.best !== 'number' || typeof v.total !== 'number') return false
  }
  return true
}

export function loadProgress(storage: StorageLike | null): ProgressData {
  if (!storage) return emptyProgress()
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return emptyProgress()
    const parsed: unknown = JSON.parse(raw)
    return isValidProgress(parsed) ? parsed : emptyProgress()
  } catch {
    return emptyProgress()
  }
}

export function saveProgress(storage: StorageLike | null, p: ProgressData): void {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(p))
  } catch {
    /* التخزين ممتلئ أو غير متاح: نتجاهل */
  }
}

export function exportProgress(p: ProgressData): string {
  return JSON.stringify(p, null, 2)
}

export function importProgress(text: string): ProgressData | null {
  try {
    const parsed: unknown = JSON.parse(text)
    return isValidProgress(parsed) ? parsed : null
  } catch {
    return null
  }
}
