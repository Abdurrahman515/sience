// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { LessonPlayer } from '../components/LessonPlayer'
import { LESSONS } from '../content/registry'
import type { Block, Lesson } from '../content/types'
import { display } from '../lib/arabicText'
import { MOHS_TOOLS, MOTIONS } from '../components/widgets/EarthSims'
import { ORBIT_SPOTS } from '../components/widgets/SpaceSims'
import { LEVER_CLASSES, PULLEY_LOAD, SCREW_CIRC } from '../components/widgets/MachineSims'
import { generate } from '../lib/generators'
import { mulberry32 } from '../lib/rng'

const FIXED_SEED = Math.floor(0.5 * 1e9)

beforeEach(() => {
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const btn = (text: string) => screen.getAllByRole('button').find((b) => b.textContent === display(text))

function setRange(container: HTMLElement, idx: number, value: number) {
  const r = container.querySelectorAll('input[type=range]')[idx] as HTMLInputElement
  fireEvent.change(r, { target: { value: String(value) } })
}

function solve(block: Block, root: HTMLElement) {
  const container = Array.from(root.querySelectorAll<HTMLElement>('.block-wrap')).pop() ?? root
  switch (block.type) {
    case 'say':
      return
    case 'quiz': {
      const b = Array.from(container.querySelectorAll('button')).find((x) => x.textContent === display(block.question.correct))
      expect(b, block.question.id).toBeTruthy()
      fireEvent.click(b!)
      return
    }
    case 'reveal': {
      const flips = container.querySelectorAll('button.flip')
      flips.forEach((f) => fireEvent.click(f))
      return
    }
    case 'practice': {
      const rng = mulberry32(FIXED_SEED)
      const seen = new Set<string>()
      const qs = []
      let guard = 0
      while (qs.length < block.count && guard++ < 50) {
        const q = generate(block.gen, rng, `${block.gen}-${qs.length}`)
        if (!seen.has(q.q)) {
          seen.add(q.q)
          qs.push(q)
        }
      }
      qs.forEach((q, i) => {
        const input = screen.getByLabelText('إجابتك')
        fireEvent.change(input, { target: { value: String(q.answer) } })
        fireEvent.click(screen.getByText('تحقّقي'))
        fireEvent.click(screen.getByText(i + 1 >= qs.length ? 'خلصنا ✔' : 'المسألة التالية'))
      })
      return
    }
    case 'widget': {
      const w = block.widget
      if (w.kind === 'sort') {
        w.items.forEach((it) => {
          fireEvent.click(btn(it.text)!)
          const titles = container.querySelectorAll('button.bucket-title')
          fireEvent.click(titles[it.cat])
        })
      } else if (w.kind === 'order') {
        w.steps.forEach((s) => fireEvent.click(btn(s)!))
      } else if (w.kind === 'speed') {
        setRange(container, 0, w.target)
        setRange(container, 1, 1)
      } else if (w.kind === 'force') {
        setRange(container, 1, 5)
        setRange(container, 0, w.target * 5)
      } else if (w.kind === 'ramp') {
        setRange(container, 0, 1)
        setRange(container, 1, w.target)
      } else if (w.kind === 'molecules') {
        const add = (name: string, k: number) => { for (let i = 0; i < k; i++) fireEvent.click(screen.getByRole('button', { name: `زيادة ${name}` })) }
        add('هيدروجين', 2); add('أكسجين', 1); fireEvent.click(btn('🔗 ركّبي الجزيء')!)
        add('أكسجين', 2); add('كربون', 1); fireEvent.click(btn('🔗 ركّبي الجزيء')!)
        add('كربون', 1); add('هيدروجين', 4); fireEvent.click(btn('🔗 ركّبي الجزيء')!)
      } else if (w.kind === 'foodweb') {
        const edges: [string, string][] = [['العشب', 'الجراد'], ['العشب', 'الفأر'], ['الجراد', 'الضب'], ['الفأر', 'الأفعى'], ['الضب', 'الصقر'], ['الأفعى', 'الصقر'], ['الفأر', 'الصقر']]
        for (const [a, b] of edges) { fireEvent.click(screen.getByRole('button', { name: a })); fireEvent.click(screen.getByRole('button', { name: b })) }
      } else if (w.kind === 'orbits') {
        for (const y of [1, 2, 3, 4]) { setRange(container, 0, y); fireEvent.click(screen.getByText(/التقطي موقع الكواكب/)) }
      } else if (w.kind === 'lever') {
        LEVER_CLASSES.forEach((c) => {
          fireEvent.click(btn(c.label.replace('✅ ', ''))!)
          setRange(container, 1, 300)
        })
      } else if (w.kind === 'pulley') {
        const strands = Math.ceil(PULLEY_LOAD / w.target)
        fireEvent.click(btn(['بكرة ثابتة', 'بكرة متحركة', 'نظام ٣ حبال', 'نظام ٤ حبال'][strands - 1])!)
        setRange(container, 0, 80)
      } else if (w.kind === 'wheel') {
        setRange(container, 1, 1)
        setRange(container, 0, w.target)
        setRange(container, 2, 720)
      } else if (w.kind === 'wedge') {
        setRange(container, 1, 1)
        setRange(container, 0, w.target)
        setRange(container, 2, 100)
      } else if (w.kind === 'screw') {
        setRange(container, 0, Math.floor(SCREW_CIRC / w.target))
        setRange(container, 1, 20)
      } else if (w.kind === 'density') {
        setRange(container, 0, 2 * w.target)
        setRange(container, 1, 2)
      } else if (w.kind === 'atom') {
        setRange(container, 0, w.protons)
        setRange(container, 1, w.neutrons)
      } else if (w.kind === 'mohs') {
        MOHS_TOOLS.forEach((t) => fireEvent.click(btn(`جرّبي ${t.name}`)!))
      } else if (w.kind === 'plates') {
        w.goals.forEach((g, i) => {
          fireEvent.click(btn(MOTIONS.find((m) => m.id === g)!.label)!)
          if (i < w.goals.length - 1) fireEvent.click(screen.getByText('المهمة التالية'))
        })
      } else if (w.kind === 'moon') {
        w.goals.forEach((g, i) => {
          setRange(container, 0, g)
          if (i < w.goals.length - 1) fireEvent.click(screen.getByText('المهمة التالية'))
        })
      } else if (w.kind === 'seasons') {
        w.goals.forEach((g, i) => {
          fireEvent.click(btn(ORBIT_SPOTS.find((o) => o.id === g)!.label)!)
          if (i < w.goals.length - 1) fireEvent.click(screen.getByText('المهمة التالية'))
        })
      } else if (w.kind === 'balance') {
        setRange(container, 0, 10)
        setRange(container, 0, 0)
      } else if (w.kind === 'states') {
        setRange(container, 0, -50)
        setRange(container, 0, 150)
      }
      return
    }
  }
}

function walk(lesson: Lesson) {
  const onFinish = vi.fn()
  const { container } = render(<LessonPlayer lesson={lesson} onFinish={onFinish} onExit={() => {}} />)
  lesson.blocks.forEach((b, i) => {
    if (i > 0) act(() => void fireEvent.click(screen.getByText('كمّلي ←')))
    solve(b, container)
  })
  return { onFinish }
}

describe('تمشية كاملة على كل الدروس', () => {
  it.each(LESSONS.map((l) => [l.id, l] as const))('%s', (_id, lesson) => {
    const { onFinish } = walk(lesson)
    expect(screen.getByText('🎉 خلصتِ الدرس!')).toBeTruthy()
    expect(onFinish).toHaveBeenCalledTimes(1)
    const [firstTry, total] = onFinish.mock.calls[0]
    expect(total).toBeGreaterThan(0)
    expect(firstTry).toBe(total)
  })
})
