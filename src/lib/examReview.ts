import type { Question } from '../content/types'

export interface ErrorGroup {
  lessonId: string | null
  questions: Question[]
}

/** يجمع الأسئلة الخاطئة حسب الدرس (بترتيب ظهور الدروس في order)، وغير المعروفة في مجموعة أخيرة. */
export function groupErrors(wrong: Question[], lookup: (qid: string) => string | undefined, order: string[]): ErrorGroup[] {
  const by = new Map<string | null, Question[]>()
  for (const q of wrong) {
    const id = lookup(q.id) ?? null
    by.set(id, [...(by.get(id) ?? []), q])
  }
  const rank = (id: string | null) => (id === null ? Number.MAX_SAFE_INTEGER : order.indexOf(id))
  return [...by.entries()]
    .sort((a, b) => rank(a[0]) - rank(b[0]))
    .map(([lessonId, questions]) => ({ lessonId, questions }))
}
