// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { Home } from '../components/Home'
import { emptyProgress } from '../lib/progress'
import { emptyUi, toggle, type UiState } from '../lib/uiState'

afterEach(cleanup)

function Harness({ initial = emptyUi() }: { initial?: UiState }) {
  const [ui, setUi] = useState(initial)
  return <Home progress={emptyProgress()} ui={ui} onToggle={(k) => setUi((u) => toggle(u, k))} go={() => {}} />
}

const head = (text: RegExp) => screen.getAllByRole('button').find((b) => text.test(b.textContent ?? ''))!

describe('الصفحة الرئيسية القابلة للطي', () => {
  it('الفصل الأول مفتوح بوحداته مطوية، والثاني مطوي', () => {
    render(<Harness />)
    expect(head(/الفصل الدراسي الأول/).getAttribute('aria-expanded')).toBe('true')
    expect(head(/الفصل الدراسي الثاني/).getAttribute('aria-expanded')).toBe('false')
    expect(head(/العلم وتفاعلات الأجسام/).getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByText('العلم وعملياته')).toBeNull()
  })

  it('اختبارا الفصل خارج الوحدات وتحتها، ومراجعة الوحدة داخلها', () => {
    render(<Harness />)
    expect(screen.getByText('اختبار منتصف الفصل الدراسي الأول')).toBeTruthy()
    expect(screen.getByText('اختبار نهاية الفصل الدراسي الأول')).toBeTruthy()
    expect(screen.queryByText(/مراجعة الوحدة ١/)).toBeNull()
    fireEvent.click(head(/العلم وتفاعلات الأجسام/))
    expect(screen.getByText(/مراجعة الوحدة ١/)).toBeTruthy()
  })

  it('تطوى الوحدة وتفتح فصولها ثم دروسها', () => {
    render(<Harness />)
    fireEvent.click(head(/العلم وتفاعلات الأجسام/))
    expect(screen.getByText(/طبيعة العلم/)).toBeTruthy()
    expect(screen.queryByText('العلم وعملياته')).toBeNull()
    fireEvent.click(head(/طبيعة العلم/))
    expect(screen.getByText('العلم وعملياته')).toBeTruthy()
    fireEvent.click(head(/طبيعة العلم/))
    expect(screen.queryByText('العلم وعملياته')).toBeNull()
  })

  it('طيّ الفصل الدراسي يخفي كل شيء تحته بما فيه اختباراه', () => {
    render(<Harness />)
    fireEvent.click(head(/الفصل الدراسي الأول/))
    expect(screen.queryByText(/العلم وتفاعلات الأجسام/)).toBeNull()
    expect(screen.queryByText('اختبار منتصف الفصل الدراسي الأول')).toBeNull()
  })

  it('الفصل الثاني: اختبار المنتصف متاح بين الفصل ١٠ والفصل ١١ وخارج طيّ الوحدة، واختبار نهاية العام متاح', () => {
    render(<Harness />)
    fireEvent.click(head(/الفصل الدراسي الثاني/))
    expect(screen.getByText('اختبار منتصف الفصل الدراسي الثاني')).toBeTruthy()
    expect(screen.getByText('اختبار نهاية العام')).toBeTruthy()
    // ترتيب الظهور: الوحدة ٥ (الفصلان ٩–١٠) ثم المنتصف ثم تتمة الوحدة ٥ (الفصل ١١)
    const text = document.body.textContent ?? ''
    const u5 = text.indexOf('الوحدة ٥: تباين الحياة')
    const mid = text.indexOf('اختبار منتصف الفصل الدراسي الثاني')
    const rest = text.indexOf('الوحدة ٥ (تتمة)')
    expect(u5).toBeGreaterThan(-1)
    expect(mid).toBeGreaterThan(u5)
    expect(rest).toBeGreaterThan(mid)
    // طيّ الوحدة ٥ لا يخفي اختبار المنتصف
    fireEvent.click(head(/الوحدة ٥: تباين الحياة/))
    fireEvent.click(head(/الوحدة ٥: تباين الحياة/))
    expect(screen.getByText('اختبار منتصف الفصل الدراسي الثاني')).toBeTruthy()
  })

  it('الفصل الثاني: تتمة الوحدة ٥ ومراجعتها والوحدة ٦ بفصليها، والوحدة ٤ بفصليها ومراجعتها', () => {
    render(<Harness />)
    fireEvent.click(head(/الفصل الدراسي الثاني/))
    fireEvent.click(head(/الوحدة ٥ \(تتمة\)/))
    expect(screen.getByText(/الفصل ١١: الحيوانات الفقارية/)).toBeTruthy()
    expect(screen.getByText(/مراجعة الوحدة ٥/)).toBeTruthy()
    fireEvent.click(head(/الوحدة ٦: الحياة والبيئة/))
    expect(screen.getByText(/الفصل ١٢: علم البيئة/)).toBeTruthy()
    expect(screen.getByText(/الفصل ١٣: موارد الأرض/)).toBeTruthy()
    expect(screen.getByText(/مراجعة الوحدة ٦/)).toBeTruthy()
    expect(screen.queryByText(/دروس هذه الوحدة ستُضاف قريباً/)).toBeNull()
    fireEvent.click(head(/الوحدة ٤: ما وراء الأرض/))
    expect(screen.getByText(/الفصل ٧: الغلاف الجوي المتحرك/)).toBeTruthy()
    expect(screen.getByText(/الفصل ٨: استكشاف الفضاء/)).toBeTruthy()
    expect(screen.getByText(/مراجعة الوحدة ٤/)).toBeTruthy()
  })

  it('الوحدة ٣ تظهر بفصليها ومراجعتها، والفصل الأول فيه اختبار النهاية', () => {
    render(<Harness />)
    expect(screen.getByText(/الوحدة ٣: سطح الأرض المتغير/)).toBeTruthy()
    expect(screen.getByText('اختبار نهاية الفصل الدراسي الأول')).toBeTruthy()
    expect(screen.queryByText(/دروس هذه الوحدة ستُضاف قريباً/)).toBeNull()
  })
})
