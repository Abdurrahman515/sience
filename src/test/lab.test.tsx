// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import type { ComponentType } from 'react'
import { LAB_EXPERIMENTS, type BenchId } from '../lab/experiments'
import { BENCHES } from '../lab/benchMap'
import { LESSONS, getLesson } from '../content/registry'
import { optionsOf } from '../lib/exam'
import {
  BARO_DAYS, BLOCKS, COMMUNITIES, LAMP_SPOTS, LIQUIDS, STAR_SKY, STONES, TEMP_BANDS, WEB_EDGES, WEB_NODES, brickForces, density, genField, tempBand, trueDensity,
} from '../lab/labLogic'
import { CHEM_PARTS } from '../lab/benches2'
import { PLATES, PLATE_OFFSETS } from '../lab/benches3'
import { DISSECTIONS } from '../lab/benches5'
import { SLIDES } from '../lab/labLogic'
import type { BenchProps } from '../lab/benches1'
import { n } from '../lab/ui'

afterEach(cleanup)

const rangeEl = (c: HTMLElement, i: number) => c.querySelectorAll('input[type=range]')[i] as HTMLInputElement
const range = (c: HTMLElement, i: number, v: number) => fireEvent.change(rangeEl(c, i), { target: { value: String(v) } })
const click = (t: string | RegExp) => fireEvent.click(screen.getByText(t))
const role = (name: string) => screen.getByRole('button', { name })
function fill(label: string, value: string) {
  const input = screen.getByLabelText(label) as HTMLInputElement
  fireEvent.change(input, { target: { value } })
  fireEvent.click(within(input.closest('.numfield') as HTMLElement).getByText('تحقّقي'))
}

type Driver = (c: HTMLElement) => void
const DRIVERS: Record<BenchId, Driver> = {
  flasks: (c) => {
    click(/رجّي الدورق \(ب\)/); click(/رجّي الدورق \(أ\)/)
    click(/اسكبي نصف/); click(/رجّي الدورق \(ب\)/)
    for (const [chip] of [['رجّة واحدة'], ['رجّتان'], ['ثلاث رجّات']]) {
      click(chip); click(/رجّي الدورق \(أ\)/); range(c, 0, 40)
    }
  },
  weather: () => {
    const CITIES = [[-4, 'ثلج', 1], [3, 'مطر', 2], [12, 'غائم', 3], [25, 'مشمس', 4], [18, 'غائم جزئياً', 5], [8, 'غائم مع رعد', 6]] as const
    for (const [t, sym, id] of CITIES) {
      fireEvent.click(role(`المدينة ${n(id)}`))
      click(TEMP_BANDS[tempBand(t)]); click(sym); click('سجّلي في الجدول')
    }
    click('جبهة باردة')
  },
  marbles: () => {
    for (let i = 0; i < 3; i++) click(/أطلقي الكرتين/)
    fireEvent.click(screen.getByRole('button', { name: /ميل كبير/ }))
    click(/بدّلي مكان الانطلاق/)
    for (let i = 0; i < 3; i++) click(/أطلقي الكرتين/)
  },
  bricks: (c) => {
    for (const k of [1, 2, 3]) {
      fireEvent.click(screen.getByText(new RegExp(`^${n(k)} طوب`)))
      const { fs } = brickForces(k)
      range(c, 0, Math.ceil(fs * 2) / 2)
      range(c, 0, 0)
    }
  },
  density: () => {
    click(/قيسي الأبعاد/)
    for (const b of BLOCKS) fill(`كثافة المتوازي (${b.id})`, String(density(b.mass, b.dims[0] * b.dims[1] * b.dims[2])))
    click('أ و ج'); click(/اغمري الحجرين/)
    for (const s of STONES) fill(`كثافة ${s.id}`, String(density(s.mass, s.v1 - s.v0)))
  },
  chem: () => {
    for (const p of CHEM_PARTS) {
      click(`الجزء ${n(p.id)}`); click(/اخلطي المواد/)
      for (const s of p.signs) click(s)
      click('تأكيد الملاحظة')
    }
  },
  molecules: () => {
    const add = (name: string, k: number) => { for (let i = 0; i < k; i++) fireEvent.click(role(`زيادة ${name}`)) }
    add('هيدروجين', 2); add('أكسجين', 1); click(/ركّبي الجزيء/)
    add('أكسجين', 2); add('كربون', 1); click(/ركّبي الجزيء/)
    add('كربون', 1); add('هيدروجين', 4); click(/ركّبي الجزيء/)
  },
  mixtures: (c) => {
    range(c, 0, 3); click(/افصلي الحبيبات/)
    click(/رمل وماء/); click(/اخلطي الرمل/); click(/اتركيه يرسب/); click(/اسكبي الماء/)
    click(/ملح وماء/); click(/أذيبي الملح/); range(c, 0, 10)
  },
  alum: (c) => {
    click(/ضعي بذور الشب/); click(/اسكبي المحلول الساخن/); range(c, 0, 24)
    click(/تبريد سريع/); range(c, 0, 22); range(c, 0, 24)
  },
  sediments: (c) => {
    click(/رجّي البرطمان/); range(c, 0, 3)
    click(/رسوبيات كيميائية/); range(c, 0, 7); range(c, 1, 3)
    click(/التماسك/); click(/اخلطي وضعي/); range(c, 0, 4)
  },
  plates: (c) => {
    for (const p of PLATES) {
      const [dx, dy] = PLATE_OFFSETS[p.id]
      const g = screen.getByLabelText(`صفيحة ${p.name}`)
      for (let i = 0; i < Math.abs(dx) / 8; i++) fireEvent.keyDown(g, { key: dx < 0 ? 'ArrowRight' : 'ArrowLeft' })
      for (let i = 0; i < Math.abs(dy) / 8; i++) fireEvent.keyDown(g, { key: dy < 0 ? 'ArrowDown' : 'ArrowUp' })
    }
    expect(c.textContent).toContain('اكتملت الأحجية')
  },
  weathering: (c) => {
    for (const l of LIQUIDS) click(l.id)
    click(/تجوية كيميائية/); range(c, 0, 3)
    click(/تجوية ميكانيكية/); range(c, 0, 20)
    click('سكر + حصى'); range(c, 0, 20)
  },
  barometer: () => {
    for (const d of BARO_DAYS) { click(`اليوم ${n(d.day)}`); click(`📝 سجّلي قراءة اليوم ${n(d.day)}`) }
  },
  lamp: (c) => {
    for (const s of LAMP_SPOTS) { click(s.label); range(c, 0, 10) }
  },
  orbits: (c) => {
    for (const y of [1, 2, 3, 4]) { range(c, 0, y); click(/التقطي موقع الكواكب/) }
  },
  stars: () => {
    STAR_SKY.forEach((s, i) => { fireEvent.click(role(`نجم ${i + 1}`)); fireEvent.click(role(s.cls)) })
  },
  yeast: (c) => {
    range(c, 0, 60)
    click(/خميرة \+ ماء فقط/); range(c, 0, 60)
    click(/خميرة \+ محلول سكر/); fireEvent.click(screen.getByRole('button', { name: /ماء بارد/ })); range(c, 0, 60)
  },
  microscope: (c) => {
    for (const s of SLIDES) { click(s.name); range(c, 0, 1); range(c, 0, 3); click(s.answer) }
  },
  earthworm: () => dissect('earthworm'),
  grasshopper: () => dissect('grasshopper'),
  fish: () => dissect('fish'),
  arm: (c) => {
    range(c, 0, 100); range(c, 0, 0); fireEvent.click(role('ثلاثية الرؤوس'))
  },
  quadrats: () => {
    for (const x of COMMUNITIES) {
      click(`الجماعة (${x.id})`)
      for (const k of [1, 2, 3]) fireEvent.click(role(`مربع ${k}`))
    }
    fill('كثافة الجماعة (ج) بالأزهار لكل م²', String(trueDensity(genField(33, 9))))
    click(/^\(ج\)/)
  },
  foodweb: () => {
    const nm = (id: string) => WEB_NODES.find((x) => x.id === id)!.name
    for (const [a, b] of WEB_EDGES) { fireEvent.click(role(nm(a))); fireEvent.click(role(nm(b))) }
  },
  solar: (c) => {
    range(c, 0, 30)
    fireEvent.click(screen.getByRole('button', { name: /دهان أسود/ })); fireEvent.click(screen.getByRole('button', { name: /غطاء بلاستيك/ })); range(c, 0, 30)
  },
  greenhouse: (c) => {
    click(/جهّزي \(ب\)/); click(/غطّي الزجاجتين/); click(/شغّلي المصباح/); range(c, 0, 30)
  },
}
function dissect(id: keyof typeof DISSECTIONS) {
  const def = DISSECTIONS[id]
  for (let i = 0; i < def.steps.length; i++) click('نفّذي ✂️')
  def.organs.forEach((o, i) => {
    fireEvent.click(role(`العضو ${i + 1}`))
    fireEvent.click(role(o.name))
  })
}

describe('سجل التجارب', () => {
  it('٢٦ تجربة مرقّمة بلا تكرار، ولكل منها منصّة عمل', () => {
    expect(LAB_EXPERIMENTS).toHaveLength(26)
    expect(LAB_EXPERIMENTS.map((e) => e.num)).toEqual(Array.from({ length: 26 }, (_, i) => i + 1))
    expect(new Set(LAB_EXPERIMENTS.map((e) => e.id)).size).toBe(26)
    expect(new Set(LAB_EXPERIMENTS.map((e) => e.bench)).size).toBe(26)
    for (const e of LAB_EXPERIMENTS) expect(BENCHES[e.bench], e.id).toBeTruthy()
  })
  it('كل تجربة مرتبطة بدرس موجود في الفصل والوحدة نفسيهما', () => {
    for (const e of LAB_EXPERIMENTS) {
      const l = getLesson(e.after.lessonId)
      expect(l, e.id).toBeTruthy()
      expect(l!.chapter, e.id).toBe(e.chapter)
      expect(l!.unit, e.id).toBe(e.unit)
      expect(e.after.label).toContain('بعد')
    }
  })
  it('ترتيب التجارب يتبع ترتيب الفصول، وكل فصل فيه تجربتان', () => {
    for (let i = 1; i < LAB_EXPERIMENTS.length; i++) expect(LAB_EXPERIMENTS[i].chapter).toBeGreaterThanOrEqual(LAB_EXPERIMENTS[i - 1].chapter)
    for (let ch = 1; ch <= 13; ch++) expect(LAB_EXPERIMENTS.filter((e) => e.chapter === ch).map((e) => e.no)).toEqual([1, 2])
    expect(LESSONS.length).toBeGreaterThan(0)
  })
  it('أسئلة الاستنتاج سليمة: معرّفات فريدة، خيارات متمايزة، صحيحة واحدة', () => {
    const ids = new Set<string>()
    for (const e of LAB_EXPERIMENTS) {
      expect(e.questions.length, e.id).toBeGreaterThanOrEqual(3)
      expect(e.goal.length).toBeGreaterThan(10)
      expect(e.steps.length).toBeGreaterThanOrEqual(3)
      expect(e.materials.length).toBeGreaterThan(1)
      for (const q of e.questions) {
        expect(ids.has(q.id), q.id).toBe(false)
        ids.add(q.id)
        const opts = optionsOf(q)
        expect(new Set(opts).size, q.id).toBe(opts.length)
        expect(opts.filter((o) => o === q.correct)).toHaveLength(1)
        expect(q.wrongs.length, q.id).toBeGreaterThanOrEqual(2)
      }
    }
  })
})

describe('كل منصّة تُنجَز بالخطوات الصحيحة (ولا تنتهي مبكراً)', () => {
  for (const e of LAB_EXPERIMENTS) {
    it(`${e.num}. ${e.title}`, () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)
      const onDone = vi.fn()
      const Bench = BENCHES[e.bench] as ComponentType<BenchProps>
      const { container } = render(<Bench onDone={onDone} />)
      expect(screen.getByLabelText('مراحل التجربة')).toBeTruthy()
      expect(onDone).not.toHaveBeenCalled()
      DRIVERS[e.bench](container)
      expect(onDone, 'يجب أن تكتمل بعد كل المراحل').toHaveBeenCalledTimes(1)
      vi.restoreAllMocks()
    })
  }
})

describe('سلوك خاص', () => {
  it('الدورقان: لا ينتهي قبل قياس الأزمنة الثلاثة', () => {
    const onDone = vi.fn()
    const Bench = BENCHES.flasks
    render(<Bench onDone={onDone} />)
    click(/رجّي الدورق \(أ\)/); click(/رجّي الدورق \(ب\)/); click(/اسكبي نصف/); click(/رجّي الدورق \(ب\)/)
    expect(onDone).not.toHaveBeenCalled()
  })
  it('الكثافة: رقم خاطئ لا يُقبل ويعطي تلميحاً', () => {
    const Bench = BENCHES.density
    render(<Bench onDone={() => {}} />)
    click(/قيسي الأبعاد/)
    fill('كثافة المتوازي (أ)', '5')
    expect(screen.getByText(/احسبي الحجم أولاً/)).toBeTruthy()
  })
  it('الجزيئات: عدد خاطئ لا يركّب الجزيء ويعطي تلميحاً', () => {
    const Bench = BENCHES.molecules
    render(<Bench onDone={() => {}} />)
    fireEvent.click(role('زيادة هيدروجين')); click(/ركّبي الجزيء/)
    expect(screen.getByText(/لا يوجد مركّب بهذا العدد/)).toBeTruthy()
  })
  it('الشبكة الغذائية: عكس السهم يعطي تلميحاً', () => {
    const Bench = BENCHES.foodweb
    render(<Bench onDone={() => {}} />)
    fireEvent.click(role('الجراد')); fireEvent.click(role('العشب'))
    expect(screen.getByText(/اعكسي الاتجاه/)).toBeTruthy()
  })
  it('النجوم: تصنيف خاطئ لا يُسجَّل', () => {
    const Bench = BENCHES.stars
    render(<Bench onDone={() => {}} />)
    fireEvent.click(role('نجم 1')); fireEvent.click(role(STAR_SKY[0].cls === 'M' ? 'O' : 'M'))
    expect(screen.getByText(/قارني درجة حرارة سطح النجم/)).toBeTruthy()
  })
  it('الأحجية: القطعة الموضوعة لا تتحرك بعد ذلك', () => {
    const Bench = BENCHES.plates
    const { container } = render(<Bench onDone={() => {}} />)
    const g = screen.getByLabelText('صفيحة الهادئ')
    const [dx, dy] = PLATE_OFFSETS.pacific
    for (let i = 0; i < Math.abs(dx) / 8; i++) fireEvent.keyDown(g, { key: 'ArrowRight' })
    for (let i = 0; i < Math.abs(dy) / 8; i++) fireEvent.keyDown(g, { key: dy < 0 ? 'ArrowDown' : 'ArrowUp' })
    fireEvent.keyDown(g, { key: 'ArrowLeft' })
    expect(container.textContent).toContain('تم وضع ١ من ٧')
  })
  it('الميتوكندريا: لا ينتهي بتجربة واحدة فقط', () => {
    const onDone = vi.fn()
    const Bench = BENCHES.yeast
    const { container } = render(<Bench onDone={onDone} />)
    range(container, 0, 60)
    expect(onDone).not.toHaveBeenCalled()
  })
})
