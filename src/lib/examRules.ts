// قواعد الاختبارات — مكان واحد: وضع الاختبار، حد النجاح، وقفل الإعادة.
import type { ProgressData } from './progress'
import { toArabicDigits } from './arabicText'

/** review: مراجعة الوحدة (تصحيح فوري)؛ strict: منتصف الفصل ونهايته (بلا تصحيح حتى النهاية) */
export type ExamMode = 'review' | 'strict'

export const REVIEW_PASS = 0.7
export const STRICT_PASS = 0.6
export const LOCK_MS = 24 * 60 * 60 * 1000

export function examMode(examId: string): ExamMode {
  return examId.endsWith('-review') ? 'review' : 'strict'
}

export function passRatioOf(examId: string): number {
  return examMode(examId) === 'review' ? REVIEW_PASS : STRICT_PASS
}

export function examPassed(examId: string, score: number, total: number): boolean {
  return total > 0 && score / total >= passRatioOf(examId)
}

/** وقت انتهاء القفل (بالملّي ثانية)؛ 0 إن لم يكن الاختبار مقفلاً الآن. */
export function lockedUntil(p: ProgressData, examId: string, now: number): number {
  if (examMode(examId) !== 'strict') return 0
  const at = p.exams[examId]?.lastFailAt
  if (!at) return 0
  const end = at + LOCK_MS
  return now < end ? end : 0
}

/** «بعد ٥ ساعات و١٢ دقيقة» للعرض. */
export function lockText(msLeft: number): string {
  const mins = Math.max(1, Math.ceil(msLeft / 60000))
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${toArabicDigits(m)} دقيقة`
  if (m === 0) return `${toArabicDigits(h)} ساعة`
  return `${toArabicDigits(h)} ساعة و${toArabicDigits(m)} دقيقة`
}

export const percentText = (r: number) => `${toArabicDigits(Math.round(r * 100))}٪`
