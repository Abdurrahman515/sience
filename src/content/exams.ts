import type { ExamDef } from '../lib/exam'
import { LESSONS, lessonsOfUnit } from './registry'

export const EXAM_UNIT1: ExamDef = {
  id: 'unit1-review',
  title: 'مراجعة الوحدة ١: العلم وتفاعلات الأجسام',
  emoji: '📝',
  minutes: 40,
  questions: lessonsOfUnit(1).flatMap((l) => l.bank.r),
}

export const EXAM_UNIT2: ExamDef = {
  id: 'unit2-review',
  title: 'مراجعة الوحدة ٢: طبيعة المادة',
  emoji: '📝',
  minutes: 40,
  questions: lessonsOfUnit(2).flatMap((l) => l.bank.r),
}

export const EXAM_UNIT3: ExamDef = {
  id: 'unit3-review',
  title: 'مراجعة الوحدة ٣: سطح الأرض المتغير',
  emoji: '📝',
  minutes: 40,
  questions: lessonsOfUnit(3).flatMap((l) => l.bank.r),
}

export const EXAM_UNIT4: ExamDef = {
  id: 'unit4-review',
  title: 'مراجعة الوحدة ٤: ما وراء الأرض',
  emoji: '📝',
  minutes: 40,
  questions: lessonsOfUnit(4).flatMap((l) => l.bank.r),
}

/** منتصف الفصل: الوحدتان ١ و٢ فقط. */
export const EXAM_MIDTERM: ExamDef = {
  id: 'midterm-1',
  title: 'اختبار منتصف الفصل الدراسي الأول',
  emoji: '🏫',
  minutes: 40,
  questions: LESSONS.filter((l) => l.unit <= 2).flatMap((l) => l.bank.m),
}

/**
 * نهاية الفصل الأول: يغطي الوحدات الثلاث.
 * - الوحدتان ١ و٢: سؤالان من بنك المراجعة لكل درس أساسي (بلا أسئلة منتصف الفصل).
 * - الوحدة ٣: بنك m لدروسها الأساسية (لا يدخل في منتصف الفصل).
 */
export const EXAM_FINAL1: ExamDef = {
  id: 'final-1',
  title: 'اختبار نهاية الفصل الدراسي الأول',
  emoji: '🎓',
  minutes: 50,
  questions: [
    ...LESSONS.filter((l) => l.unit <= 2).flatMap((l) => l.bank.r.slice(0, 2)),
    ...LESSONS.filter((l) => l.unit === 3).flatMap((l) => l.bank.m),
  ],
}

export const EXAM_UNIT5: ExamDef = {
  id: 'unit5-review',
  title: 'مراجعة الوحدة ٥: تباين الحياة',
  emoji: '📝',
  minutes: 40,
  questions: lessonsOfUnit(5).flatMap((l) => l.bank.r),
}

export const EXAM_UNIT6: ExamDef = {
  id: 'unit6-review',
  title: 'مراجعة الوحدة ٦: الحياة والبيئة',
  emoji: '📝',
  minutes: 40,
  questions: lessonsOfUnit(6).flatMap((l) => l.bank.r),
}

/** منتصف الفصل الثاني: الوحدة ٤ كاملة + الفصلان ٩ و١٠ من الوحدة ٥. */
export const EXAM_MIDTERM2: ExamDef = {
  id: 'midterm-2',
  title: 'اختبار منتصف الفصل الدراسي الثاني',
  emoji: '🏫',
  minutes: 40,
  questions: LESSONS.filter((l) => l.unit === 4 || (l.unit === 5 && l.chapter <= 10)).flatMap((l) => l.bank.m),
}

const beforeMid2 = (l: { unit: number; chapter: number }) => l.unit === 4 || (l.unit === 5 && l.chapter <= 10)

/**
 * اختبار نهاية العام: يغطي الفصل الدراسي الثاني كاملاً (الوحدات ٤ و٥ و٦).
 * - دروس ما قبل المنتصف: سؤالان من بنك المراجعة لكل درس أساسي (بلا أسئلة المنتصف).
 * - الفصل ١١ والوحدة ٦: بنك m لدروسها الأساسية.
 */
export const EXAM_FINAL2: ExamDef = {
  id: 'final-2',
  title: 'اختبار نهاية العام',
  emoji: '🎓',
  minutes: 60,
  questions: [
    ...LESSONS.filter(beforeMid2).flatMap((l) => l.bank.r.slice(0, 2)),
    ...LESSONS.filter((l) => l.unit >= 4 && !beforeMid2(l)).flatMap((l) => l.bank.m),
  ],
}

export const EXAMS: ExamDef[] = [
  EXAM_UNIT1, EXAM_UNIT2, EXAM_UNIT3, EXAM_MIDTERM, EXAM_FINAL1,
  EXAM_UNIT4, EXAM_UNIT5, EXAM_UNIT6, EXAM_MIDTERM2, EXAM_FINAL2,
]

export function getExam(id: string): ExamDef | undefined {
  return EXAMS.find((e) => e.id === id)
}
