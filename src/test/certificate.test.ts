import { describe, expect, it } from 'vitest'
import { arabicDate, canPrintCertificate, certFileName, certKindOf, cleanName, loadName, saveName } from '../lib/certificate'
import { emptyProgress, recordExam } from '../lib/progress'

describe('الشهادة: الأهلية', () => {
  it('لمنتصف الفصل ونهايته فقط، لا لمراجعات الوحدات', () => {
    expect(certKindOf('midterm-1')).toBe('midterm')
    expect(certKindOf('final-2')).toBe('final')
    expect(certKindOf('unit1-review')).toBeNull()
  })
  it('لا خيار طباعة قبل المحاولة أو عند الرسوب (حد ٦٠٪)', () => {
    expect(canPrintCertificate('midterm-1', emptyProgress())).toBe(false)
    expect(canPrintCertificate('midterm-1', recordExam(emptyProgress(), 'midterm-1', 14, 24))).toBe(false)
    expect(canPrintCertificate('final-1', recordExam(emptyProgress(), 'final-1', 5, 20))).toBe(false)
  })
  it('يظهر عند ٦٠٪ فأكثر ويبقى بعد رسوب لاحق (أفضل نتيجة)', () => {
    let p = recordExam(emptyProgress(), 'midterm-1', 15, 25)
    expect(canPrintCertificate('midterm-1', p)).toBe(true)
    p = recordExam(p, 'midterm-1', 3, 25)
    expect(canPrintCertificate('midterm-1', p)).toBe(true)
  })
  it('مراجعة الوحدة لا شهادة لها حتى لو نجحت', () => {
    expect(canPrintCertificate('unit1-review', recordExam(emptyProgress(), 'unit1-review', 10, 10))).toBe(false)
  })
})

describe('الشهادة: الاسم والتاريخ', () => {
  it('ينظّف الاسم ويرفض القصير', () => {
    expect(cleanName('  سلمى   أحمد  ')).toBe('سلمى أحمد')
    expect(cleanName('سلمى١٢٣<b>')).toBe('سلمىb')
    expect(cleanName('س')).toBe('')
    expect(cleanName('   ')).toBe('')
    expect(cleanName('ا'.repeat(100)).length).toBe(40)
  })
  it('تاريخ بالأرقام العربية', () => {
    expect(arabicDate(new Date(2026, 10, 16))).toBe('١٦ نوفمبر ٢٠٢٦م')
  })
  it('يحفظ آخر اسم بمفتاح مستقل', () => {
    const data: Record<string, string> = {}
    const s = { getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => void (data[k] = v) }
    saveName(s, 'لمى')
    expect(Object.keys(data)).toEqual(['science-app:student:v1'])
    expect(loadName(s)).toBe('لمى')
    expect(loadName(null)).toBe('')
  })
  it('اسم الملف ثابت لاتيني', () => {
    expect(certFileName('midterm-2')).toBe('certificate-midterm-2.pdf')
  })
})
