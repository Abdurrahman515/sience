import { LESSONS, UNITS, getLesson } from '../content/registry'
import { EXAMS } from '../content/exams'
import type { Block, MC, Question } from '../content/types'
import { normalizeArabic } from '../lib/arabicText'
import { MOON_PHASES, MOON_START } from '../components/widgets/SpaceSims'

/** يفحص سلامة المحتوى ويرجع قائمة بالمشكلات (فارغة = سليم). */
export function checkContent(): string[] {
  const errors: string[] = []
  const ids = new Set<string>()
  const addId = (id: string, where: string) => {
    if (ids.has(id)) errors.push(`معرّف مكرر: ${id} (${where})`)
    ids.add(id)
  }

  const checkMC = (q: MC, where: string, needWhy: boolean) => {
    addId(q.id, where)
    if (!q.q.trim()) errors.push(`${where}: نص السؤال فارغ`)
    if (q.wrongs.length < 1) errors.push(`${where}/${q.id}: لا توجد خيارات خاطئة`)
    const texts = [q.correct, ...q.wrongs.map((w) => w.t)].map(normalizeArabic)
    if (new Set(texts).size !== texts.length) errors.push(`${where}/${q.id}: خيارات مكررة`)
    if (!q.explain.trim()) errors.push(`${where}/${q.id}: لا يوجد شرح`)
    if (needWhy) for (const w of q.wrongs) if (!w.why) errors.push(`${where}/${q.id}: خيار خاطئ بلا تفسير «${w.t}»`)
  }

  const checkQ = (q: Question, where: string, needWhy: boolean) => {
    if (q.kind === 'mc') return checkMC(q, where, needWhy)
    addId(q.id, where)
    if (!Number.isFinite(q.answer)) errors.push(`${where}/${q.id}: إجابة رقمية غير صالحة`)
  }

  for (const l of LESSONS) {
    if (l.blocks.length === 0) errors.push(`${l.id}: درس بلا كتل`)
    if (l.blocks[0].type !== 'say') errors.push(`${l.id}: يجب أن يبدأ الدرس بكتلة شرح`)
    const quizzes = l.blocks.filter((b): b is Extract<Block, { type: 'quiz' }> => b.type === 'quiz')
    const hasInteractive = l.blocks.some((b) => b.type !== 'say')
    if (!hasInteractive) errors.push(`${l.id}: لا توجد كتل تفاعلية`)
    if (quizzes.length < 2) errors.push(`${l.id}: يلزم سؤالان على الأقل`)
    for (const b of l.blocks) {
      if (b.type === 'quiz') checkMC(b.question, l.id, true)
      if (b.type === 'say' && !b.text.trim()) errors.push(`${l.id}: كتلة شرح فارغة`)
      if (b.type === 'reveal' && b.cards.length < 2) errors.push(`${l.id}: بطاقات انكشاف قليلة`)
      if (b.type === 'widget' && b.widget.kind === 'sort') {
        const w = b.widget
        for (const it of w.items) {
          if (it.cat < 0 || it.cat >= w.categories.length) errors.push(`${l.id}: فئة خارج النطاق في «${w.title}»`)
          if (!it.hint) errors.push(`${l.id}: عنصر بلا تلميح في «${w.title}»`)
        }
        const used = new Set(w.items.map((i) => i.cat))
        if (used.size < 2) errors.push(`${l.id}: «${w.title}» يستخدم فئة واحدة فقط`)
      }
      if (b.type === 'widget' && (b.widget.kind === 'wheel' || b.widget.kind === 'wedge' || b.widget.kind === 'screw') && !(b.widget.target > 1)) errors.push(`${l.id}: هدف الفائدة الآلية يجب أن يكون أكبر من ١`)
      if (b.type === 'widget' && b.widget.kind === 'pulley' && !(b.widget.target >= 30 && b.widget.target < 120)) errors.push(`${l.id}: قوة البكرات المسموحة خارج النطاق`)
      if (b.type === 'widget' && b.widget.kind === 'order' && b.widget.steps.length < 3) errors.push(`${l.id}: ترتيب قصير`)
      if (b.type === 'widget' && b.widget.kind === 'mohs' && !(b.widget.hardness > 0 && b.widget.hardness <= 10)) errors.push(`${l.id}: قساوة موهس خارج النطاق`)
      if (b.type === 'widget' && b.widget.kind === 'moon') {
        const g = b.widget.goals
        if (g.length === 0) errors.push(`${l.id}: مهام القمر فارغة`)
        if (g.some((x) => !Number.isInteger(x) || x < 0 || x >= MOON_PHASES.length)) errors.push(`${l.id}: موضع قمر خارج النطاق`)
        if (g.includes(MOON_START)) errors.push(`${l.id}: مهمة القمر لا يجوز أن تساوي موضع البداية`)
        if (new Set(g).size !== g.length) errors.push(`${l.id}: مهام القمر مكررة`)
      }
      if (b.type === 'widget' && b.widget.kind === 'seasons' && (b.widget.goals.length === 0 || new Set(b.widget.goals).size !== b.widget.goals.length)) errors.push(`${l.id}: مهام الفصول فارغة أو مكررة`)
      if (b.type === 'widget' && b.widget.kind === 'plates' && (b.widget.goals.length === 0 || new Set(b.widget.goals).size !== b.widget.goals.length)) errors.push(`${l.id}: مهام الصفائح فارغة أو مكررة`)
    }
    const needBank = l.id.endsWith('inq') ? 0 : 1
    if (needBank && (l.bank.r.length < 4 || l.bank.m.length < 3)) errors.push(`${l.id}: بنك الأسئلة ناقص (r≥4, m≥3)`)
    for (const q of l.bank.r) checkQ(q, `${l.id}/r`, false)
    for (const q of l.bank.m) checkQ(q, `${l.id}/m`, false)
  }

  for (const u of UNITS) {
    for (const c of u.chapters) {
      for (const id of c.lessonIds) {
        const l = getLesson(id)
        if (!l) errors.push(`الوحدة ${u.id}: درس غير موجود ${id}`)
        else if (l.unit !== u.id || l.chapter !== c.id) errors.push(`${id}: وحدة/فصل غير متطابق`)
      }
    }
  }
  const listed = new Set(UNITS.flatMap((u) => u.chapters.flatMap((c) => c.lessonIds)))
  for (const l of LESSONS) if (!listed.has(l.id)) errors.push(`${l.id}: غير مدرج في الفهرس`)

  for (const e of EXAMS) {
    if (e.questions.length < 10) errors.push(`${e.id}: عدد الأسئلة قليل`)
  }
  return errors
}
