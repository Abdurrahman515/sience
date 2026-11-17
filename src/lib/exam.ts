import type { Question } from '../content/types'
import { hashString, mulberry32, shuffle } from './rng'
import { checkNumeric } from './generators'

export interface ExamDef {
  id: string
  title: string
  emoji: string
  minutes: number
  questions: Question[]
}

/** خيارات سؤال الاختيار بترتيب ثابت لكل سؤال (الصحيح ليس دائماً الأول). */
export function optionsOf(q: Question & { kind: 'mc' }): string[] {
  const all = [q.correct, ...q.wrongs.map((w) => w.t)]
  return shuffle(mulberry32(hashString(q.id)), all)
}

export type Answer = string | number | null

export function isCorrect(q: Question, a: Answer): boolean {
  if (a === null) return false
  if (q.kind === 'mc') return a === q.correct
  return typeof a === 'number' && checkNumeric(q, a).ok
}

export function scoreExam(questions: Question[], answers: Record<string, Answer>): number {
  return questions.reduce((s, q) => s + (isCorrect(q, answers[q.id] ?? null) ? 1 : 0), 0)
}

export function gradeLabel(score: number, total: number): { text: string; emoji: string } {
  const r = total === 0 ? 0 : score / total
  if (r >= 0.9) return { text: 'ممتاز! أنتِ نجمة العلوم', emoji: '🏆' }
  if (r >= 0.8) return { text: 'جيد جداً، شغل رائع', emoji: '🌟' }
  if (r >= 0.65) return { text: 'جيد، بقليل من المراجعة بتوصلي للممتاز', emoji: '👍' }
  if (r >= 0.5) return { text: 'مقبول، خلينا نراجع الأخطاء سوا', emoji: '💪' }
  return { text: 'لا بأس، المراجعة بتفرق كتير. جرّبي من جديد', emoji: '🌱' }
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}
