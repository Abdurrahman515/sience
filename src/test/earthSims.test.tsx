// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { BalanceSim, MOHS_TOOLS, MOTIONS, MohsSim, PLATE_RESULT, PlatesSim, mohsBounds, submergedPercent } from '../components/widgets/EarthSims'

afterEach(cleanup)

describe('حدود قساوة اختبار موهس', () => {
  it('عيّنة قساوتها ٤ بين قطعة النقد والمسمار', () => {
    const all = MOHS_TOOLS.map((t) => t.name)
    expect(mohsBounds(4, all)).toEqual({ lower: 3, upper: 4.5 })
  })
  it('عيّنة أقسى من كل الأدوات: لا حدّ أعلى', () => {
    expect(mohsBounds(7, MOHS_TOOLS.map((t) => t.name))).toEqual({ lower: 6.5, upper: null })
  })
  it('عيّنة طرية جداً: لا حدّ أدنى', () => {
    expect(mohsBounds(1, MOHS_TOOLS.map((t) => t.name))).toEqual({ lower: null, upper: 2.5 })
  })
  it('بدون تجارب لا حدود', () => {
    expect(mohsBounds(4, [])).toEqual({ lower: null, upper: null })
  })
})

describe('MohsSim', () => {
  it('لا ينتهي قبل تجربة كل الأدوات، وينتهي مرة واحدة بعدها', () => {
    const onDone = vi.fn()
    render(<MohsSim spec={{ kind: 'mohs', hardness: 4 }} onDone={onDone} />)
    MOHS_TOOLS.slice(0, 4).forEach((t) => fireEvent.click(screen.getByText(`جرّبي ${t.name}`)))
    expect(onDone).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText(`جرّبي ${MOHS_TOOLS[4].name}`))
    fireEvent.click(screen.getByText(`جرّبي ${MOHS_TOOLS[4].name}`))
    expect(onDone).toHaveBeenCalledTimes(1)
    expect(screen.getByText(/قساوة العيّنة بين/)).toBeTruthy()
  })
  it('تخدش الأداة الأقسى فقط', () => {
    render(<MohsSim spec={{ kind: 'mohs', hardness: 4 }} onDone={() => {}} />)
    fireEvent.click(screen.getByText('جرّبي الظفر'))
    fireEvent.click(screen.getByText('جرّبي مسمار الحديد'))
    expect(screen.getByText(/الظفر.*ما خدشت/)).toBeTruthy()
    expect(screen.getByText(/مسمار الحديد.*خدشت العيّنة/)).toBeTruthy()
  })
})

describe('PlatesSim', () => {
  it('الإجابة الخاطئة تعطي تلميحاً بلا إنهاء ولا انتقال', () => {
    const onDone = vi.fn()
    render(<PlatesSim spec={{ kind: 'plates', goals: ['divergent', 'transform'] }} onDone={onDone} />)
    fireEvent.click(screen.getByText('تتقاربان'))
    expect(screen.getByText(/هاد مو المطلوب/)).toBeTruthy()
    expect(screen.queryByText('المهمة التالية')).toBeNull()
    expect(onDone).not.toHaveBeenCalled()
  })
  it('تنتهي بعد حل كل المهام بالترتيب', () => {
    const onDone = vi.fn()
    const goals = ['divergent', 'convergent', 'transform'] as const
    render(<PlatesSim spec={{ kind: 'plates', goals: [...goals] }} onDone={onDone} />)
    goals.forEach((g, i) => {
      fireEvent.click(screen.getByText(MOTIONS.find((m) => m.id === g)!.label))
      expect(screen.getByText(new RegExp(PLATE_RESULT[g].slice(0, 12)))).toBeTruthy()
      if (i < goals.length - 1) fireEvent.click(screen.getByText('المهمة التالية'))
    })
    expect(onDone).toHaveBeenCalledTimes(1)
  })
})

describe('BalanceSim', () => {
  it('الغمر يزداد بزيادة الحمل', () => {
    expect(submergedPercent(10)).toBeGreaterThan(submergedPercent(5))
    expect(submergedPercent(5)).toBeGreaterThan(submergedPercent(0))
  })
  it('لا ينتهي بمجرد زيادة الحمل، بل بعد إزالته أيضاً', () => {
    const onDone = vi.fn()
    const { container } = render(<BalanceSim onDone={onDone} />)
    const r = container.querySelector('input[type=range]') as HTMLInputElement
    fireEvent.change(r, { target: { value: '9' } })
    expect(onDone).not.toHaveBeenCalled()
    fireEvent.change(r, { target: { value: '0' } })
    expect(onDone).toHaveBeenCalledTimes(1)
  })
  it('إزالة الحمل قبل رفعه لا تنهي المهمة', () => {
    const onDone = vi.fn()
    const { container } = render(<BalanceSim onDone={onDone} />)
    const r = container.querySelector('input[type=range]') as HTMLInputElement
    fireEvent.change(r, { target: { value: '0' } })
    expect(onDone).not.toHaveBeenCalled()
  })
})
