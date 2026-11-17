import { describe, expect, it } from 'vitest'
import { createCanvas } from '@napi-rs/canvas'
import { CERT_H, CERT_W, drawCertificate } from '../lib/certificateDraw'

describe('رسم الشهادة', () => {
  it('أفقية بنسبة A4 وتُرسم دون أخطاء وبألوان وردية', () => {
    expect(CERT_W / CERT_H).toBeGreaterThan(1.4)
    expect(CERT_W / CERT_H).toBeLessThan(1.43)
    const c = createCanvas(CERT_W, CERT_H)
    const ctx = c.getContext('2d')
    drawCertificate(ctx as unknown as CanvasRenderingContext2D, {
      name: 'سلمى', examTitle: 'اختبار منتصف الفصل الدراسي الأول', kind: 'midterm', score: 18, total: 25, date: new Date(2026, 0, 5),
    })
    const [r, g, b] = ctx.getImageData(1000, 70, 1, 1).data // على الإطار الوردي
    expect(r).toBeGreaterThan(180)
    expect(g).toBeLessThan(80)
    expect(b).toBeGreaterThan(80)
  })
  it('يتسع اسم طويل جداً دون خطأ', () => {
    const c = createCanvas(CERT_W, CERT_H)
    expect(() =>
      drawCertificate(c.getContext('2d') as unknown as CanvasRenderingContext2D, {
        name: 'عبد الرحمن بن محمد بن عبد العزيز آل سعود الحربي', examTitle: 'اختبار نهاية الفصل الدراسي الثاني', kind: 'final', score: 30, total: 40, date: new Date(),
      }),
    ).not.toThrow()
  })
})
