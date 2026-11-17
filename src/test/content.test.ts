import { describe, expect, it } from 'vitest'
import { checkContent } from '../dev/contentCheck'
import { EXAMS, EXAM_FINAL1, EXAM_MIDTERM, EXAM_MIDTERM2, EXAM_UNIT1, EXAM_UNIT2, EXAM_UNIT3, EXAM_UNIT4, EXAM_UNIT5, EXAM_UNIT6, EXAM_FINAL2 } from '../content/exams'
import { LESSONS, UNITS, getLesson, nextLesson } from '../content/registry'

describe('المحتوى', () => {
  it('سليم بلا أي مشكلات', () => {
    expect(checkContent()).toEqual([])
  })
  it('كل دروس الوحدات الست موجودة', () => {
    expect(UNITS.map((u) => u.id)).toEqual([1, 2, 3, 4, 5, 6])
    expect(LESSONS.length).toBe(41)
    expect(UNITS[4].chapters.map((c) => c.id)).toEqual([9, 10, 11])
    expect(UNITS[5].chapters.map((c) => c.id)).toEqual([12, 13])
    expect(getLesson('u5c11l1')?.title).toContain('الحبليات')
    expect(getLesson('u6c13l2')?.title).toContain('الإنسان')
    expect(getLesson('u2c4l2')?.title).toContain('العناصر')
    expect(getLesson('u3c5l1')?.title).toContain('المعادن')
    expect(getLesson('u3c6l2')?.title).toContain('التجوية')
    expect(getLesson('nope')).toBeUndefined()
  })
  it('الدرس التالي بالترتيب', () => {
    expect(nextLesson('u1c1l1')?.id).toBe('u1c1l2')
    expect(nextLesson(LESSONS[LESSONS.length - 1].id)).toBeUndefined()
  })
  it('اختبار مراجعة كل وحدة يغطي كل دروسها الأساسية', () => {
    for (const [exam, unit] of [[EXAM_UNIT1, 1], [EXAM_UNIT2, 2], [EXAM_UNIT3, 3], [EXAM_UNIT4, 4], [EXAM_UNIT5, 5], [EXAM_UNIT6, 6]] as const) {
      const core = LESSONS.filter((l) => l.unit === unit && !l.id.endsWith('inq'))
      for (const l of core) {
        for (const q of l.bank.r) expect(exam.questions).toContain(q)
      }
    }
  })
  it('اختبار منتصف الفصل يغطي الوحدتين ١ و٢ فقط', () => {
    const core = LESSONS.filter((l) => l.unit <= 2 && !l.id.endsWith('inq'))
    expect(core.length).toBe(10)
    for (const l of core) for (const q of l.bank.m) expect(EXAM_MIDTERM.questions).toContain(q)
    expect(EXAM_MIDTERM.questions.length).toBe(30)
  })
  it('أسئلة المراجعة والمنتصف لا تتكرر', () => {
    const all = [EXAM_UNIT1, EXAM_UNIT2, EXAM_UNIT3, EXAM_UNIT4, EXAM_UNIT5, EXAM_UNIT6, EXAM_MIDTERM, EXAM_MIDTERM2].flatMap((e) => e.questions.map((q) => q.id))
    expect(new Set(all).size).toBe(all.length)
  })
  it('لا أسئلة من الوحدة ٣ في منتصف الفصل', () => {
    const u3 = new Set(LESSONS.filter((l) => l.unit === 3).flatMap((l) => [...l.bank.r, ...l.bank.m]).map((q) => q.id))
    expect(EXAM_MIDTERM.questions.some((q) => u3.has(q.id))).toBe(false)
  })
  it('اختبار نهاية الفصل يغطي الوحدات الثلاث بلا تكرار ولا أسئلة من المنتصف', () => {
    const ids = EXAM_FINAL1.questions.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
    const mid = new Set(EXAM_MIDTERM.questions.map((q) => q.id))
    expect(ids.some((id) => mid.has(id))).toBe(false)
    for (const l of LESSONS.filter((x) => x.unit === 3 && !x.id.endsWith('inq'))) {
      for (const q of l.bank.m) expect(EXAM_FINAL1.questions).toContain(q)
    }
    for (const l of LESSONS.filter((x) => x.unit <= 2 && !x.id.endsWith('inq'))) {
      expect(EXAM_FINAL1.questions).toContain(l.bank.r[0])
    }
    expect(EXAM_FINAL1.questions.length).toBe(32)
  })
  it('منتصف الفصل الثاني: الوحدة ٤ والفصلان ٩ و١٠ فقط', () => {
    const core = LESSONS.filter((l) => (l.unit === 4 || (l.unit === 5 && l.chapter <= 10)) && !l.id.endsWith('inq'))
    expect(core.length).toBe(8)
    for (const l of core) for (const q of l.bank.m) expect(EXAM_MIDTERM2.questions).toContain(q)
    expect(EXAM_MIDTERM2.questions.length).toBe(24)
    const sem1 = new Set(LESSONS.filter((l) => l.unit <= 3).flatMap((l) => [...l.bank.r, ...l.bank.m]).map((q) => q.id))
    expect(EXAM_MIDTERM2.questions.some((q) => sem1.has(q.id))).toBe(false)
    const unit4r = new Set(EXAM_UNIT4.questions.map((q) => q.id))
    expect(EXAM_MIDTERM2.questions.some((q) => unit4r.has(q.id))).toBe(false)
  })
  it('اختبار نهاية العام يغطي الفصل الثاني كاملاً (الوحدات ٤ و٥ و٦) بلا تكرار ولا أسئلة منتصف', () => {
    const ids = EXAM_FINAL2.questions.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
    const mid = new Set(EXAM_MIDTERM2.questions.map((q) => q.id))
    expect(ids.some((id) => mid.has(id))).toBe(false)
    const sem1 = new Set(LESSONS.filter((l) => l.unit <= 3).flatMap((l) => [...l.bank.r, ...l.bank.m]).map((q) => q.id))
    expect(ids.some((id) => sem1.has(id))).toBe(false)
    for (const l of LESSONS.filter((x) => x.unit >= 4 && !x.id.endsWith('inq'))) {
      const covered = l.bank.r.concat(l.bank.m).filter((q) => EXAM_FINAL2.questions.includes(q))
      expect(covered.length, l.id).toBeGreaterThanOrEqual(2)
    }
    expect(EXAM_FINAL2.title).toBe('اختبار نهاية العام')
  })
  it('دروس الفصل الثاني: لكل درس أساسي ٤ أسئلة مراجعة و٣ منتصف، والاستقصاء بلا بنك', () => {
    for (const l of LESSONS.filter((x) => x.unit >= 4)) {
      if (l.id.endsWith('inq')) expect(l.bank).toEqual({ r: [], m: [] })
      else {
        expect(l.bank.r.length).toBe(4)
        expect(l.bank.m.length).toBe(3)
      }
    }
  })
  it('الاختبارات فيها أسئلة رقمية وأسئلة اختيار', () => {
    for (const e of EXAMS) {
      expect(e.questions.some((q) => q.kind === 'num')).toBe(true)
      expect(e.questions.some((q) => q.kind === 'mc')).toBe(true)
    }
  })
  it('لا يوجد dir="ltr" أو direction: ltr في المصادر', async () => {
    const { readdirSync, readFileSync, statSync } = await import('node:fs')
    const { join } = await import('node:path')
    const walk = (d: string): string[] =>
      readdirSync(d).flatMap((f) => {
        const p = join(d, f)
        return statSync(p).isDirectory() ? walk(p) : [p]
      })
    const files = walk('src').filter((f) => /\.(tsx?|css)$/.test(f) && !f.includes('test'))
    for (const f of files) {
      const txt = readFileSync(f, 'utf8')
      expect(txt, f).not.toMatch(/dir=["']ltr["']|direction:\s*ltr/)
    }
  })
})
