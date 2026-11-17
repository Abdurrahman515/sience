import { describe, expect, it } from 'vitest'
import { GENERATORS, checkNumeric, generate } from '../lib/generators'
import { mulberry32 } from '../lib/rng'
import type { GenId } from '../content/types'

const ids = Object.keys(GENERATORS) as GenId[]

describe('generators', () => {
  it.each(ids)('%s: إجابة صحيحة ومنطقية لعدة بذور', (gen) => {
    for (let seed = 1; seed <= 60; seed++) {
      const q = generate(gen, mulberry32(seed), `${gen}-${seed}`)
      expect(Number.isFinite(q.answer)).toBe(true)
      expect(q.answer).toBeGreaterThan(0)
      expect(checkNumeric(q, q.answer).ok).toBe(true)
      expect(checkNumeric(q, q.answer + 7).ok).toBe(false)
      expect(q.law).toBeTruthy()
      expect(q.sub).toBeTruthy()
      for (const m of q.mistakes ?? []) {
        expect(Math.abs(m.value - q.answer)).toBeGreaterThan(0.011)
        expect(m.why.length).toBeGreaterThan(5)
      }
    }
  })

  it('قابلة للتكرار بنفس البذرة', () => {
    const a = generate('avgSpeed', mulberry32(5), 'x')
    const b = generate('avgSpeed', mulberry32(5), 'x')
    expect(a.q).toBe(b.q)
  })

  it('السرعة المتوسطة تساوي المسافة ÷ الزمن', () => {
    const q = generate('avgSpeed', mulberry32(3), 'x')
    const nums = (q.q.match(/\d+/g) ?? []).map(Number)
    expect(nums[0] / nums[1]).toBe(q.answer)
  })

  it('يكتشف الخطأ الشائع ويرجع تفسيره', () => {
    const q = generate('accFromForce', mulberry32(2), 'x')
    const mistake = q.mistakes![0]
    const r = checkNumeric(q, mistake.value)
    expect(r.ok).toBe(false)
    expect(r.why).toBe(mistake.why)
  })

  it('الوزن: ٩٫٨ × الكتلة', () => {
    for (let s = 1; s < 30; s++) {
      const q = generate('weight', mulberry32(s), 'w')
      const m = Number(q.q.match(/\d+/)![0])
      expect(q.answer).toBeCloseTo(m * 9.8, 5)
    }
  })

  it('عدد النيوترونات = العدد الكتلي − البروتونات', () => {
    for (let s = 1; s < 30; s++) {
      const q = generate('neutrons', mulberry32(s), 'n')
      const nums = (q.q.match(/\d+/g) ?? []).map(Number)
      expect(q.answer).toBe(nums[0] - nums[1])
    }
  })
})

describe('مولّدات الوحدة ٣', () => {
  const rng = (seed: number) => mulberry32(seed)
  it('plateDrift يعطي أعداداً صحيحة بالوحدة المناسبة', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 40; i++) {
      const q = generate('plateDrift', rng(i), `p${i}`)
      expect(Number.isInteger(q.answer)).toBe(true)
      expect(['م', 'كم']).toContain(q.unit)
      seen.add(q.q)
    }
    expect(seen.size).toBeGreaterThan(6)
  })
  it('plateDrift: ٢ سم/سنة في ١٠٠٠ سنة = ٢٠ م', () => {
    for (let i = 0; i < 200; i++) {
      const q = generate('plateDrift', rng(i), 'x')
      if (q.q.includes('٢ سم') || q.q.includes('2 سم')) {
        if (q.q.includes('1000 سنة') && q.unit === 'م') expect(q.answer).toBe(20)
        if (q.q.includes('10 مليون') && q.unit === 'كم') expect(q.answer).toBe(200)
      }
    }
  })
  it('erosionHeight: ٢ مم × ٢٠٠٠ سنة = ٤ م', () => {
    for (let i = 0; i < 200; i++) {
      const q = generate('erosionHeight', rng(i), 'y')
      expect(Number.isInteger(q.answer)).toBe(true)
      if (q.q.includes('2 مم') && q.q.includes('2000 سنة')) expect(q.answer).toBe(4)
    }
  })
})

describe('مولّدات الفصل الدراسي الثاني', () => {
  const rngs = () => mulberry32(12345)
  it('تعطي إجابات رقمية موجبة وتفسيراً لكل خطأ شائع', () => {
    for (const g of ['fToC', 'cToF', 'windSpeed', 'relHumidity', 'auKm', 'lightTime', 'lightYear', 'microPower', 'cellCount'] as const) {
      const rng = rngs()
      for (let i = 0; i < 30; i++) {
        const q = generate(g, rng, `${g}-${i}`)
        expect(q.answer, g).toBeGreaterThan(0)
        expect(Number.isFinite(q.answer)).toBe(true)
        expect(q.explain.length).toBeGreaterThan(0)
        for (const m of q.mistakes ?? []) expect(Math.abs(m.value - q.answer), `${g}: خطأ شائع يساوي الجواب`).toBeGreaterThan(0.011)
      }
    }
  })
  it('تحويل ٩٥°ف = ٣٥°س و٢٥°س = ٧٧°ف', () => {
    const rng = rngs()
    const seen = new Map<string, number>()
    for (let i = 0; i < 80; i++) {
      const a = generate('fToC', rng, `a${i}`)
      seen.set(a.q, a.answer)
    }
    for (const [q, ans] of seen) {
      const F = Number(/(\d+)°ف/.exec(q)![1])
      expect(ans).toBeCloseTo((5 / 9) * (F - 32), 5)
    }
    const b = generate('cToF', rng, 'b')
    const C = Number(/(\d+)°س/.exec(b.q)![1])
    expect(b.answer).toBeCloseTo((9 / 5) * C + 32, 5)
  })
  it('سرعة الرياح = المسافة ÷ الزمن', () => {
    const rng = rngs()
    for (let i = 0; i < 20; i++) {
      const q = generate('windSpeed', rng, `w${i}`)
      const d = Number(/مسافة (\d+) كم/.exec(q.q)![1])
      const t = Number(/خلال (\d+) ساعات/.exec(q.q)![1])
      expect(q.answer).toBe(d / t)
    }
  })
  it('الرطوبة النسبية بين ٠ و١٠٠', () => {
    const rng = rngs()
    for (let i = 0; i < 20; i++) {
      const q = generate('relHumidity', rng, `r${i}`)
      expect(q.answer).toBeGreaterThan(0)
      expect(q.answer).toBeLessThan(100)
    }
  })
  it('الوحدة الفلكية ١٥٠ مليون كم، والسنة الضوئية ٩٫٥ تريليون كم، وزمن الضوء ٣٠٠٠٠٠ كم/ث', () => {
    const rng = rngs()
    const a = generate('auKm', rng, 'a')
    expect(a.answer % 150).toBe(0)
    const l = generate('lightYear', rng, 'l')
    const n = Number(/يبعد عنا ([\d.]+) سنة/.exec(l.q)![1])
    expect(l.answer).toBeCloseTo(n * 9.5, 5)
    const t = generate('lightTime', rng, 't')
    const d = Number(/مسافة (\d+) كم/.exec(t.q)![1])
    expect(t.answer).toBe(d / 300000)
  })
  it('قوة التكبير حاصل ضرب العدستين، وعدد خلايا الدم صحيح', () => {
    const rng = rngs()
    const m = generate('microPower', rng, 'm')
    const [e, o] = [/عدسته العينية (\d+)×/, /الشيئية (\d+)×/].map((r) => Number(r.exec(m.q)![1]))
    expect(m.answer).toBe(e * o)
    for (let i = 0; i < 20; i++) {
      const c = generate('cellCount', rng, `c${i}`)
      const L = Number(/في ([\d.]+) لتر/.exec(c.q)![1])
      if (c.unit === 'مليار خلية') expect(c.answer).toBeCloseTo(5 * L, 5)
      else expect(c.answer).toBeCloseTo(7.5 * L, 5)
    }
  })
})
