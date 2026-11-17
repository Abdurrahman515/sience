import type { Lesson, Unit } from './types'
import { u1c1l1 } from './lessons/u1c1l1'
import { u1c1l2 } from './lessons/u1c1l2'
import { u1c1l3 } from './lessons/u1c1l3'
import { u1c1inq } from './lessons/u1c1inq'
import { u1c2l1 } from './lessons/u1c2l1'
import { u1c2l2 } from './lessons/u1c2l2'
import { u1c2l3 } from './lessons/u1c2l3'
import { u1c2inq } from './lessons/u1c2inq'
import { u2c3l1 } from './lessons/u2c3l1'
import { u2c3l2 } from './lessons/u2c3l2'
import { u2c3inq } from './lessons/u2c3inq'
import { u2c4l1 } from './lessons/u2c4l1'
import { u2c4l2 } from './lessons/u2c4l2'
import { u2c4inq } from './lessons/u2c4inq'
import { u3c5l1 } from './lessons/u3c5l1'
import { u3c5l2 } from './lessons/u3c5l2'
import { u3c5inq } from './lessons/u3c5inq'
import { u3c6l1 } from './lessons/u3c6l1'
import { u3c6l2 } from './lessons/u3c6l2'
import { u3c6inq } from './lessons/u3c6inq'
import { u4c7l1 } from './lessons/u4c7l1'
import { u4c7l2 } from './lessons/u4c7l2'
import { u4c7inq } from './lessons/u4c7inq'
import { u4c8l1 } from './lessons/u4c8l1'
import { u4c8l2 } from './lessons/u4c8l2'
import { u4c8inq } from './lessons/u4c8inq'
import { u5c9l1 } from './lessons/u5c9l1'
import { u5c9l2 } from './lessons/u5c9l2'
import { u5c9inq } from './lessons/u5c9inq'
import { u5c10l1 } from './lessons/u5c10l1'
import { u5c10l2 } from './lessons/u5c10l2'
import { u5c10inq } from './lessons/u5c10inq'
import { u5c11l1 } from './lessons/u5c11l1'
import { u5c11l2 } from './lessons/u5c11l2'
import { u5c11inq } from './lessons/u5c11inq'
import { u6c12l1 } from './lessons/u6c12l1'
import { u6c12l2 } from './lessons/u6c12l2'
import { u6c12inq } from './lessons/u6c12inq'
import { u6c13l1 } from './lessons/u6c13l1'
import { u6c13l2 } from './lessons/u6c13l2'
import { u6c13inq } from './lessons/u6c13inq'

export const LESSONS: Lesson[] = [
  u1c1l1, u1c1l2, u1c1l3, u1c1inq,
  u1c2l1, u1c2l2, u1c2l3, u1c2inq,
  u2c3l1, u2c3l2, u2c3inq,
  u2c4l1, u2c4l2, u2c4inq,
  u3c5l1, u3c5l2, u3c5inq,
  u3c6l1, u3c6l2, u3c6inq,
  u4c7l1, u4c7l2, u4c7inq,
  u4c8l1, u4c8l2, u4c8inq,
  u5c9l1, u5c9l2, u5c9inq,
  u5c10l1, u5c10l2, u5c10inq,
  u5c11l1, u5c11l2, u5c11inq,
  u6c12l1, u6c12l2, u6c12inq,
  u6c13l1, u6c13l2, u6c13inq,
]

export const UNITS: Unit[] = [
  {
    id: 1,
    title: 'العلم وتفاعلات الأجسام',
    chapters: [
      { id: 1, title: 'طبيعة العلم', lessonIds: ['u1c1l1', 'u1c1l2', 'u1c1l3', 'u1c1inq'] },
      { id: 2, title: 'الحركة والقوى والآلات البسيطة', lessonIds: ['u1c2l1', 'u1c2l2', 'u1c2l3', 'u1c2inq'] },
    ],
  },
  {
    id: 2,
    title: 'طبيعة المادة',
    chapters: [
      { id: 3, title: 'المادة وتغيراتها', lessonIds: ['u2c3l1', 'u2c3l2', 'u2c3inq'] },
      { id: 4, title: 'الذرات والعناصر والجدول الدوري', lessonIds: ['u2c4l1', 'u2c4l2', 'u2c4inq'] },
    ],
  },
  {
    id: 3,
    title: 'سطح الأرض المتغير',
    chapters: [
      { id: 5, title: 'الصخور والمعادن', lessonIds: ['u3c5l1', 'u3c5l2', 'u3c5inq'] },
      { id: 6, title: 'القوى المشكّلة للأرض', lessonIds: ['u3c6l1', 'u3c6l2', 'u3c6inq'] },
    ],
  },
  {
    id: 4,
    title: 'ما وراء الأرض',
    chapters: [
      { id: 7, title: 'الغلاف الجوي المتحرك', lessonIds: ['u4c7l1', 'u4c7l2', 'u4c7inq'] },
      { id: 8, title: 'استكشاف الفضاء', lessonIds: ['u4c8l1', 'u4c8l2', 'u4c8inq'] },
    ],
  },
  {
    id: 5,
    title: 'تباين الحياة',
    chapters: [
      { id: 9, title: 'الخلايا لبنات الحياة', lessonIds: ['u5c9l1', 'u5c9l2', 'u5c9inq'] },
      { id: 10, title: 'الحيوانات اللافقارية', lessonIds: ['u5c10l1', 'u5c10l2', 'u5c10inq'] },
      { id: 11, title: 'الحيوانات الفقارية', lessonIds: ['u5c11l1', 'u5c11l2', 'u5c11inq'] },
    ],
  },
  {
    id: 6,
    title: 'الحياة والبيئة',
    chapters: [
      { id: 12, title: 'علم البيئة', lessonIds: ['u6c12l1', 'u6c12l2', 'u6c12inq'] },
      { id: 13, title: 'موارد الأرض', lessonIds: ['u6c13l1', 'u6c13l2', 'u6c13inq'] },
    ],
  },
]

const byId = new Map(LESSONS.map((l) => [l.id, l]))

export function getLesson(id: string): Lesson | undefined {
  return byId.get(id)
}

export function lessonsOfUnit(unit: Lesson['unit']): Lesson[] {
  return LESSONS.filter((l) => l.unit === unit)
}

/** الدرس التالي في الترتيب، إن وُجد. */
export function nextLesson(id: string): Lesson | undefined {
  const i = LESSONS.findIndex((l) => l.id === id)
  return i >= 0 ? LESSONS[i + 1] : undefined
}

const lessonOfQ = new Map<string, string>()
for (const l of LESSONS) for (const q of [...l.bank.r, ...l.bank.m]) lessonOfQ.set(q.id, l.id)

/** الدرس الذي ينتمي إليه سؤال بنك (لعرض «دروس تحتاج مراجعة»). */
export function lessonIdOfQuestion(qid: string): string | undefined {
  return lessonOfQ.get(qid)
}
