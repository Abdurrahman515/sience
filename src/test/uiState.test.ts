import { describe, expect, it } from 'vitest'
import { STORAGE_KEY, type StorageLike } from '../lib/progress'
import { UI_STORAGE_KEY, chapterKey, defaultOpen, emptyUi, isOpen, loadUi, saveUi, semesterKey, toggle, unitKey } from '../lib/uiState'

function mem(init: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...init }
  return { data, getItem: (k) => data[k] ?? null, setItem: (k, v) => void (data[k] = v) }
}

describe('uiState', () => {
  it('مفتاح الحفظ مختلف عن مفتاح التقدم', () => {
    expect(UI_STORAGE_KEY).not.toBe(STORAGE_KEY)
    expect(UI_STORAGE_KEY).toBe('science-app:ui:v1')
  })
  it('الافتراضي: الفصل الأول مفتوح وكل ما عداه مطوي', () => {
    const ui = emptyUi()
    expect(isOpen(ui, semesterKey(1))).toBe(true)
    expect(isOpen(ui, semesterKey(2))).toBe(false)
    expect(isOpen(ui, unitKey(1))).toBe(false)
    expect(isOpen(ui, chapterKey(1))).toBe(false)
    expect(defaultOpen('x')).toBe(false)
  })
  it('يبدّل الطي لكل عنصر بشكل مستقل', () => {
    let ui = toggle(emptyUi(), unitKey(1))
    expect(isOpen(ui, unitKey(1))).toBe(true)
    expect(isOpen(ui, unitKey(2))).toBe(false)
    ui = toggle(ui, semesterKey(1))
    expect(isOpen(ui, semesterKey(1))).toBe(false)
    ui = toggle(ui, semesterKey(1))
    expect(isOpen(ui, semesterKey(1))).toBe(true)
  })
  it('يحفظ ويستعيد آخر حالة', () => {
    const s = mem()
    const ui = toggle(toggle(emptyUi(), chapterKey(3)), semesterKey(1))
    saveUi(s, ui)
    expect(Object.keys(s.data)).toEqual([UI_STORAGE_KEY])
    expect(loadUi(s)).toEqual(ui)
  })
  it('يتجاهل البيانات التالفة أو الغريبة', () => {
    expect(loadUi(mem({ [UI_STORAGE_KEY]: '{bad' }))).toEqual(emptyUi())
    expect(loadUi(mem({ [UI_STORAGE_KEY]: '{"version":9}' }))).toEqual(emptyUi())
    expect(loadUi(null)).toEqual(emptyUi())
    expect(loadUi(mem({ [UI_STORAGE_KEY]: '{"version":1,"open":{"a":true,"b":"x"}}' }))).toEqual({ version: 1, open: { a: true } })
  })
})
