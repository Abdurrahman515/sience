import { useEffect, useRef, useState } from 'react'
import type { PlateGoal, WidgetSpec } from '../../content/types'
import { Inline } from '../Text'
import { formatNumber, toArabicDigits } from '../../lib/arabicText'

type Done = { onDone: () => void }

/* ================= اختبار الخدش (مقياس موهس) ================= */

export const MOHS_TOOLS = [
  { name: 'الظفر', h: 2.5 },
  { name: 'قطعة النقد', h: 3 },
  { name: 'مسمار الحديد', h: 4.5 },
  { name: 'الزجاج', h: 5.5 },
  { name: 'المبرد الفولاذي', h: 6.5 },
] as const

/** الأداة الأقسى من العيّنة تخدشها. تُرجع الحدّين الأدنى والأعلى لقساوة العيّنة. */
export function mohsBounds(
  hardness: number,
  testedNames: string[],
): { lower: number | null; upper: number | null } {
  let lower: number | null = null
  let upper: number | null = null
  for (const t of MOHS_TOOLS) {
    if (!testedNames.includes(t.name)) continue
    if (t.h > hardness) upper = upper === null ? t.h : Math.min(upper, t.h)
    else lower = lower === null ? t.h : Math.max(lower, t.h)
  }
  return { lower, upper }
}

export function MohsSim({ spec, onDone }: { spec: Extract<WidgetSpec, { kind: 'mohs' }> } & Done) {
  const [tested, setTested] = useState<string[]>([])
  const all = tested.length === MOHS_TOOLS.length
  const fired = useRef(false)
  useEffect(() => {
    if (all && !fired.current) {
      fired.current = true
      onDone()
    }
  }, [all, onDone])
  const { lower, upper } = mohsBounds(spec.hardness, tested)
  const test = (name: string) => setTested((t) => (t.includes(name) ? t : [...t, name]))
  let conclusion = ''
  if (all) {
    if (lower !== null && upper !== null) conclusion = `قساوة العيّنة بين **${formatNumber(lower)}** و**${formatNumber(upper)}** على مقياس موهس.`
    else if (upper !== null) conclusion = `قساوة العيّنة أقل من **${formatNumber(upper)}**.`
    else if (lower !== null) conclusion = `قساوة العيّنة أكبر من **${formatNumber(lower)}**.`
  }
  return (
    <div className="card widget">
      <h3>🔬 جرّبي بنفسك: اختبار الخدش</h3>
      <p className="prompt">
        <Inline text="عندنا عيّنة معدن مجهولة. جرّبي خدشها بكل أداة، والأداة **الأقسى** من العيّنة هي اللي بتخدشها." />
      </p>
      <div className="chips">
        {MOHS_TOOLS.map((t) => (
          <button key={t.name} type="button" className={`chip${tested.includes(t.name) ? ' selected' : ''}`} onClick={() => test(t.name)}>
            {`جرّبي ${t.name}`}
          </button>
        ))}
      </div>
      <ul className="sim-log">
        {MOHS_TOOLS.filter((t) => tested.includes(t.name)).map((t) => (
          <li key={t.name}>
            {t.h > spec.hardness
              ? `${t.name} (${formatNumber(t.h)}) خدشت العيّنة ✅`
              : `${t.name} (${formatNumber(t.h)}) ما خدشت العيّنة ❌`}
          </li>
        ))}
      </ul>
      {all && (
        <div className="feedback ok" role="status">
          <Inline text={`${conclusion} برافو عليكِ، هيك بيشتغل الجيولوجيون! 🎉`} />
        </div>
      )}
    </div>
  )
}

/* ================= حدود الصفائح ================= */

export const MOTIONS: { id: PlateGoal; label: string; icon: string }[] = [
  { id: 'divergent', label: 'تتباعدان', icon: '⬅️ ➡️' },
  { id: 'convergent', label: 'تتقاربان', icon: '➡️ ⬅️' },
  { id: 'transform', label: 'تنزلقان جانبياً', icon: '⬆️ ⬇️' },
]

export const PLATE_RESULT: Record<PlateGoal, string> = {
  divergent: 'قوى شدّ: بتتكوّن قشرة جديدة بين الصفيحتين (ظهر محيطي أو وادٍ خسفي).',
  convergent: 'قوى ضغط: بتتصادم الصفيحتان فتتكوّن جبال، أو بتغوص صفيحة وبتتكوّن براكين وجزر.',
  transform: 'قوى قصّ: بتحصل زلازل وصدوع، بدون قشرة جديدة وبدون ما تختفي قشرة.',
}

export const PLATE_PROMPT: Record<PlateGoal, string> = {
  divergent: 'اختاري حركة الصفيحتين لتتكوّن **قشرة جديدة** بينهما (مثل الانهدام العظيم في شرق إفريقيا).',
  convergent: 'اختاري حركة الصفيحتين لتتكوّن **جبال الهمالايا** عند التقائهما.',
  transform: 'اختاري حركة الصفيحتين لتحصل **زلازل وصدوع** من قوى القصّ (مثل منطقة البحر الميت).',
}

export function PlatesSim({ spec, onDone }: { spec: Extract<WidgetSpec, { kind: 'plates' }> } & Done) {
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<PlateGoal | null>(null)
  const goal = spec.goals[idx]
  const solved = picked === goal
  const last = idx === spec.goals.length - 1
  const fired = useRef(false)
  useEffect(() => {
    if (solved && last && !fired.current) {
      fired.current = true
      onDone()
    }
  }, [solved, last, onDone])
  const pick = (m: PlateGoal) => {
    if (!solved) setPicked(m)
  }
  const next = () => {
    setIdx((i) => i + 1)
    setPicked(null)
  }
  return (
    <div className="card widget">
      <h3>🌍 جرّبي بنفسك: حدود الصفائح</h3>
      <p className="meta">{`المهمة ${toArabicDigits(idx + 1)} من ${toArabicDigits(spec.goals.length)}`}</p>
      <p className="prompt">
        <Inline text={PLATE_PROMPT[goal]} />
      </p>
      <div className="plates-stage" aria-hidden="true">
        <div className="plate">صفيحة ١</div>
        <div className="plate-arrows">{MOTIONS.find((m) => m.id === picked)?.icon ?? '❔'}</div>
        <div className="plate">صفيحة ٢</div>
      </div>
      <div className="chips">
        {MOTIONS.map((m) => (
          <button key={m.id} type="button" className={`chip${picked === m.id ? ' selected' : ''}`} onClick={() => pick(m.id)} disabled={solved}>
            {m.label}
          </button>
        ))}
      </div>
      {picked && !solved && (
        <div className="feedback bad" role="status">
          <Inline text={`هاي الحركة بتعطي: ${PLATE_RESULT[picked]} بس هاد مو المطلوب، جرّبي حركة تانية 🤔`} />
        </div>
      )}
      {solved && (
        <div className="feedback ok" role="status">
          <Inline text={`هيك بدها! ${PLATE_RESULT[goal]}`} />
        </div>
      )}
      {solved && !last && (
        <button type="button" className="btn" onClick={next}>
          المهمة التالية
        </button>
      )}
    </div>
  )
}

/* ================= توازن القشرة ================= */

/** نسبة غمر القطعة (٪) بحسب الحمل: كلما زاد الحمل غاصت أكثر. */
export function submergedPercent(load: number): number {
  return Math.round(40 + load * 5)
}

export function BalanceSim({ onDone }: Done) {
  const [load, setLoad] = useState(0)
  const [wentHigh, setWentHigh] = useState(false)
  const [rebounded, setRebounded] = useState(false)
  const change = (v: number) => {
    setLoad(v)
    if (v >= 8) setWentHigh(true)
    if (wentHigh && v <= 1) setRebounded(true)
  }
  const fired = useRef(false)
  useEffect(() => {
    if (rebounded && !fired.current) {
      fired.current = true
      onDone()
    }
  }, [rebounded, onDone])
  const sub = submergedPercent(load)
  return (
    <div className="card widget">
      <h3>🧊 جرّبي بنفسك: توازن القشرة الأرضية</h3>
      <p className="prompt">
        <Inline text="القشرة بتطفو على الستار متل قطعة الخشب بالماء. **زيدي حمل الجليد** لـ ٨ كم أو أكثر وشوفي شو بيصير، وبعدين **أزيليه** (٠ أو ١ كم) وشوفي كيف بترتفع." />
      </p>
      <label className="slider">
        <span>
          سمك الجليد فوق القشرة: <strong>{toArabicDigits(load)}</strong> كم
        </span>
        <input type="range" min={0} max={10} step={1} value={load} onChange={(e) => change(Number(e.target.value))} />
      </label>
      <div className="balance-stage" aria-hidden="true">
        <div className="balance-block" style={{ height: 60, top: `${30 + sub * 0.4}px` }}>
          {load > 0 ? '🧊'.repeat(Math.min(load, 5)) : 'قشرة'}
        </div>
        <div className="balance-mantle" />
      </div>
      <div className="readout">
        الجزء الغاطس من القشرة: <strong>{toArabicDigits(sub)}</strong>٪
      </div>
      {rebounded && (
        <div className="feedback ok" role="status">
          <Inline text="شفتي؟ لما انصهر الجليد وخفّ الحمل، **ارتفعت القشرة** من جديد. هيك صار بأمريكا الشمالية بعد ذوبان جليدياتها 🎉" />
        </div>
      )}
    </div>
  )
}
