export interface Wrong {
  t: string
  /** تفسير الفهم الخاطئ الشائع (إلزامي في أسئلة الدروس، اختياري في بنك الاختبارات) */
  why?: string
}

export interface MC {
  kind: 'mc'
  id: string
  q: string
  correct: string
  wrongs: Wrong[]
  explain: string
}

export interface NumQ {
  kind: 'num'
  id: string
  q: string
  answer: number
  unit: string
  explain: string
  law?: string
  sub?: string
  mistakes?: { value: number; why: string }[]
}

export type Question = MC | NumQ

export type GenId =
  | 'avgSpeed'
  | 'distance'
  | 'acceleration'
  | 'accFromForce'
  | 'netForce'
  | 'weight'
  | 'work'
  | 'mechAdv'
  | 'density'
  | 'densityMass'
  | 'neutrons'
  | 'massNumber'
  | 'massLaw'
  | 'mapScale'
  | 'plateDrift'
  | 'erosionHeight'
  | 'fToC'
  | 'cToF'
  | 'windSpeed'
  | 'relHumidity'
  | 'auKm'
  | 'lightTime'
  | 'lightYear'
  | 'microPower'
  | 'cellCount'
  | 'popDensity'
  | 'popCount'
  | 'waterSaved'
  | 'surfaceTime'

export type PlateGoal = 'divergent' | 'convergent' | 'transform'
export type SeasonGoal = 'summer' | 'autumn' | 'winter' | 'spring'

export type WidgetSpec =
  | {
      kind: 'sort'
      title: string
      prompt: string
      categories: string[]
      items: { text: string; cat: number; hint: string }[]
    }
  | { kind: 'order'; title: string; prompt: string; steps: string[]; hint: string }
  | { kind: 'speed'; target: number }
  | { kind: 'force'; target: number }
  | { kind: 'ramp'; target: number }
  /** أدوات المختبر المُدمجة داخل الدروس (بلا مهام رقمية) */
  | { kind: 'molecules' }
  | { kind: 'foodweb' }
  | { kind: 'orbits' }
  /** الآلات البسيطة: الرافعة بأنواعها الثلاثة (بلا هدف رقمي: ترفع الحمل بالأنواع الثلاثة) */
  | { kind: 'lever' }
  /** بكرات: target = أكبر قوة (نيوتن) مسموح بها لرفع حمل ١٢٠ نيوتن */
  | { kind: 'pulley'; target: number }
  /** عجلة ومحور / إسفين / برغي: target = أقل فائدة آلية مطلوبة */
  | { kind: 'wheel'; target: number }
  | { kind: 'wedge'; target: number }
  | { kind: 'screw'; target: number }
  | { kind: 'states' }
  | { kind: 'density'; target: number }
  | { kind: 'atom'; protons: number; neutrons: number; name: string }
  /** اختبار الخدش: عيّنة مجهولة قساوتها hardness على مقياس موهس */
  | { kind: 'mohs'; hardness: number }
  /** مهام حدود الصفائح بالترتيب */
  | { kind: 'plates'; goals: PlateGoal[] }
  /** توازن القشرة: قطعة طافية يتغير حملها */
  | { kind: 'balance' }
  /** أطوار القمر: مهام بالترتيب، كل مهمة رقم موضع القمر (٠ محاق … ٧ هلال أخير)؛ لا يساوي موضع البداية ٢ */
  | { kind: 'moon'; goals: number[] }
  /** فصول السنة في النصف الشمالي: مهام بالترتيب */
  | { kind: 'seasons'; goals: SeasonGoal[] }

export type Block =
  | { type: 'say'; text: string; emoji?: string; title?: string }
  | { type: 'reveal'; title: string; cards: { front: string; back: string }[] }
  | { type: 'widget'; widget: WidgetSpec }
  | { type: 'quiz'; question: MC }
  | { type: 'practice'; gen: GenId; count: number; title?: string }

export interface Lesson {
  id: string
  unit: 1 | 2 | 3 | 4 | 5 | 6
  chapter: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13
  title: string
  emoji: string
  pages: string
  blocks: Block[]
  /** r = أسئلة مراجعة الوحدة، m = أسئلة منتصف الفصل (وفي الوحدة ٣: أسئلة نهاية الفصل) */
  bank: { r: Question[]; m: Question[] }
}

export interface Unit {
  id: 1 | 2 | 3 | 4 | 5 | 6
  title: string
  chapters: { id: Lesson['chapter']; title: string; lessonIds: string[] }[]
}
