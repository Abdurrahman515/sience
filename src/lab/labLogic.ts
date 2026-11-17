// منطق التجارب العملية (دوال نقية قابلة للاختبار)

/** ---- ١-١ الدورقان: زمن عودة السائل (ثانية) يزداد بعدد الرجّات ---- */
export const flaskFade = (shakes: number) => 10 * shakes + 2

/** ---- ١-٢ نطاقات درجة الحرارة على خريطة الطقس (سلسيوس) ---- */
export const TEMP_BANDS = ['أقل من (−١)', 'من (−١) وحتى ٩', 'من ٩ وحتى ٢١', '٢١ فما فوق'] as const
export const TEMP_COLORS = ['#e3f2fd', '#bbdefb', '#ffe0b2', '#ffab91']
export function tempBand(t: number): 0 | 1 | 2 | 3 {
  if (t < -1) return 0
  if (t <= 9) return 1
  if (t < 21) return 2
  return 3
}

/** ---- ٢-١ كرتان على مستوى مائل: زمن التدحرج لمسافة ١٫٥ م (الكتلة لا تؤثر) ---- */
export function rollTime(angleDeg: number, dist = 1.5): number {
  const a = 9.8 * Math.sin((angleDeg * Math.PI) / 180) * (5 / 7)
  return Math.sqrt((2 * dist) / a)
}

/** ---- ٢-٢ سحب الطوب بميزان زنبركي ---- */
export const BRICK_KG = 2
export function brickForces(count: number) {
  const w = count * BRICK_KG * 9.8
  return { fs: 0.5 * w, fk: 0.35 * w }
}

/** ---- ٣-١ الكثافة ---- */
export const density = (mass: number, volume: number) => mass / volume
export const DENSITY_TABLE = [
  ['ألومنيوم', 2.7], ['نحاس', 8.9], ['ذهب', 19.3], ['حديد', 7.9], ['رصاص', 11.3], ['فولاذ', 7.8], ['زنك', 7.1],
] as const
export const BLOCKS = [
  { id: 'أ', dims: [3, 2, 2], mass: 32.4, mat: 'ألومنيوم' },
  { id: 'ب', dims: [2, 2, 2], mass: 71.2, mat: 'نحاس' },
  { id: 'ج', dims: [4, 3, 1], mass: 32.4, mat: 'ألومنيوم' },
] as const
export const STONES = [
  { id: 'الحجر الأول', mass: 53, v0: 30, v1: 50 },
  { id: 'الحجر الثاني', mass: 106, v0: 30, v1: 70 },
] as const

/** ---- ٤-١ تركيب الجزيئات ---- */
export type Elem = 'H' | 'O' | 'C'
export const MOLECULES = [
  { id: 'water', name: 'الماء', formula: 'H₂O', atoms: { H: 2, O: 1, C: 0 } },
  { id: 'co2', name: 'ثاني أكسيد الكربون', formula: 'CO₂', atoms: { H: 0, O: 2, C: 1 } },
  { id: 'ch4', name: 'الميثان', formula: 'CH₄', atoms: { H: 4, O: 0, C: 1 } },
] as const
export function matchMolecule(h: number, o: number, c: number) {
  return MOLECULES.find((m) => m.atoms.H === h && m.atoms.O === o && m.atoms.C === c) ?? null
}

/** ---- ٥-١ نمو بلورات الشب: الحجم (ملم) حسب الزمن (ساعة) وسرعة التبريد ---- */
export function crystalSize(hours: number, slowCooling: boolean, seeded: boolean): number {
  if (hours <= 0) return seeded ? 1 : 0
  const k = slowCooling ? 0.5 : 0.12
  const base = seeded ? 1 : 0
  return Math.round((base + 14 * (1 - Math.exp(-k * hours / (slowCooling ? 3 : 8))) * (slowCooling ? 1 : 0.35) * (seeded ? 1 : 0.4)) * 10) / 10
}

/** ---- ٥-٢ ترسيب: ترتيب الطبقات من الأسفل للأعلى حسب حجم الحبيبات ---- */
export const SEDIMENT_ORDER = ['حصى', 'رمل', 'طين'] as const

/** ---- ٦-٢ حموضة السوائل ---- */
export const LIQUIDS = [
  { id: 'ماء الصنبور', kind: 'متعادل' }, { id: 'ماء المطر', kind: 'حمضي' }, { id: 'عصير الليمون', kind: 'حمضي' },
  { id: 'مشروب غازي', kind: 'حمضي' }, { id: 'أمونيا', kind: 'قاعدي' },
] as const

/** ---- ٧-١ باروميتر منزلي: قراءة ٥ أيام ---- */
export const BARO_DAYS = [
  { day: 1, hpa: 1018, temp: 24, sky: 'صافٍ ☀️' },
  { day: 2, hpa: 1010, temp: 22, sky: 'غائم جزئياً ⛅' },
  { day: 3, hpa: 998, temp: 19, sky: 'غائم وماطر 🌧️' },
  { day: 4, hpa: 1006, temp: 21, sky: 'يتحسّن ⛅' },
  { day: 5, hpa: 1021, temp: 25, sky: 'صافٍ ☀️' },
] as const
/** وضع المؤشر (٠ أسفل = منخفض … ١ أعلى = مرتفع) */
export const baroPointer = (hpa: number) => Math.max(0, Math.min(1, (hpa - 990) / 36))

/** ---- ٧-٢ المصباح والكرة: ارتفاع الحرارة حسب زاوية سقوط الضوء ---- */
export const LAMP_SPOTS = [
  { id: 'center', label: 'وسط الكرة', angle: 0 },
  { id: 'mid', label: 'منتصف المسافة بين الوسط والقمة', angle: 40 },
  { id: 'top', label: 'قرب القمة', angle: 75 },
] as const
export function lampTemp(angleDeg: number, minute: number, start = 22): number {
  const gain = 16 * Math.cos((angleDeg * Math.PI) / 180)
  return Math.round((start + gain * (1 - Math.exp(-minute / 4))) * 10) / 10
}

/** ---- ٨-١ دورات الكواكب (سنة أرضية) ---- */
export const PLANETS = [
  { name: 'عطارد', period: 0.24, color: '#9e9e9e' }, { name: 'الزهرة', period: 0.62, color: '#ffcc80' },
  { name: 'الأرض', period: 1, color: '#42a5f5' }, { name: 'المريخ', period: 1.88, color: '#ef5350' },
  { name: 'المشتري', period: 11.86, color: '#d7a86e' }, { name: 'زحل', period: 29.46, color: '#e6c97a' },
  { name: 'أورانوس', period: 84, color: '#80deea' }, { name: 'نبتون', period: 165, color: '#5c6bc0' },
] as const
/** الزاوية (٠–٣٦٠) بعد t سنة من خط المرجع */
export const planetAngle = (period: number, years: number) => ((years / period) * 360) % 360

/** ---- ٨-٢ تصنيف النجوم (جدول دربر) ---- */
export const STAR_CLASSES = [
  { cls: 'M', color: 'أحمر', lo: 2000, hi: 4000, hex: '#ff6b5a' },
  { cls: 'K', color: 'أحمر ضارب إلى البرتقالي', lo: 3500, hi: 5000, hex: '#ffa05a' },
  { cls: 'G', color: 'أصفر', lo: 5000, hi: 6000, hex: '#ffe27a' },
  { cls: 'F', color: 'أصفر مبيض', lo: 6000, hi: 7500, hex: '#fff3c4' },
  { cls: 'A', color: 'أبيض', lo: 9000, hi: 9000, hex: '#ffffff' },
  { cls: 'B', color: 'أبيض مزرق', lo: 11000, hi: 25000, hex: '#cfe3ff' },
  { cls: 'O', color: 'أبيض مزرق', lo: 60000, hi: 60000, hex: '#a9c8ff' },
] as const
export type StarCls = (typeof STAR_CLASSES)[number]['cls']
export const STAR_SKY: { x: number; y: number; k: number; cls: StarCls }[] = (() => {
  const seq: StarCls[] = ['M', 'K', 'G', 'F', 'A', 'B', 'O', 'M', 'K', 'G', 'A', 'B']
  const temps: Record<StarCls, number> = { M: 3000, K: 4300, G: 5500, F: 6700, A: 9000, B: 15000, O: 60000 }
  return seq.map((cls, i) => ({ x: 30 + ((i * 97) % 260), y: 25 + ((i * 53) % 150), k: temps[cls], cls }))
})()
export function classifyStar(tempK: number): StarCls {
  // الأقرب مجالاً (الجدول يتداخل بين M وK، فنفضّل الأدنى)
  if (tempK < 3500) return 'M'
  if (tempK < 5000) return 'K'
  if (tempK < 6000) return 'G'
  if (tempK < 7500) return 'F'
  if (tempK < 10000) return 'A'
  if (tempK < 30000) return 'B'
  return 'O'
}

/** ---- ٩-١ خميرة: حجم غاز CO₂ المنطلق (مل) ---- */
export function yeastVolume(sugar: boolean, warm: boolean, minutes: number): number {
  const rate = sugar ? (warm ? 1.2 : 0.15) : 0.03
  return Math.round(rate * minutes * 10) / 10
}

/** ---- ٩-٢ شرائح مجهرية ---- */
export const SLIDES = [
  { id: 'bone', name: 'عظم', answer: 'خلايا عظمية موزّعة في حلقات حول قنوات صغيرة' },
  { id: 'muscle', name: 'عضلة هيكلية', answer: 'ألياف طويلة عليها خطوط متعاقبة' },
  { id: 'skin', name: 'جلد', answer: 'خلايا مسطّحة متراصّة في طبقات' },
] as const

/** ---- ١١-٢ ذراع: العضلتان متضادتان ---- */
export const armAngle = (biceps: number) => 170 - 1.2 * biceps // biceps 0–100 → زاوية الكوع

/** ---- ١٢-١ كثافة الجماعة الحيوية ---- */
export function genField(seed: number, perCell: number): number[] {
  // ١٠٠ خلية (١٠×١٠ م²) فيها عدد الأفراد في كل خلية
  let a = seed >>> 0
  const rnd = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return Array.from({ length: 100 }, () => Math.max(0, Math.round(perCell + (rnd() - 0.5) * 2)))
}
export const COMMUNITIES = [
  { id: 'أ', perCell: 2, seed: 11 }, { id: 'ب', perCell: 5, seed: 22 }, { id: 'ج', perCell: 9, seed: 33 },
] as const
export const trueDensity = (cells: number[]) => cells.reduce((s, x) => s + x, 0) / cells.length

/** ---- ١٢-٢ الشبكة الغذائية (من يأكل مَن: [المأكول، الآكل]) ---- */
export const WEB_NODES = [
  { id: 'plant', name: 'العشب', emoji: '🌿', x: 160, y: 190, role: 'منتج' },
  { id: 'hopper', name: 'الجراد', emoji: '🦗', x: 70, y: 130, role: 'مستهلك أول' },
  { id: 'mouse', name: 'الفأر', emoji: '🐭', x: 250, y: 130, role: 'مستهلك أول' },
  { id: 'lizard', name: 'الضب', emoji: '🦎', x: 70, y: 70, role: 'مستهلك ثانٍ' },
  { id: 'snake', name: 'الأفعى', emoji: '🐍', x: 250, y: 70, role: 'مستهلك ثانٍ' },
  { id: 'falcon', name: 'الصقر', emoji: '🦅', x: 160, y: 22, role: 'مستهلك ثالث' },
] as const
export const WEB_EDGES: [string, string][] = [
  ['plant', 'hopper'], ['plant', 'mouse'], ['hopper', 'lizard'], ['mouse', 'snake'], ['lizard', 'falcon'], ['snake', 'falcon'], ['mouse', 'falcon'],
]

/** ---- ١٣-١ مجمّع الطاقة الشمسية: درجة حرارة الصندوق ---- */
export function boxTemp(black: boolean, cover: boolean, insulated: boolean, minute: number, start = 22): number {
  const gain = 8 + (black ? 20 : 0) + (cover ? 14 : 0) + (insulated ? 6 : 0)
  return Math.round((start + gain * (1 - Math.exp(-minute / 10))) * 10) / 10
}

/** ---- ١٣-٢ الدفيئة ---- */
export function bottleTemp(co2: boolean, minute: number, start = 22): number {
  const gain = co2 ? 15 : 9
  return Math.round((start + gain * (1 - Math.exp(-minute / 9))) * 10) / 10
}
