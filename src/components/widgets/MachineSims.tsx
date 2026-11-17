import { useEffect, useRef, useState } from 'react'
import type { WidgetSpec } from '../../content/types'
import { Inline } from '../Text'
import { formatNumber, toArabicDigits } from '../../lib/arabicText'
import { Slider, Success } from './Sims'

type Done = { onDone: () => void }

function useOnce(ok: boolean, onDone: () => void) {
  const fired = useRef(false)
  useEffect(() => {
    if (ok && !fired.current) {
      fired.current = true
      onDone()
    }
  }, [ok, onDone])
}

const n = toArabicDigits

/** ======================= الرافعة ======================= */
export type LeverClass = 1 | 2 | 3
export const LEVER_LOAD = 40
export const LEVER_CLASSES: { id: LeverClass; label: string; posLabel: string; example: string }[] = [
  { id: 1, label: 'النوع الأول', posLabel: 'مكان نقطة الارتكاز', example: 'المقص والمفك وأرجوحة التوازن' },
  { id: 2, label: 'النوع الثاني', posLabel: 'مكان الحمل', example: 'عربة اليد وكسّارة البندق' },
  { id: 3, label: 'النوع الثالث', posLabel: 'مكان قوة يدك', example: 'الملقط وصنارة الصيد' },
]

/** مواضع النقاط الثلاث على القضيب (٠–١٠) حسب النوع وموضع المنزلق */
export function leverGeometry(cls: LeverClass, pos: number) {
  if (cls === 1) return { fulcrum: pos, load: 1, effort: 9 }
  if (cls === 2) return { fulcrum: 0, load: pos, effort: 10 }
  return { fulcrum: 0, load: 10, effort: pos }
}

/** أقل قوة تلزم لرفع الحمل (نيوتن): قوة × ذراعها = حمل × ذراعه */
export function leverNeeded(cls: LeverClass, pos: number, load = LEVER_LOAD): number {
  const g = leverGeometry(cls, pos)
  return (load * Math.abs(g.load - g.fulcrum)) / Math.abs(g.effort - g.fulcrum)
}

export function LeverSim({ onDone }: { spec?: Extract<WidgetSpec, { kind: 'lever' }> } & Done) {
  const [cls, setCls] = useState<LeverClass>(1)
  const [pos, setPos] = useState(5)
  const [force, setForce] = useState(20)
  const [lifted, setLifted] = useState<LeverClass[]>([])
  const g = leverGeometry(cls, pos)
  const needed = leverNeeded(cls, pos)
  const isLifted = force >= needed - 1e-9
  const loadArm = Math.abs(g.load - g.fulcrum)
  const effortArm = Math.abs(g.effort - g.fulcrum)
  const ma = effortArm / loadArm

  /** يسجّل النوع كمنجَز إن رُفع الحمل بالقيم الجديدة (بدل التأثير الجانبي) */
  function apply(nc: LeverClass, np: number, nf: number) {
    setCls(nc)
    setPos(np)
    setForce(nf)
    if (nf >= leverNeeded(nc, np) - 1e-9) setLifted((l) => (l.includes(nc) ? l : [...l, nc]))
  }
  useOnce(lifted.length === 3, onDone)

  const X = (p: number) => 30 + p * 28
  const px = X(g.fulcrum)
  const tilt = isLifted ? (cls === 1 ? 11 : -11) : 0
  const meta = LEVER_CLASSES.find((c) => c.id === cls)!
  return (
    <div className="card widget mach">
      <h3>🪃 مختبر الرافعة</h3>
      <p className="prompt">
        <Inline text="ارفعي الحمل بالرافعات الثلاثة. اختاري النوع، حرّكي المنزلق، وزيدي قوة يدك حتى **ينقلب القضيب** ويرتفع الحمل." />
      </p>
      <div className="chips" role="group" aria-label="نوع الرافعة">
        {LEVER_CLASSES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`chip${cls === c.id ? ' on' : ''}${lifted.includes(c.id) ? ' got' : ''}`}
            onClick={() => apply(c.id, 5, force)}
          >
            {lifted.includes(c.id) ? '✅ ' : ''}{c.label}
          </button>
        ))}
      </div>
      <p className="muted-line">مثل: {meta.example}</p>
      <Slider label={meta.posLabel} unit="" min={2} max={8} step={1} value={pos} onChange={(v) => apply(cls, v, force)} />
      <Slider label="قوة يدك" unit="نيوتن" min={5} max={300} step={5} value={force} onChange={(v) => apply(cls, pos, v)} />
      <svg viewBox="0 0 340 190" className="svg" role="img" aria-label="رافعة تتحرك حسب القوة">
        <rect x="0" y="150" width="340" height="40" fill="#e8ecf8" />
        <polygon points={`${px - 16},150 ${px + 16},150 ${px},124`} fill="#7e57c2" />
        <g style={{ transform: `rotate(${tilt}deg)`, transformOrigin: `${px}px 120px`, transition: 'transform .6s cubic-bezier(.3,1.4,.5,1)' }}>
          <rect x="22" y="116" width="296" height="9" rx="4" fill="#8d6e63" />
          <circle cx={px} cy="120" r="5" fill="#fff" stroke="#4e342e" strokeWidth="2" />
          <rect x={X(g.load) - 16} y="86" width="32" height="30" rx="4" fill="#ef5350" stroke="#b71c1c" strokeWidth="2" />
          <text x={X(g.load)} y="106" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="700">{n(LEVER_LOAD)} ن</text>
          {cls === 1 ? (
            <path d={`M${X(g.effort)} 70 L${X(g.effort)} 108 M${X(g.effort) - 7} 99 L${X(g.effort)} 109 L${X(g.effort) + 7} 99`} stroke="#2e9e5b" strokeWidth="4" fill="none" />
          ) : (
            <path d={`M${X(g.effort)} 170 L${X(g.effort)} 130 M${X(g.effort) - 7} 141 L${X(g.effort)} 129 L${X(g.effort) + 7} 141`} stroke="#2e9e5b" strokeWidth="4" fill="none" />
          )}
        </g>
        <text x={X(g.effort)} y={cls === 1 ? 62 : 184} textAnchor="middle" fontSize="12" fill="#1b6b3e" fontWeight="700">{n(force)} ن</text>
        <text x={px} y="146" textAnchor="middle" fontSize="11" fill="#fff" fontWeight="700">ارتكاز</text>
      </svg>
      <div className="readout">
        ذراع الحمل = <strong>{n(loadArm)}</strong> · ذراع القوة = <strong>{n(effortArm)}</strong> · الفائدة الآلية = {n(effortArm)} ÷ {n(loadArm)} = <strong>{formatNumber(ma)}</strong>
        <br />
        أقل قوة تلزم لرفع الحمل: <strong>{formatNumber(needed, 1)}</strong> نيوتن
        {ma < 1 && ' — هنا الفائدة أقل من ١، فتحتاجين قوة أكبر من الحمل، لكن حركة اليد القصيرة تعطي حركة كبيرة للطرف ✨'}
      </div>
      <Success show={lifted.length === 3} text="رائع! رفعتي الحمل بالأنواع الثلاثة، وشفتي كيف يغيّر مكان نقطة الارتكاز كل شي 🎉" />
    </div>
  )
}

/** ======================= البكرات ======================= */
export const PULLEY_LOAD = 120
export const PULLEY_TOP = 20
export const PULLEY_SYSTEMS = [
  { strands: 1, label: 'بكرة ثابتة' },
  { strands: 2, label: 'بكرة متحركة' },
  { strands: 3, label: 'نظام ٣ حبال' },
  { strands: 4, label: 'نظام ٤ حبال' },
]

export function pulleyEffort(strands: number, load = PULLEY_LOAD) {
  return load / strands
}

export function PulleySim({ spec, onDone }: { spec: Extract<WidgetSpec, { kind: 'pulley' }> } & Done) {
  const [strands, setStrands] = useState(1)
  const [pull, setPull] = useState(0)
  const effort = pulleyEffort(strands)
  const rise = Math.min(pull / strands, PULLEY_TOP)
  const atTop = rise >= PULLEY_TOP - 1e-9
  const ok = atTop && effort <= spec.target
  useOnce(ok, onDone)
  const blockY = 190 - rise * 4
  const handY = 70 + pull * 1.4
  const xs = Array.from({ length: strands }, (_, i) => (strands === 1 ? 128 : 100 + (i * 70) / (strands - 1)))
  return (
    <div className="card widget mach">
      <h3>🎡 مختبر البكرات</h3>
      <p className="prompt">
        <Inline text={`الحمل **${n(PULLEY_LOAD)} نيوتن**. اختاري نظام البكرات، ثم اسحبي الحبل حتى يصل الحمل للأعلى بقوة لا تزيد على **${n(spec.target)} نيوتن**.`} />
      </p>
      <div className="chips" role="group" aria-label="نظام البكرات">
        {PULLEY_SYSTEMS.map((s) => (
          <button
            key={s.strands}
            type="button"
            className={`chip${strands === s.strands ? ' on' : ''}`}
            onClick={() => { setStrands(s.strands); setPull(0) }}
          >
            {s.label}
          </button>
        ))}
      </div>
      <Slider label="طول الحبل المسحوب" unit="سم" min={0} max={80} step={1} value={pull} onChange={setPull} />
      <svg viewBox="0 0 320 250" className="svg" role="img" aria-label="نظام بكرات يرفع حملاً">
        <rect x="60" y="30" width="200" height="10" rx="3" fill="#8d6e63" />
        <circle cx="240" cy="52" r="13" fill="#fff" stroke="#5b5bd6" strokeWidth="3" />
        <circle cx="240" cy="52" r="3" fill="#5b5bd6" />
        {strands === 1 ? (
          <>
            <line x1="227" y1="52" x2="227" y2={blockY} stroke="#6d4c41" strokeWidth="3" />
          </>
        ) : (
          <>
            {xs.map((x) => (
              <line key={x} x1={x} y1="40" x2={x} y2={blockY} stroke="#6d4c41" strokeWidth="3" />
            ))}
            <line x1="100" y1="40" x2="240" y2="40" stroke="#6d4c41" strokeWidth="0" />
            <path d={`M${xs[xs.length - 1]} 40 Q ${(xs[xs.length - 1] + 227) / 2} 36 227 52`} stroke="#6d4c41" strokeWidth="3" fill="none" />
          </>
        )}
        <line x1="253" y1="52" x2="253" y2={handY} stroke="#6d4c41" strokeWidth="3" />
        <text x="253" y={handY + 22} textAnchor="middle" fontSize="20">✋</text>
        <rect x={strands === 1 ? 207 : 88} y={blockY} width={strands === 1 ? 40 : Math.max(60, (xs[xs.length - 1] ?? 100) - 100 + 24)} height="34" rx="6" fill="#ef5350" stroke="#b71c1c" strokeWidth="2" />
        <text x={strands === 1 ? 227 : 88 + Math.max(60, (xs[xs.length - 1] ?? 100) - 100 + 24) / 2} y={blockY + 22} textAnchor="middle" fontSize="12" fill="#fff" fontWeight="700">{n(PULLEY_LOAD)} ن</text>
        <text x="110" y="22" textAnchor="middle" fontSize="12" fill="#4343b5" fontWeight="700">الحبال الحاملة: {n(strands)}</text>
      </svg>
      <div className="readout">
        القوة المبذولة = {n(PULLEY_LOAD)} ÷ {n(strands)} = <strong>{formatNumber(effort)}</strong> نيوتن · الفائدة الآلية = <strong>{n(strands)}</strong>
        <br />
        سحبتِ <strong>{n(pull)}</strong> سم فارتفع الحمل <strong>{formatNumber(rise, 1)}</strong> سم — كلما قلّت القوة طالت المسافة!
      </div>
      <Success show={ok} text="يسلمو إيديكِ! رفعتي الحمل بقوة قليلة، بس سحبتي حبل أطول 🎉" />
      {atTop && !ok && <div className="feedback bad" role="status">وصل الحمل للأعلى لكن قوتك كبيرة ({n(Math.round(effort))} ن). جرّبي نظاماً فيه حبال أكتر.</div>}
    </div>
  )
}

/** ======================= العجلة والمحور ======================= */
export const WHEEL_LOAD = 60
export function WheelSim({ spec, onDone }: { spec: Extract<WidgetSpec, { kind: 'wheel' }> } & Done) {
  const [R, setR] = useState(3)
  const [r, setRr] = useState(2)
  const [turn, setTurn] = useState(0)
  const ma = R / r
  const effort = WHEEL_LOAD / ma
  const ok = ma >= spec.target && turn >= 360
  useOnce(ok, onDone)
  const wr = R * 10
  const ar = r * 8
  const cx = 110
  const cy = 95
  const rise = Math.min((ar * (turn * Math.PI)) / 180, 120)
  const bucketY = 200 - rise
  return (
    <div className="card widget mach">
      <h3>🎡 مختبر العجلة والمحور</h3>
      <p className="prompt">
        <Inline text={`كبّري العجلة أو صغّري المحور حتى تصير **الفائدة الآلية ${n(spec.target)} أو أكثر**، ثم لفّي المقبض لفّة كاملة على الأقل لتسحبي الدلو.`} />
      </p>
      <Slider label="نصف قطر العجلة" unit="وحدة" min={2} max={8} step={1} value={R} onChange={setR} />
      <Slider label="نصف قطر المحور" unit="وحدة" min={1} max={3} step={1} value={r} onChange={setRr} />
      <Slider label="لفّي المقبض" unit="°" min={0} max={720} step={30} value={turn} onChange={setTurn} />
      <svg viewBox="0 0 320 240" className="svg" role="img" aria-label="عجلة ومحور يرفعان دلواً">
        <g style={{ transform: `rotate(${turn}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: 'transform .3s' }}>
          <circle cx={cx} cy={cy} r={wr} fill="#e3f2fd" stroke="#1565c0" strokeWidth="4" />
          {[0, 60, 120].map((a) => (
            <line key={a} x1={cx - wr * Math.cos((a * Math.PI) / 180)} y1={cy - wr * Math.sin((a * Math.PI) / 180)} x2={cx + wr * Math.cos((a * Math.PI) / 180)} y2={cy + wr * Math.sin((a * Math.PI) / 180)} stroke="#90caf9" strokeWidth="3" />
          ))}
          <circle cx={cx + wr - 5} cy={cy} r="6" fill="#ffb300" stroke="#e65100" strokeWidth="2" />
        </g>
        <circle cx={cx} cy={cy} r={ar} fill="#8d6e63" stroke="#4e342e" strokeWidth="3" />
        <line x1={cx + ar} y1={cy} x2={cx + ar} y2={bucketY} stroke="#6d4c41" strokeWidth="3" />
        <path d={`M${cx + ar - 14} ${bucketY} h28 l-5 24 h-18 z`} fill="#ef5350" stroke="#b71c1c" strokeWidth="2" />
        <text x="262" y="30" fontSize="12" fill="#4343b5" fontWeight="700" textAnchor="middle">نصف قطر العجلة {n(R)}</text>
        <text x="262" y="48" fontSize="12" fill="#6d4c41" fontWeight="700" textAnchor="middle">نصف قطر المحور {n(r)}</text>
      </svg>
      <div className="readout">
        الفائدة الآلية = نصف قطر العجلة ÷ نصف قطر المحور = {n(R)} ÷ {n(r)} = <strong>{formatNumber(ma)}</strong>
        <br />
        القوة اللازمة على حافة العجلة لسحب دلو وزنه {n(WHEEL_LOAD)} ن = <strong>{formatNumber(effort, 1)}</strong> ن
      </div>
      <Success show={ok} text="أحسنتِ! العجلة الكبيرة والمحور الرفيع بيعطوكِ قوة مضاعفة 🎉" />
    </div>
  )
}

/** ======================= الإسفين ======================= */
export const WEDGE_FORCE = 120
export function WedgeSim({ spec, onDone }: { spec: Extract<WidgetSpec, { kind: 'wedge' }> } & Done) {
  const [len, setLen] = useState(4)
  const [thick, setThick] = useState(2)
  const [depth, setDepth] = useState(0)
  const ma = len / thick
  const split = depth >= 100
  const ok = ma >= spec.target && split
  useOnce(ok, onDone)
  const L = len * 9
  const W = thick * 12
  const tipY = 70 + (depth / 100) * L * 0.6
  const open = (W * depth) / 100
  return (
    <div className="card widget mach">
      <h3>🪓 مختبر الإسفين</h3>
      <p className="prompt">
        <Inline text={`اجعلي الإسفين **أطول وأرفع** حتى تصير الفائدة الآلية **${n(spec.target)} أو أكثر**، ثم ادفعيه كله داخل الجذع ليتشقّق.`} />
      </p>
      <Slider label="طول الإسفين" unit="سم" min={4} max={20} step={2} value={len} onChange={setLen} />
      <Slider label="عرض ظهر الإسفين" unit="سم" min={1} max={4} step={1} value={thick} onChange={setThick} />
      <Slider label="ادفعي الإسفين" unit="%" min={0} max={100} step={10} value={depth} onChange={setDepth} />
      <svg viewBox="0 0 320 230" className="svg" role="img" aria-label="إسفين يشقّ جذعاً">
        <rect x="40" y="90" width={120 - open / 2} height="110" rx="6" fill="#a1887f" stroke="#5d4037" strokeWidth="3" />
        <rect x={160 + open / 2} y="90" width={120 - open / 2} height="110" rx="6" fill="#a1887f" stroke="#5d4037" strokeWidth="3" />
        {split && <text x="160" y="150" textAnchor="middle" fontSize="22">💥</text>}
        <polygon points={`${160 - W / 2},${tipY - L * 0.6} ${160 + W / 2},${tipY - L * 0.6} 160,${tipY}`} fill="#b0bec5" stroke="#455a64" strokeWidth="3" />
        <text x="160" y="22" textAnchor="middle" fontSize="12" fill="#4343b5" fontWeight="700">الطول {n(len)} سم · العرض {n(thick)} سم</text>
      </svg>
      <div className="readout">
        الفائدة الآلية = الطول ÷ العرض = {n(len)} ÷ {n(thick)} = <strong>{formatNumber(ma)}</strong>
        <br />
        بقوة دفع {n(WEDGE_FORCE)} ن، القوة الجانبية التي تفلق الخشب ≈ <strong>{formatNumber(WEDGE_FORCE * ma, 0)}</strong> ن
      </div>
      <Success show={ok} text="كفو عليكِ! الإسفين الطويل الرفيع بيحوّل دفعة صغيرة لقوة كبيرة بتشق الخشب 🎉" />
    </div>
  )
}

/** ======================= البرغي ======================= */
export const SCREW_CIRC = 24
export const SCREW_WOOD = 20
export function ScrewSim({ spec, onDone }: { spec: Extract<WidgetSpec, { kind: 'screw' }> } & Done) {
  const [pitch, setPitch] = useState(8)
  const [turns, setTurns] = useState(0)
  const ma = SCREW_CIRC / pitch
  const depth = Math.min(turns * pitch, SCREW_WOOD)
  const ok = ma >= spec.target && depth >= SCREW_WOOD
  useOnce(ok, onDone)
  const sp = pitch * 4
  const offset = 0
  const top = 40 + depth * 4
  return (
    <div className="card widget mach">
      <h3>🔩 مختبر البرغي</h3>
      <p className="prompt">
        <Inline text={`قرّبي سنون البرغي من بعضها حتى تصير الفائدة الآلية **${n(spec.target)} أو أكثر**، ثم لفّيه حتى يغرق كله في الخشب.`} />
      </p>
      <Slider label="المسافة بين السنون" unit="ملم" min={1} max={8} step={1} value={pitch} onChange={setPitch} />
      <Slider label="عدد لفّات المفك" unit="لفّة" min={0} max={20} step={1} value={turns} onChange={setTurns} />
      <svg viewBox="0 0 320 230" className="svg" role="img" aria-label="برغي يدخل في الخشب">
        <rect x="40" y="130" width="140" height="80" rx="6" fill="#d7b98e" stroke="#8d6e63" strokeWidth="3" />
        <g style={{ transform: `translateY(${top - 40}px)`, transition: 'transform .4s' }}>
          <rect x="95" y="20" width="30" height="14" rx="4" fill="#78909c" stroke="#37474f" strokeWidth="2" />
          <rect x="104" y="34" width="12" height="100" fill="#b0bec5" stroke="#37474f" strokeWidth="2" />
          {Array.from({ length: Math.floor(100 / sp) }, (_, i) => (
            <line key={i} x1="98" y1={40 + offset + i * sp + 5} x2="122" y2={40 + offset + i * sp} stroke="#37474f" strokeWidth="2.5" />
          ))}
        </g>
        <polygon points={`210,200 300,200 300,${200 - pitch * 4}`} fill="#e8eaf6" stroke="#5b5bd6" strokeWidth="3" />
        <text x="255" y="218" textAnchor="middle" fontSize="11" fill="#4343b5">محيط الدائرة {n(SCREW_CIRC)}</text>
        <text x="306" y={200 - pitch * 2} fontSize="11" fill="#4343b5">{n(pitch)}</text>
        <text x="255" y="124" textAnchor="middle" fontSize="12" fill="#4343b5" fontWeight="700">اللولب = مستوى مائل ملفوف</text>
      </svg>
      <div className="readout">
        الفائدة الآلية ≈ المحيط ÷ المسافة بين السنون = {n(SCREW_CIRC)} ÷ {n(pitch)} = <strong>{formatNumber(ma)}</strong>
        <br />
        دخل البرغي <strong>{formatNumber(depth, 0)}</strong> ملم من أصل {n(SCREW_WOOD)} — كلما قلّت المسافة بين السنون احتجتِ لفّات أكتر بس بقوة أقل.
      </div>
      <Success show={ok} text="يسلمو ايدك! السنون القريبة بتخلّي الغرز أسهل 🎉" />
    </div>
  )
}
