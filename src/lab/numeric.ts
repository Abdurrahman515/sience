import { parseNumber } from '../lib/arabicText'

/** هل الإجابة النصية تقارب القيمة المتوقعة (خطأ نسبي ≤ tol)؟ */
export function checkNumericValue(text: string, expected: number, tol = 0.05): boolean {
  const v = parseNumber(text)
  if (v === null) return false
  if (expected === 0) return Math.abs(v) <= tol
  return Math.abs(v - expected) / Math.abs(expected) <= tol
}
