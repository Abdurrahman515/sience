// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MOON_PHASES, MOON_START, MoonSim, ORBIT_SPOTS, SEASON_NAME, SeasonsSim } from '../components/widgets/SpaceSims'

afterEach(cleanup)

const slider = (c: HTMLElement) => c.querySelector('input[type=range]') as HTMLInputElement

describe('أطوار القمر', () => {
  it('ثمانية أطوار بأسماء وأيقونات فريدة، والبداية ليست محاقاً ولا بدراً', () => {
    expect(MOON_PHASES.length).toBe(8)
    expect(new Set(MOON_PHASES.map((p) => p.name)).size).toBe(8)
    expect(new Set(MOON_PHASES.map((p) => p.icon)).size).toBe(8)
    expect(MOON_PHASES[0].name).toBe('المحاق')
    expect(MOON_PHASES[4].name).toBe('البدر')
    expect(MOON_START).not.toBe(0)
    expect(MOON_START).not.toBe(4)
  })
  it('لا ينتهي قبل الوصول لكل الأطوار، وينتهي مرة واحدة', () => {
    const onDone = vi.fn()
    const { container } = render(<MoonSim spec={{ kind: 'moon', goals: [4, 0] }} onDone={onDone} />)
    fireEvent.change(slider(container), { target: { value: '3' } })
    expect(screen.getByText(/جرّبي موضع تاني/)).toBeTruthy()
    expect(onDone).not.toHaveBeenCalled()
    fireEvent.change(slider(container), { target: { value: '4' } })
    expect(screen.getByText('المهمة التالية')).toBeTruthy()
    expect(onDone).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('المهمة التالية'))
    fireEvent.change(slider(container), { target: { value: '0' } })
    expect(onDone).toHaveBeenCalledTimes(1)
  })
  it('بعد المهمة التالية يرجع القمر لموضع البداية', () => {
    const { container } = render(<MoonSim spec={{ kind: 'moon', goals: [4, 0] }} onDone={() => {}} />)
    fireEvent.change(slider(container), { target: { value: '4' } })
    fireEvent.click(screen.getByText('المهمة التالية'))
    expect(slider(container).value).toBe(String(MOON_START))
  })
})

describe('فصول السنة', () => {
  it('أربعة مواقع تقابل الفصول الأربعة', () => {
    expect(ORBIT_SPOTS.map((s) => s.id).sort()).toEqual(['autumn', 'spring', 'summer', 'winter'])
    expect(SEASON_NAME.summer).toBe('الصيف')
  })
  it('اختيار خاطئ يُفسَّر ولا ينهي، والصحيح ينهي مرة واحدة بعد آخر مهمة', () => {
    const onDone = vi.fn()
    render(<SeasonsSim spec={{ kind: 'seasons', goals: ['summer', 'winter'] }} onDone={onDone} />)
    fireEvent.click(screen.getByText('كانون الأول (ديسمبر)'))
    expect(screen.getByText(/بيكون عندنا/)).toBeTruthy()
    fireEvent.click(screen.getByText('حزيران (يونيو)'))
    expect(onDone).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('المهمة التالية'))
    fireEvent.click(screen.getByText('كانون الأول (ديسمبر)'))
    expect(onDone).toHaveBeenCalledTimes(1)
  })
})
