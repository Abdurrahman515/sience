import { describe, expect, it } from 'vitest'
import { formatClock, gradeLabel, isCorrect, optionsOf, scoreExam } from '../lib/exam'
import { mc, num } from '../content/helpers'
import { EXAMS } from '../content/exams'

const q1 = mc('t1', 'س؟', 'ص', ['أ', 'ب', 'ج'], 'ش')
const q2 = num('t2', 'س؟', 5, 'م', 'ش', { mistakes: [{ value: 2, why: 'x' }] })

describe('exam', () => {
  it('الخيارات تحتوي كل الإجابات وبترتيب ثابت', () => {
    const a = optionsOf(q1)
    expect(a.sort()).toEqual(['أ', 'ب', 'ج', 'ص'].sort())
    expect(optionsOf(q1)).toEqual(optionsOf(q1))
  })
  it('الإجابة الصحيحة ليست دائماً في الموضع الأول', () => {
    const positions = new Set<number>()
    for (const e of EXAMS) for (const q of e.questions) if (q.kind === 'mc') positions.add(optionsOf(q).indexOf(q.correct))
    expect(positions.size).toBeGreaterThan(1)
  })
  it('يصحّح الأسئلة', () => {
    expect(isCorrect(q1, 'ص')).toBe(true)
    expect(isCorrect(q1, 'أ')).toBe(false)
    expect(isCorrect(q1, null)).toBe(false)
    expect(isCorrect(q2, 5)).toBe(true)
    expect(isCorrect(q2, 4)).toBe(false)
    expect(isCorrect(q2, 'ص')).toBe(false)
    expect(scoreExam([q1, q2], { t1: 'ص', t2: 5 })).toBe(2)
    expect(scoreExam([q1, q2], { t1: 'ص' })).toBe(1)
  })
  it('تقدير النتيجة والوقت', () => {
    expect(gradeLabel(19, 20).emoji).toBe('🏆')
    expect(gradeLabel(2, 20).emoji).toBe('🌱')
    expect(gradeLabel(0, 0).emoji).toBe('🌱')
    expect(formatClock(125)).toBe('2:05')
    expect(formatClock(-3)).toBe('0:00')
  })
})
