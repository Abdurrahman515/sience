import { describe, expect, it } from 'vitest'
import { LOCK_MS, examMode, examPassed, lockText, lockedUntil, passRatioOf } from '../lib/examRules'
import { emptyProgress, recordExam } from '../lib/progress'
import { groupErrors } from '../lib/examReview'
import { mc } from '../content/helpers'
import { EXAMS } from '../content/exams'
import { lessonIdOfQuestion, LESSONS } from '../content/registry'

describe('قواعد الاختبارات', () => {
  it('مراجعة الوحدة ٧٠٪ وتصحيح فوري؛ المنتصف والنهاية ٦٠٪ صارمة', () => {
    expect(examMode('unit3-review')).toBe('review')
    expect(examMode('midterm-2')).toBe('strict')
    expect(examMode('final-1')).toBe('strict')
    expect(passRatioOf('unit1-review')).toBe(0.7)
    expect(passRatioOf('final-1')).toBe(0.6)
    expect(examPassed('unit1-review', 13, 20)).toBe(false)
    expect(examPassed('unit1-review', 14, 20)).toBe(true)
    expect(examPassed('midterm-1', 12, 20)).toBe(true)
    expect(examPassed('midterm-1', 11, 20)).toBe(false)
  })
  it('الرسوب في الصارم يقفل ٢٤ ساعة ثم يُفتح', () => {
    const t0 = 1_000_000
    let p = recordExam(emptyProgress(), 'midterm-1', 5, 20, t0)
    expect(lockedUntil(p, 'midterm-1', t0 + 1000)).toBe(t0 + LOCK_MS)
    expect(lockedUntil(p, 'midterm-1', t0 + LOCK_MS)).toBe(0)
    p = recordExam(p, 'midterm-1', 15, 20, t0 + LOCK_MS + 1)
    expect(lockedUntil(p, 'midterm-1', t0 + LOCK_MS + 2)).toBe(0)
  })
  it('مراجعة الوحدة لا تُقفل أبداً حتى عند الرسوب', () => {
    const p = recordExam(emptyProgress(), 'unit1-review', 0, 20, 5)
    expect(lockedUntil(p, 'unit1-review', 6)).toBe(0)
  })
  it('نص الوقت المتبقي', () => {
    expect(lockText(5 * 3600_000 + 12 * 60_000)).toBe('٥ ساعة و١٢ دقيقة')
    expect(lockText(30 * 60_000)).toBe('٣٠ دقيقة')
  })
})

describe('تجميع الأخطاء حسب الدرس', () => {
  it('يرتب حسب ترتيب الدروس ويضع المجهول أخيراً', () => {
    const a = mc('qa', 'س', 'ص', ['خ'], 'ش')
    const b = mc('qb', 'س', 'ص', ['خ'], 'ش')
    const c = mc('qc', 'س', 'ص', ['خ'], 'ش')
    const look = (id: string) => ({ qa: 'L2', qb: 'L1' })[id as 'qa' | 'qb']
    const g = groupErrors([a, b, c], look, ['L1', 'L2'])
    expect(g.map((x) => x.lessonId)).toEqual(['L1', 'L2', null])
  })
  it('كل سؤال في كل اختبار ينتمي إلى درس معروف وبمعرّف فريد', () => {
    for (const e of EXAMS) {
      for (const q of e.questions) expect(lessonIdOfQuestion(q.id), `${e.id}:${q.id}`).toBeTruthy()
    }
    const ids = LESSONS.flatMap((l) => [...l.bank.r, ...l.bank.m].map((q) => q.id))
    expect(new Set(ids).size).toBe(ids.length)
  })
})
