import { describe, expect, it } from 'vitest'
import {
  BARO_DAYS, BLOCKS, STAR_SKY, STONES, WEB_EDGES, WEB_NODES, baroPointer, boxTemp, bottleTemp, brickForces, classifyStar, crystalSize, density, flaskFade,
  genField, lampTemp, matchMolecule, planetAngle, rollTime, tempBand, trueDensity, yeastVolume, COMMUNITIES, PLANETS,
} from '../lab/labLogic'
import { checkNumericValue } from '../lab/numeric'

describe('منطق التجارب', () => {
  it('زمن عودة السائل يزداد بعدد الرجّات', () => {
    expect(flaskFade(1)).toBeLessThan(flaskFade(2))
    expect(flaskFade(2)).toBeLessThan(flaskFade(3))
  })
  it('نطاقات الحرارة حسب مفتاح الخريطة', () => {
    expect(tempBand(-4)).toBe(0)
    expect(tempBand(-1)).toBe(1)
    expect(tempBand(9)).toBe(1)
    expect(tempBand(12)).toBe(2)
    expect(tempBand(21)).toBe(3)
  })
  it('الميل الأكبر أسرع، والكتلة لا تدخل في الحساب', () => {
    expect(rollTime(25)).toBeLessThan(rollTime(10))
    expect(rollTime.length).toBeLessThanOrEqual(2)
  })
  it('قوة البدء أكبر من قوة الاستمرار وتزداد بالكتلة', () => {
    for (const c of [1, 2, 3]) expect(brickForces(c).fs).toBeGreaterThan(brickForces(c).fk)
    expect(brickForces(3).fs).toBeGreaterThan(brickForces(1).fs)
  })
  it('الكثافات: (أ) و(ج) من الألومنيوم و(ب) نحاس', () => {
    const d = BLOCKS.map((b) => density(b.mass, b.dims[0] * b.dims[1] * b.dims[2]))
    expect(d[0]).toBeCloseTo(2.7)
    expect(d[2]).toBeCloseTo(2.7)
    expect(d[1]).toBeCloseTo(8.9)
    const s = STONES.map((x) => density(x.mass, x.v1 - x.v0))
    expect(s[0]).toBeCloseTo(s[1])
  })
  it('تركيب الجزيئات', () => {
    expect(matchMolecule(2, 1, 0)?.id).toBe('water')
    expect(matchMolecule(0, 2, 1)?.id).toBe('co2')
    expect(matchMolecule(4, 0, 1)?.id).toBe('ch4')
    expect(matchMolecule(1, 1, 1)).toBeNull()
  })
  it('البلورات: التبريد البطيء أكبر والبذور تسرّع', () => {
    expect(crystalSize(24, true, true)).toBeGreaterThan(crystalSize(24, false, true))
    expect(crystalSize(24, true, true)).toBeGreaterThan(crystalSize(24, true, false))
    expect(crystalSize(0, true, false)).toBe(0)
  })
  it('الباروميتر: المؤشر يتبع الضغط والخمسة أيام متنوعة', () => {
    expect(baroPointer(1020)).toBeGreaterThan(baroPointer(995))
    expect(baroPointer(900)).toBe(0)
    expect(baroPointer(1100)).toBe(1)
    expect(new Set(BARO_DAYS.map((d) => d.sky)).size).toBeGreaterThan(2)
  })
  it('المصباح: الضوء المباشر أسخن ويرتفع مع الزمن', () => {
    expect(lampTemp(0, 10)).toBeGreaterThan(lampTemp(40, 10))
    expect(lampTemp(40, 10)).toBeGreaterThan(lampTemp(75, 10))
    expect(lampTemp(0, 10)).toBeGreaterThan(lampTemp(0, 2))
    expect(lampTemp(0, 0)).toBe(22)
  })
  it('الكواكب: الأقرب أسرع، والأرض تعود بعد سنة', () => {
    expect(planetAngle(1, 1)).toBeCloseTo(0)
    expect(planetAngle(PLANETS[7].period, 4)).toBeLessThan(10)
    expect(PLANETS.map((p) => p.period)).toEqual([...PLANETS.map((p) => p.period)].sort((a, b) => a - b))
  })
  it('تصنيف النجوم يطابق جدول دربر المقروء من الكراسة', () => {
    expect(classifyStar(2000)).toBe('M')
    expect(classifyStar(4300)).toBe('K')
    expect(classifyStar(5500)).toBe('G')
    expect(classifyStar(6500)).toBe('F')
    expect(classifyStar(9000)).toBe('A')
    expect(classifyStar(15000)).toBe('B')
    expect(classifyStar(60000)).toBe('O')
    for (const s of STAR_SKY) expect(classifyStar(s.k)).toBe(s.cls)
    expect(new Set(STAR_SKY.map((s) => s.cls)).size).toBe(7)
  })
  it('الخميرة: السكر والدفء يزيدان الغاز', () => {
    expect(yeastVolume(true, true, 60)).toBeGreaterThan(yeastVolume(false, true, 60) * 10)
    expect(yeastVolume(true, true, 60)).toBeGreaterThan(yeastVolume(true, false, 60))
    expect(yeastVolume(true, true, 0)).toBe(0)
  })
  it('كثافات الجماعات الثلاث مرتّبة', () => {
    const d = COMMUNITIES.map((c) => trueDensity(genField(c.seed, c.perCell)))
    expect(d[0]).toBeLessThan(d[1])
    expect(d[1]).toBeLessThan(d[2])
    expect(genField(1, 3)).toEqual(genField(1, 3))
    expect(genField(1, 3)).toHaveLength(100)
  })
  it('الشبكة الغذائية: كل الأسهم بين عقد موجودة والعشب منتج', () => {
    const ids = new Set<string>(WEB_NODES.map((n) => n.id))
    for (const [a, b] of WEB_EDGES) { expect(ids.has(a)).toBe(true); expect(ids.has(b)).toBe(true) }
    expect(WEB_NODES.find((n) => n.id === 'plant')?.role).toBe('منتج')
    expect(WEB_EDGES.some(([, b]) => b === 'plant')).toBe(false)
  })
  it('المجمّع الشمسي والدفيئة', () => {
    expect(boxTemp(true, true, false, 30)).toBeGreaterThan(boxTemp(false, false, false, 30))
    expect(boxTemp(true, true, true, 30)).toBeGreaterThan(boxTemp(true, true, false, 30))
    expect(bottleTemp(true, 30)).toBeGreaterThan(bottleTemp(false, 30))
  })
  it('فحص الإجابات الرقمية يقبل الأرقام العربية والفاصلة', () => {
    expect(checkNumericValue('٢٫٧', 2.7)).toBe(true)
    expect(checkNumericValue('2,7', 2.7)).toBe(true)
    expect(checkNumericValue('٣٫٥', 2.7)).toBe(false)
    expect(checkNumericValue('abc', 2.7)).toBe(false)
    expect(checkNumericValue('', 2.7)).toBe(false)
  })
})
