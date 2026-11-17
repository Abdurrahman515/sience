// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import {
  LEVER_LOAD, LeverSim, PULLEY_LOAD, PulleySim, ScrewSim, WedgeSim, WheelSim, leverGeometry, leverNeeded, pulleyEffort,
} from '../components/widgets/MachineSims'

afterEach(cleanup)
const range = (c: HTMLElement, i: number, v: number) =>
  fireEvent.change(c.querySelectorAll('input[type=range]')[i], { target: { value: String(v) } })

describe('الرافعة', () => {
  it('رياضيات الأنواع الثلاثة', () => {
    expect(leverGeometry(1, 5)).toEqual({ fulcrum: 5, load: 1, effort: 9 })
    expect(leverNeeded(1, 5)).toBeCloseTo(40)
    expect(leverNeeded(1, 2)).toBeCloseTo((LEVER_LOAD * 1) / 7)
    expect(leverNeeded(2, 5)).toBeCloseTo(20) // فائدة آلية = ٢
    for (let p = 2; p <= 8; p++) expect(leverNeeded(2, p)).toBeLessThan(LEVER_LOAD) // النوع الثاني دائماً أكبر من ١
    for (let p = 2; p <= 8; p++) expect(leverNeeded(3, p)).toBeGreaterThan(LEVER_LOAD) // الثالث أقل من ١
  })
  it('لا ينتهي حتى ترفع الحمل بالأنواع الثلاثة', () => {
    const onDone = vi.fn()
    const { container } = render(<LeverSim spec={{ kind: 'lever' }} onDone={onDone} />)
    range(container, 1, 300)
    expect(onDone).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('النوع الثاني'))
    range(container, 1, 300)
    expect(onDone).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('النوع الثالث'))
    range(container, 1, 300)
    expect(onDone).toHaveBeenCalledTimes(1)
  })
  it('قوة ضعيفة لا ترفع', () => {
    const onDone = vi.fn()
    const { container } = render(<LeverSim spec={{ kind: 'lever' }} onDone={onDone} />)
    range(container, 1, 5)
    expect(screen.queryByText(/رفعتي الحمل بالأنواع الثلاثة/)).toBeNull()
  })
})

describe('البكرات', () => {
  it('القوة = الحمل ÷ عدد الحبال', () => {
    expect(pulleyEffort(1)).toBe(PULLEY_LOAD)
    expect(pulleyEffort(4)).toBe(30)
  })
  it('بكرة ثابتة لا تحقق هدف ٤٠ نيوتن حتى لو وصل الحمل', () => {
    const onDone = vi.fn()
    const { container } = render(<PulleySim spec={{ kind: 'pulley', target: 40 }} onDone={onDone} />)
    range(container, 0, 80)
    expect(onDone).not.toHaveBeenCalled()
    expect(screen.getByText(/جرّبي نظاماً فيه حبال أكتر/)).toBeTruthy()
  })
  it('ثلاثة حبال تحقق الهدف عند وصول الحمل للأعلى فقط', () => {
    const onDone = vi.fn()
    const { container } = render(<PulleySim spec={{ kind: 'pulley', target: 40 }} onDone={onDone} />)
    fireEvent.click(screen.getByText('نظام ٣ حبال'))
    range(container, 0, 30)
    expect(onDone).not.toHaveBeenCalled()
    range(container, 0, 60)
    expect(onDone).toHaveBeenCalledTimes(1)
  })
  it('تغيير النظام يعيد الحبل إلى الصفر', () => {
    const { container } = render(<PulleySim spec={{ kind: 'pulley', target: 40 }} onDone={() => {}} />)
    range(container, 0, 40)
    fireEvent.click(screen.getByText('بكرة متحركة'))
    expect((container.querySelectorAll('input[type=range]')[0] as HTMLInputElement).value).toBe('0')
  })
})

describe('العجلة والمحور', () => {
  it('يلزم فائدة كافية ولفّة كاملة', () => {
    const onDone = vi.fn()
    const { container } = render(<WheelSim spec={{ kind: 'wheel', target: 4 }} onDone={onDone} />)
    range(container, 2, 720)
    expect(onDone).not.toHaveBeenCalled() // الفائدة الابتدائية ١٫٥
    range(container, 1, 1)
    range(container, 0, 4)
    expect(onDone).toHaveBeenCalledTimes(1)
  })
  it('لا ينتهي دون لفّ', () => {
    const onDone = vi.fn()
    const { container } = render(<WheelSim spec={{ kind: 'wheel', target: 4 }} onDone={onDone} />)
    range(container, 1, 1)
    range(container, 0, 8)
    expect(onDone).not.toHaveBeenCalled()
  })
})

describe('الإسفين', () => {
  it('يتطلب الطول والعرض والدفع حتى النهاية', () => {
    const onDone = vi.fn()
    const { container } = render(<WedgeSim spec={{ kind: 'wedge', target: 6 }} onDone={onDone} />)
    range(container, 2, 100)
    expect(onDone).not.toHaveBeenCalled() // ٤÷٢ = ٢
    range(container, 1, 1)
    range(container, 0, 6)
    expect(onDone).toHaveBeenCalledTimes(1)
  })
})

describe('البرغي', () => {
  it('السنون المتباعدة لا تكفي', () => {
    const onDone = vi.fn()
    const { container } = render(<ScrewSim spec={{ kind: 'screw', target: 6 }} onDone={onDone} />)
    range(container, 1, 20)
    expect(onDone).not.toHaveBeenCalled() // ٢٤÷٨ = ٣
    range(container, 0, 4)
    expect(onDone).toHaveBeenCalledTimes(1)
  })
  it('لا ينتهي قبل غرز البرغي كله', () => {
    const onDone = vi.fn()
    const { container } = render(<ScrewSim spec={{ kind: 'screw', target: 6 }} onDone={onDone} />)
    range(container, 0, 4)
    range(container, 1, 2)
    expect(onDone).not.toHaveBeenCalled()
    range(container, 1, 5)
    expect(onDone).toHaveBeenCalledTimes(1)
  })
})
