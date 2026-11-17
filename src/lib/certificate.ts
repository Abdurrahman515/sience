// منطق الشهادة (بلا واجهة ولا رسم): الأهلية، تنظيف الاسم، التاريخ، حفظ آخر اسم.
import type { ProgressData } from './progress'
import { toArabicDigits } from './arabicText'
import { examPassed } from './examRules'

export const NAME_MAX = 40
export const NAME_STORAGE_KEY = 'science-app:student:v1'

export type CertKind = 'midterm' | 'final'

/** اختبارا منتصف الفصل ونهايته فقط هما اللذان لهما شهادة (لا مراجعات الوحدات). */
export function certKindOf(examId: string): CertKind | null {
  if (examId.startsWith('midterm')) return 'midterm'
  if (examId.startsWith('final')) return 'final'
  return null
}

/** هل تُعرض خيار طباعة الشهادة لهذا الاختبار بحسب أفضل نتيجة محفوظة؟ */
export function canPrintCertificate(examId: string, progress: ProgressData): boolean {
  if (!certKindOf(examId)) return false
  const e = progress.exams[examId]
  return !!e && examPassed(examId, e.best, e.total)
}

/** ينظّف الاسم: يزيل ما ليس حرفاً أو مسافة، ويضغط المسافات. يعيد '' إن كان غير صالح. */
export function cleanName(raw: string): string {
  const s = raw
    .normalize('NFC')
    .replace(/[^\p{L}\p{M}\s'’-]/gu, '')
    .replace(/\u0640/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (s.length < 2) return ''
  return s.slice(0, NAME_MAX).trim()
}

const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']

/** تاريخ ميلادي بالأرقام العربية (بلا اعتماد على Intl ليعمل بلا اتصال وبثبات). */
export function arabicDate(d: Date): string {
  return `${toArabicDigits(d.getDate())} ${MONTHS[d.getMonth()]} ${toArabicDigits(d.getFullYear())}م`
}

export interface CertData {
  name: string
  examTitle: string
  kind: CertKind
  score: number
  total: number
  date: Date
}

export function certFileName(examId: string): string {
  return `certificate-${examId}.pdf`
}

interface StorageLike {
  getItem(k: string): string | null
  setItem(k: string, v: string): void
}

export function loadName(storage: StorageLike | null): string {
  try {
    return cleanName(storage?.getItem(NAME_STORAGE_KEY) ?? '')
  } catch {
    return ''
  }
}

export function saveName(storage: StorageLike | null, name: string): void {
  try {
    storage?.setItem(NAME_STORAGE_KEY, name)
  } catch {
    /* تجاهل */
  }
}
