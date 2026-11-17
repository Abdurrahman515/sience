import { UNITS } from './registry'
import { EXAM_FINAL1, EXAM_FINAL2, EXAM_MIDTERM, EXAM_MIDTERM2, EXAM_UNIT1, EXAM_UNIT2, EXAM_UNIT3, EXAM_UNIT4, EXAM_UNIT5, EXAM_UNIT6 } from './exams'
import type { ExamDef } from '../lib/exam'
import type { Unit } from './types'

export interface PendingExam {
  id: string
  title: string
  emoji: string
  pending: true
}

export type SemesterExam = ExamDef | PendingExam

export interface SemesterUnit {
  id: number
  title: string
  /** عنوان العرض إن اختلف عن «الوحدة ن: العنوان» (مثل تتمة وحدة قُسمت حول اختبار المنتصف) */
  label?: string
  /** مفتاح فريد للطيّ إن تكرر رقم الوحدة */
  foldKey?: number
  /** وحدة لم يُضَف محتواها بعد */
  soon?: boolean
  chapters: Unit['chapters']
  review?: ExamDef
}

export interface Semester {
  id: 1 | 2
  title: string
  units: SemesterUnit[]
  /** اختبارا منتصف الفصل ونهايته، يظهران خارج الوحدات أسفل الفصل الدراسي */
  exams: SemesterExam[]
  soon?: boolean
}

export const isPending = (e: SemesterExam): e is PendingExam => 'pending' in e

const reviewOf: Record<number, ExamDef> = { 1: EXAM_UNIT1, 2: EXAM_UNIT2, 3: EXAM_UNIT3, 4: EXAM_UNIT4, 5: EXAM_UNIT5, 6: EXAM_UNIT6 }

export const SEMESTERS: Semester[] = [
  {
    id: 1,
    title: 'الفصل الدراسي الأول',
    units: UNITS.filter((u) => u.id <= 3).map((u) => ({ id: u.id, title: u.title, chapters: u.chapters, review: reviewOf[u.id] })),
    exams: [EXAM_MIDTERM, EXAM_FINAL1],
  },
  {
    id: 2,
    title: 'الفصل الدراسي الثاني',
    // الوحدة ٥ مقسومة حول اختبار المنتصف: الفصلان ٩–١٠ قبله، والفصل ١١ (مع مراجعة الوحدة) بعده
    units: [
      ...UNITS.filter((u) => u.id === 4).map((u) => ({ id: u.id, title: u.title, chapters: u.chapters, review: reviewOf[u.id] })),
      ...UNITS.filter((u) => u.id === 5).map((u) => ({ id: u.id, title: u.title, chapters: u.chapters.filter((c) => c.id <= 10) })),
      ...UNITS.filter((u) => u.id === 5).map((u) => ({
        id: u.id, foldKey: 51, label: 'الوحدة ٥ (تتمة): الفصل ١١ — الحيوانات الفقارية', title: u.title,
        chapters: u.chapters.filter((c) => c.id === 11), review: reviewOf[5],
      })),
      ...UNITS.filter((u) => u.id === 6).map((u) => ({ id: u.id, title: u.title, chapters: u.chapters, review: reviewOf[6] })),
    ],
    exams: [EXAM_MIDTERM2, EXAM_FINAL2],
  },
]
