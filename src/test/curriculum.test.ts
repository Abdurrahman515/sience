import { describe, expect, it } from 'vitest'
import { SEMESTERS, isPending } from '../content/curriculum'
import { LESSONS } from '../content/registry'

describe('هيكل المقرر', () => {
  it('فصلان دراسيان بالترتيب', () => {
    expect(SEMESTERS.map((s) => s.title)).toEqual(['الفصل الدراسي الأول', 'الفصل الدراسي الثاني'])
  })
  it('لكل فصل اختبار منتصف ونهاية (نهاية العام للفصل الثاني) خارج الوحدات', () => {
    for (const s of SEMESTERS) {
      expect(s.exams.length).toBe(2)
      expect(s.exams[0].title).toContain('منتصف')
      expect(s.exams[1].title).toContain('نهاية')
    }
  })
  it('اختبارا الفصلين كلاهما متاحان', () => {
    expect(SEMESTERS[0].exams.every((e) => !isPending(e))).toBe(true)
    expect(SEMESTERS[0].exams[1].id).toBe('final-1')
    expect(isPending(SEMESTERS[1].exams[0])).toBe(false)
    expect(SEMESTERS[1].exams[0].id).toBe('midterm-2')
    expect(SEMESTERS[1].exams[1].id).toBe('final-2')
    expect(isPending(SEMESTERS[1].exams[1])).toBe(false)
    expect(SEMESTERS[1].exams[1].title).toBe('اختبار نهاية العام')
  })
  it('كل دروس الكتاب تظهر في الفصل الأول مرة واحدة', () => {
    const ids = SEMESTERS[0].units.flatMap((u) => u.chapters.flatMap((c) => c.lessonIds))
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.sort()).toEqual(LESSONS.filter((l) => l.unit <= 3).map((l) => l.id).sort())
  })
  it('اختبار مراجعة كل وحدة متاحة داخل وحدتها', () => {
    const [u1, u2, u3] = SEMESTERS[0].units
    expect(u1.review?.id).toBe('unit1-review')
    expect(u2.review?.id).toBe('unit2-review')
    expect(u3.review?.id).toBe('unit3-review')
    expect(u3.soon).toBeUndefined()
    expect(u3.chapters.map((c) => c.id)).toEqual([5, 6])
  })
  it('الفصل الثاني: كل دروسه مرة واحدة، ولا تداخل مع الفصل الأول', () => {
    const ids = SEMESTERS[1].units.flatMap((u) => u.chapters.flatMap((c) => c.lessonIds))
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.sort()).toEqual(LESSONS.filter((l) => l.unit >= 4).map((l) => l.id).sort())
  })
  it('الفصل الثاني: الوحدة ٥ مقسومة حول اختبار المنتصف، والوحدة ٦ بفصليها', () => {
    const u = SEMESTERS[1].units
    expect(u.map((x) => x.id)).toEqual([4, 5, 5, 6])
    expect(u[0].review?.id).toBe('unit4-review')
    expect(u[1].chapters.map((c) => c.id)).toEqual([9, 10])
    expect(u[1].review).toBeUndefined()
    expect(u[2].chapters.map((c) => c.id)).toEqual([11])
    expect(u[2].review?.id).toBe('unit5-review')
    expect(u[2].soon).toBeUndefined()
    expect(u[3].chapters.map((c) => c.id)).toEqual([12, 13])
    expect(u[3].review?.id).toBe('unit6-review')
    expect(u[3].soon).toBeUndefined()
    // مفاتيح الطيّ فريدة رغم تكرار رقم الوحدة
    const keys = u.map((x) => x.foldKey ?? x.id)
    expect(new Set(keys).size).toBe(keys.length)
  })
})
