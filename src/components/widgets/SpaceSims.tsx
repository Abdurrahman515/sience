import { useEffect, useRef, useState } from 'react'
import type { SeasonGoal, WidgetSpec } from '../../content/types'
import { Inline } from '../Text'
import { toArabicDigits } from '../../lib/arabicText'

type Done = { onDone: () => void }

/* ================= أطوار القمر ================= */

/** موضع القمر حول الأرض: ٠ = المحاق (القمر بين الأرض والشمس) ثم يدور حتى ٧. */
export const MOON_PHASES = [
  { name: 'المحاق', icon: '🌑', where: 'القمر بين الأرض والشمس، والجزء المضاء منه موجّه للشمس بعيداً عنّا' },
  { name: 'الهلال الجديد', icon: '🌒', where: 'بدأنا نشوف شريطاً رفيعاً من الجزء المضاء' },
  { name: 'التربيع الأول', icon: '🌓', where: 'نصف القرص المضاء ظاهر لنا، وهو ربع دورة من المحاق' },
  { name: 'الأحدب الأول', icon: '🌔', where: 'أكثر من نصف القرص مضاء، والمساحة المضاءة تزداد' },
  { name: 'البدر', icon: '🌕', where: 'الأرض بين الشمس والقمر تقريباً، فنشوف كل الوجه المضاء' },
  { name: 'الأحدب الأخير', icon: '🌖', where: 'المساحة المضاءة بدأت تتناقص' },
  { name: 'التربيع الأخير', icon: '🌗', where: 'نصف القرص المضاء ظاهر لنا من الجهة الأخرى' },
  { name: 'الهلال الأخير', icon: '🌘', where: 'شريط رفيع من الجزء المضاء قبل العودة للمحاق' },
] as const

export const MOON_START = 2

export function MoonSim({ spec, onDone }: { spec: Extract<WidgetSpec, { kind: 'moon' }> } & Done) {
  const [idx, setIdx] = useState(0)
  const [pos, setPos] = useState(MOON_START)
  const goal = spec.goals[idx]
  const solved = pos === goal
  const last = idx === spec.goals.length - 1
  const fired = useRef(false)
  useEffect(() => {
    if (solved && last && !fired.current) {
      fired.current = true
      onDone()
    }
  }, [solved, last, onDone])
  const phase = MOON_PHASES[pos]
  return (
    <div className="card widget">
      <h3>🌙 جرّبي بنفسك: أطوار القمر</h3>
      <p className="meta">{`المهمة ${toArabicDigits(idx + 1)} من ${toArabicDigits(spec.goals.length)}`}</p>
      <p className="prompt">
        <Inline text={`حرّكي القمر حول الأرض حتى يظهر لنا طور **${MOON_PHASES[goal].name}**.`} />
      </p>
      <label className="slider">
        <span>
          موضع القمر في دورته: <strong>{toArabicDigits(pos)}</strong> من ٧
        </span>
        <input type="range" min={0} max={7} step={1} value={pos} onChange={(e) => setPos(Number(e.target.value))} disabled={solved} />
      </label>
      <div className="moon-stage" aria-hidden="true">
        <span>☀️</span>
        <span>🌍</span>
        <span className="moon-big">{phase.icon}</span>
      </div>
      <div className={`feedback ${solved ? 'ok' : 'bad'}`} role="status">
        <Inline text={solved ? `هيك بدها! هاد **${phase.name}**: ${phase.where}.` : `هون بيظهر **${phase.name}**. ${phase.where}. جرّبي موضع تاني 🤔`} />
      </div>
      {solved && !last && (
        <button
          type="button"
          className="btn"
          onClick={() => {
            setIdx((i) => i + 1)
            setPos(MOON_START)
          }}
        >
          المهمة التالية
        </button>
      )}
    </div>
  )
}

/* ================= الفصول الأربعة ================= */

export const ORBIT_SPOTS: { id: SeasonGoal; label: string }[] = [
  { id: 'summer', label: 'حزيران (يونيو)' },
  { id: 'autumn', label: 'أيلول (سبتمبر)' },
  { id: 'winter', label: 'كانون الأول (ديسمبر)' },
  { id: 'spring', label: 'آذار (مارس)' },
]

export const SEASON_NAME: Record<SeasonGoal, string> = {
  summer: 'الصيف',
  autumn: 'الخريف',
  winter: 'الشتاء',
  spring: 'الربيع',
}

export const SEASON_WHY: Record<SeasonGoal, string> = {
  summer: 'الجزء الشمالي من الأرض مائل نحو الشمس، فأشعتها بتسقط بزاوية شبه عمودية والنهار طويل.',
  autumn: 'محور الأرض ما بيميل نحو الشمس ولا بعيداً عنها، فالجو معتدل.',
  winter: 'الجزء الشمالي مائل بعيداً عن الشمس، فأشعتها بتسقط بزاوية أقل والنهار قصير.',
  spring: 'محور الأرض ما بيميل نحو الشمس ولا بعيداً عنها، فالجو معتدل.',
}

export const SEASON_PROMPT: Record<SeasonGoal, string> = {
  summer: 'اختاري موقع الأرض في مدارها ليكون **الصيف** في نصفها الشمالي.',
  autumn: 'اختاري موقع الأرض في مدارها ليكون **الخريف** في نصفها الشمالي.',
  winter: 'اختاري موقع الأرض في مدارها ليكون **الشتاء** في نصفها الشمالي.',
  spring: 'اختاري موقع الأرض في مدارها ليكون **الربيع** في نصفها الشمالي.',
}

export function SeasonsSim({ spec, onDone }: { spec: Extract<WidgetSpec, { kind: 'seasons' }> } & Done) {
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<SeasonGoal | null>(null)
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
  return (
    <div className="card widget">
      <h3>🌍 جرّبي بنفسك: فصول السنة</h3>
      <p className="meta">{`المهمة ${toArabicDigits(idx + 1)} من ${toArabicDigits(spec.goals.length)}`}</p>
      <p className="prompt">
        <Inline text={SEASON_PROMPT[goal]} />
      </p>
      <div className="chips">
        {ORBIT_SPOTS.map((s) => (
          <button key={s.id} type="button" className={`chip${picked === s.id ? ' selected' : ''}`} onClick={() => !solved && setPicked(s.id)} disabled={solved}>
            {s.label}
          </button>
        ))}
      </div>
      {picked && !solved && (
        <div className="feedback bad" role="status">
          <Inline text={`في هاد الموقع بيكون عندنا **${SEASON_NAME[picked]}**. ${SEASON_WHY[picked]} بس هاد مو المطلوب، جرّبي موقع تاني 🤔`} />
        </div>
      )}
      {solved && (
        <div className="feedback ok" role="status">
          <Inline text={`هيك بدها! **${SEASON_NAME[goal]}**: ${SEASON_WHY[goal]}`} />
        </div>
      )}
      {solved && !last && (
        <button
          type="button"
          className="btn"
          onClick={() => {
            setIdx((i) => i + 1)
            setPicked(null)
          }}
        >
          المهمة التالية
        </button>
      )}
    </div>
  )
}
