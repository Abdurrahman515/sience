import { describe, expect, it } from 'vitest'
import { display, formatNumber, normalizeArabic, parseNumber, stripTashkeel, toArabicDigits, toLatinDigits } from '../lib/arabicText'

describe('arabicText', () => {
  it('يحوّل الأرقام إلى عربية شرقية', () => {
    expect(toArabicDigits(1234567890)).toBe('١٢٣٤٥٦٧٨٩٠')
    expect(toArabicDigits('م/ث2')).toBe('م/ث٢')
  })
  it('يحوّل الأرقام العربية والفارسية إلى لاتينية', () => {
    expect(toLatinDigits('٣٫٥')).toBe('3٫5')
    expect(toLatinDigits('۱۲')).toBe('12')
  })
  it('يعرض الفاصلة العشرية العربية', () => {
    expect(display('كثافة 0.9168 جم')).toBe('كثافة ٠٫٩١٦٨ جم')
    expect(display('ص 20')).toBe('ص ٢٠')
  })
  it('يعرض رقماً منسقاً', () => {
    expect(formatNumber(3.5)).toBe('٣٫٥')
    expect(formatNumber(18)).toBe('١٨')
    expect(formatNumber(1 / 3)).toBe('٠٫٣٣')
  })
  it('يزيل التشكيل ويطبّع النص', () => {
    expect(stripTashkeel('الفَرَضِيَّة')).toBe('الفرضية')
    expect(normalizeArabic('  إِلكترون  ')).toBe('الكترون')
    expect(normalizeArabic('مدرسة')).toBe(normalizeArabic('مدرسه'))
  })
  it('يقرأ الأرقام المكتوبة بأي شكل', () => {
    expect(parseNumber('١٢')).toBe(12)
    expect(parseNumber('3,5')).toBe(3.5)
    expect(parseNumber('٣٫٥')).toBe(3.5)
    expect(parseNumber('-٤')).toBe(-4)
    expect(parseNumber('abc')).toBeNull()
    expect(parseNumber('')).toBeNull()
    expect(parseNumber('1.2.3')).toBeNull()
  })
})
