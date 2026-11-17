import { describe, expect, it } from 'vitest'
import {
  STORAGE_KEY, emptyProgress, exportProgress, importProgress, isValidProgress,
  loadProgress, recordExam, recordLesson, saveProgress, starsFor, totalStars, type StorageLike,
} from '../lib/progress'

function memStorage(init: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...init }
  return { data, getItem: (k) => data[k] ?? null, setItem: (k, v) => void (data[k] = v) }
}

describe('stars', () => {
  it('تحسب النجوم حسب نسبة الإجابات من أول مرة', () => {
    expect(starsFor(10, 10)).toBe(3)
    expect(starsFor(9, 10)).toBe(3)
    expect(starsFor(7, 10)).toBe(2)
    expect(starsFor(6, 10)).toBe(2)
    expect(starsFor(5, 10)).toBe(1)
    expect(starsFor(0, 10)).toBe(1)
    expect(starsFor(0, 0)).toBe(3)
  })
})

describe('progress', () => {
  it('يسجل الدرس ويحتفظ بأفضل نتيجة', () => {
    let p = recordLesson(emptyProgress(), 'a', 5, 10, 1)
    expect(p.lessons.a.stars).toBe(1)
    p = recordLesson(p, 'a', 10, 10, 2)
    expect(p.lessons.a.stars).toBe(3)
    p = recordLesson(p, 'a', 3, 10, 3)
    expect(p.lessons.a.stars).toBe(3)
    expect(p.lessons.a.done).toBe(true)
    expect(totalStars(p)).toBe(3)
  })

  it('يسجل الاختبار ويحتفظ بأفضل درجة وعدد المحاولات', () => {
    let p = recordExam(emptyProgress(), 'e', 10, 20)
    p = recordExam(p, 'e', 15, 20)
    p = recordExam(p, 'e', 12, 20)
    expect(p.exams.e).toMatchObject({ best: 15, total: 20, attempts: 3 })
  })

  it('يحفظ ويحمّل من التخزين بالمفتاح المحدد', () => {
    const s = memStorage()
    const p = recordLesson(emptyProgress(), 'a', 10, 10)
    saveProgress(s, p)
    expect(Object.keys(s.data)).toEqual([STORAGE_KEY])
    expect(STORAGE_KEY).toBe('science-app:v1')
    expect(loadProgress(s)).toEqual(p)
  })

  it('يتجاهل البيانات التالفة', () => {
    expect(loadProgress(memStorage({ [STORAGE_KEY]: '{bad' }))).toEqual(emptyProgress())
    expect(loadProgress(memStorage({ [STORAGE_KEY]: '{"version":2}' }))).toEqual(emptyProgress())
    expect(loadProgress(null)).toEqual(emptyProgress())
  })

  it('تصدير واستيراد', () => {
    const p = recordExam(recordLesson(emptyProgress(), 'a', 8, 10), 'e', 5, 10)
    expect(importProgress(exportProgress(p))).toEqual(p)
    expect(importProgress('xx')).toBeNull()
    expect(importProgress('{"version":1,"lessons":{"a":{"stars":9,"done":true}},"exams":{}}')).toBeNull()
    expect(isValidProgress(null)).toBe(false)
  })
})
