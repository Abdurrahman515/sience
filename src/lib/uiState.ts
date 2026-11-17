import type { StorageLike } from './progress'

/** مفتاح مستقل عن مفتاح التقدم (science-app:v1) */
export const UI_STORAGE_KEY = 'science-app:ui:v1'

export interface UiState {
  version: 1
  /** مفتاح العنصر القابل للطي ← مفتوح (true) أو مطوي (false) */
  open: Record<string, boolean>
}

export const emptyUi = (): UiState => ({ version: 1, open: {} })

export const semesterKey = (id: number) => `s${id}`
export const unitKey = (id: number) => `u${id}`
export const chapterKey = (id: number) => `c${id}`

/** الحالة الافتراضية: الفصل الأول مفتوح فقط، وكل ما عداه مطوي. */
export function defaultOpen(key: string): boolean {
  return key === semesterKey(1)
}

export function isOpen(ui: UiState, key: string): boolean {
  return ui.open[key] ?? defaultOpen(key)
}

export function toggle(ui: UiState, key: string): UiState {
  return { ...ui, open: { ...ui.open, [key]: !isOpen(ui, key) } }
}

export function loadUi(storage: StorageLike | null): UiState {
  if (!storage) return emptyUi()
  try {
    const raw = storage.getItem(UI_STORAGE_KEY)
    if (!raw) return emptyUi()
    const p = JSON.parse(raw) as Partial<UiState>
    if (p?.version !== 1 || !p.open || typeof p.open !== 'object') return emptyUi()
    const open: Record<string, boolean> = {}
    for (const [k, v] of Object.entries(p.open)) if (typeof v === 'boolean') open[k] = v
    return { version: 1, open }
  } catch {
    return emptyUi()
  }
}

export function saveUi(storage: StorageLike | null, ui: UiState): void {
  try {
    storage?.setItem(UI_STORAGE_KEY, JSON.stringify(ui))
  } catch {
    /* تجاهل */
  }
}
