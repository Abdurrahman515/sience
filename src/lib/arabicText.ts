// دوال النص العربي والأرقام — ملف مشترك واحد (لا تكرّريها في أي ملف آخر)

const EASTERN = '٠١٢٣٤٥٦٧٨٩'

/** يحوّل الأرقام اللاتينية إلى عربية شرقية (٠–٩) في نص أو رقم. */
export function toArabicDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => EASTERN[Number(d)])
}

/** يحوّل الأرقام العربية الشرقية والفارسية إلى لاتينية. */
export function toLatinDigits(input: string): string {
  return input
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
}

/** نص جاهز للعرض للطالبة: أرقام عربية وفاصلة عشرية عربية (٫). */
export function display(text: string): string {
  return toArabicDigits(text.replace(/(\d)\.(\d)/g, '$1٫$2'))
}

/** يعرض رقماً (حتى منزلتين عشريتين) بالشكل العربي. */
export function formatNumber(n: number, maxDecimals = 2): string {
  const rounded = Number(n.toFixed(maxDecimals))
  return display(String(rounded))
}

const TASHKEEL = /[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g

export function stripTashkeel(s: string): string {
  return s.replace(TASHKEEL, '')
}

/** تطبيع للمقارنة: بلا تشكيل، توحيد الألف والياء والتاء المربوطة والمسافات. */
export function normalizeArabic(s: string): string {
  return stripTashkeel(s)
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim()
}

/** يقرأ رقماً كتبته الطالبة (أرقام عربية أو لاتينية، فاصلة أو نقطة). */
export function parseNumber(input: string): number | null {
  let s = toLatinDigits(input).trim()
  if (!s) return null
  s = s.replace(/[٫,،]/g, '.').replace(/[−–]/g, '-').replace(/\s+/g, '')
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}
