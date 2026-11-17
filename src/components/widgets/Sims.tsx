import { useEffect, useRef, useState } from 'react'
import type { WidgetSpec } from '../../content/types'
import { Inline } from '../Text'
import { formatNumber, toArabicDigits } from '../../lib/arabicText'

type Done = { onDone: () => void }

export function Slider(props: {
  label: string; unit: string; min: number; max: number; step: number
  value: number; onChange: (v: number) => void
}) {
  return (
    <label className="slider">
      <span>
        {props.label}: <strong>{toArabicDigits(props.value)}</strong> {props.unit}
      </span>
      <input
        type="range" min={props.min} max={props.max} step={props.step} value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
    </label>
  )
}

export function Success({ show, text }: { show: boolean; text: string }) {
  return show ? (
    <div className="feedback ok" role="status">
      <Inline text={text} />
    </div>
  ) : null
}

/** ---------- محاكي السرعة ---------- */
export function SpeedSim({ spec, onDone }: { spec: Extract<WidgetSpec, { kind: 'speed' }> } & Done) {
  const [d, setD] = useState(100)
  const [t, setT] = useState(2)
  const v = d / t
  const ok = Math.abs(v - spec.target) < 0.01
  const fired = useRef(false)
  useEffect(() => {
    if (ok && !fired.current) {
      fired.current = true
      onDone()
    }
  }, [ok, onDone])
  return (
    <div className="card widget">
      <h3>🚗 جرّبي بنفسك: السرعة</h3>
      <p className="prompt">
        <Inline text={`حرّكي المنزلقين حتى تصير **السرعة المتوسطة ${spec.target} كم/س**.`} />
      </p>
      <Slider label="المسافة" unit="كم" min={30} max={300} step={10} value={d} onChange={setD} />
      <Slider label="الزمن" unit="ساعة" min={1} max={6} step={1} value={t} onChange={setT} />
      <div className="readout">
        ع = ف ÷ ز = {toArabicDigits(d)} ÷ {toArabicDigits(t)} = <strong>{formatNumber(v)}</strong> كم/س
      </div>
      <div className="track" aria-hidden="true">
        <span className="car" style={{ animationDuration: `${Math.max(0.6, 12 / Math.max(v / 30, 0.5))}s` }}>🚗</span>
      </div>
      <Success show={ok} text="يسلمو إيديكِ! وصلتي للسرعة المطلوبة 🎉" />
    </div>
  )
}

/** ---------- محاكي القوة والتسارع ---------- */
export function ForceSim({ spec, onDone }: { spec: Extract<WidgetSpec, { kind: 'force' }> } & Done) {
  const [F, setF] = useState(20)
  const [m, setM] = useState(10)
  const a = F / m
  const ok = Math.abs(a - spec.target) < 0.01
  const fired = useRef(false)
  useEffect(() => {
    if (ok && !fired.current) {
      fired.current = true
      onDone()
    }
  }, [ok, onDone])
  return (
    <div className="card widget">
      <h3>📦 جرّبي بنفسك: القانون الثاني</h3>
      <p className="prompt">
        <Inline text={`غيّري القوة والكتلة حتى يصير **التسارع ${spec.target} م/ث²**.`} />
      </p>
      <Slider label="القوة" unit="نيوتن" min={5} max={100} step={5} value={F} onChange={setF} />
      <Slider label="الكتلة" unit="كجم" min={1} max={20} step={1} value={m} onChange={setM} />
      <div className="readout">
        ت = ق ÷ ك = {toArabicDigits(F)} ÷ {toArabicDigits(m)} = <strong>{formatNumber(a)}</strong> م/ث²
      </div>
      <svg viewBox="0 0 300 80" className="svg" aria-hidden="true">
        <rect x={20} y={80 - 20 - m * 2} width={20 + m * 3} height={20 + m * 2} rx={4} fill="#ffb74d" />
        <line x1={20 + 20 + m * 3 + 8} y1={50} x2={20 + 20 + m * 3 + 8 + F * 1.6} y2={50} stroke="#e53935" strokeWidth={6} />
      </svg>
      <Success show={ok} text="كفو عليكِ! لقيتي التركيبة الصح 💪" />
    </div>
  )
}

/** ---------- محاكي المستوى المائل ---------- */
export function RampSim({ spec, onDone }: { spec: Extract<WidgetSpec, { kind: 'ramp' }> } & Done) {
  const [h, setH] = useState(1)
  const [L, setL] = useState(2)
  const [push, setPush] = useState(0)
  const ma = L / h
  const ok = Math.abs(ma - spec.target) < 0.01
  const fired = useRef(false)
  useEffect(() => {
    if (ok && !fired.current) {
      fired.current = true
      onDone()
    }
  }, [ok, onDone])
  const hh = 15 + h * 22
  const ll = 40 + L * 18
  const bx = 20
  const by = 110
  const ang = (Math.atan2(hh, ll) * 180) / Math.PI
  const t = push / 100
  return (
    <div className="card widget mach">
      <h3>🛝 جرّبي بنفسك: المستوى المائل</h3>
      <p className="prompt">
        <Inline text={`غيّري ارتفاع الحمل وطول المنحدر حتى تصير **الفائدة الآلية ${spec.target}**، وبعدين ادفعي الصندوق لفوق وشوفي القوة!`} />
      </p>
      <Slider label="الارتفاع" unit="م" min={1} max={3} step={1} value={h} onChange={setH} />
      <Slider label="طول المستوى المائل" unit="م" min={1} max={12} step={1} value={L} onChange={setL} />
      <Slider label="ادفعي الصندوق" unit="%" min={0} max={100} step={10} value={push} onChange={setPush} />
      <div className="readout">
        الفائدة الآلية = الطول ÷ الارتفاع = {toArabicDigits(L)} ÷ {toArabicDigits(h)} = <strong>{formatNumber(ma)}</strong>
        <br />
        لرفع صندوق وزنه ١٠٠ نيوتن تكفي قوة ≈ <strong>{formatNumber(100 / ma, 0)}</strong> نيوتن (وتقطعين مسافة {toArabicDigits(L)} م بدل {toArabicDigits(h)} م).
      </div>
      <svg viewBox="0 0 320 130" className="svg" role="img" aria-label="مستوى مائل وصندوق يصعد عليه">
        <polygon points={`${bx},${by} ${bx + ll},${by} ${bx},${by - hh}`} fill="#90caf9" stroke="#1565c0" strokeWidth={2} />
        <g transform={`translate(${bx + ll * (1 - t)} ${by - hh * t}) rotate(${ang})`} style={{ transition: 'transform .3s' }}>
          <rect x="-11" y="-20" width="22" height="20" rx="3" fill="#ef5350" stroke="#b71c1c" strokeWidth="2" />
        </g>
        <text x={bx + ll / 2} y={by + 16} fontSize="11" fill="#1565c0" textAnchor="middle">
          {`الطول ${toArabicDigits(L)} م · الارتفاع ${toArabicDigits(h)} م`}
        </text>
      </svg>
      <Success show={ok} text="برافو! الآن بتحتاجي قوة أقل لرفع الحمل 🎉" />
    </div>
  )
}

/** ---------- محاكي الكثافة ---------- */
export function DensitySim({ spec, onDone }: { spec: Extract<WidgetSpec, { kind: 'density' }> } & Done) {
  const [m, setM] = useState(10)
  const [V, setV] = useState(2)
  const rho = m / V
  const ok = Math.abs(rho - spec.target) < 0.01
  const fired = useRef(false)
  useEffect(() => {
    if (ok && !fired.current) {
      fired.current = true
      onDone()
    }
  }, [ok, onDone])
  const side = 20 + V * 6
  const dots = Math.min(60, Math.round(m / 2))
  return (
    <div className="card widget">
      <h3>🧱 جرّبي بنفسك: الكثافة</h3>
      <p className="prompt">
        <Inline text={`غيّري الكتلة والحجم حتى تصير **الكثافة ${spec.target} جم/سم³**.`} />
      </p>
      <Slider label="الكتلة" unit="جم" min={2} max={60} step={2} value={m} onChange={setM} />
      <Slider label="الحجم" unit="سم³" min={1} max={20} step={1} value={V} onChange={setV} />
      <div className="readout">
        ث = ك ÷ ح = {toArabicDigits(m)} ÷ {toArabicDigits(V)} = <strong>{formatNumber(rho)}</strong> جم/سم³
      </div>
      <svg viewBox="0 0 200 140" className="svg" aria-hidden="true">
        <rect x={20} y={130 - side} width={side} height={side} fill="#e1f5fe" stroke="#0277bd" strokeWidth={2} />
        {Array.from({ length: dots }, (_, i) => (
          <circle key={i} cx={22 + ((i * 7) % Math.max(side - 4, 6))} cy={128 - ((i * 11) % Math.max(side - 4, 6))} r={2.4} fill="#d81b60" />
        ))}
      </svg>
      <Success show={ok} text="أحسنتِ! الكثافة كمان صارت مظبوطة 🌟" />
    </div>
  )
}

/** ---------- محاكي حالات المادة ---------- */
interface P { x: number; y: number; vx: number; vy: number; hx: number; hy: number }
const W = 300, H = 150

function makeParticles(): P[] {
  const out: P[] = []
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 8; c++) {
      const hx = 40 + c * 32
      const hy = 80 + r * 16
      out.push({ x: hx, y: hy, vx: 0, vy: 0, hx, hy })
    }
  }
  return out
}

export function stateOf(temp: number): 'solid' | 'liquid' | 'gas' {
  if (temp <= 0) return 'solid'
  if (temp < 100) return 'liquid'
  return 'gas'
}

const STATE_LABEL = { solid: 'صلبة (جليد)', liquid: 'سائلة (ماء)', gas: 'غازية (بخار)' } as const

export function StatesSim({ onDone }: Done) {
  const [temp, setTemp] = useState(20)
  const [seen, setSeen] = useState<Set<string>>(new Set(['liquid']))
  const [snapshot, setSnapshot] = useState<P[]>(makeParticles)
  const tempRef = useRef(temp)
  const fired = useRef(false)

  function changeTemp(v: number) {
    tempRef.current = v
    setTemp(v)
    setSeen((s) => (s.has(stateOf(v)) ? s : new Set(s).add(stateOf(v))))
  }

  useEffect(() => {
    if (seen.size === 3 && !fired.current) {
      fired.current = true
      onDone()
    }
  }, [seen, onDone])

  useEffect(() => {
    const ps = makeParticles()
    for (const p of ps) {
      p.vx = Math.random() - 0.5
      p.vy = Math.random() - 0.5
    }
    let raf = 0
    const step = () => {
      const T = tempRef.current
      const st = stateOf(T)
      const speed = 0.4 + Math.max(0, T + 50) / 40
      for (const p of ps) {
        if (st === 'solid') {
          const amp = 1 + Math.max(0, T + 50) / 40
          p.x = p.hx + (Math.random() - 0.5) * amp * 2
          p.y = p.hy + (Math.random() - 0.5) * amp * 2
        } else {
          const top = st === 'liquid' ? 70 : 8
          p.vx += (Math.random() - 0.5) * 0.4
          p.vy += (Math.random() - 0.5) * 0.4
          const v = Math.hypot(p.vx, p.vy) || 1
          p.vx = (p.vx / v) * speed
          p.vy = (p.vy / v) * speed
          p.x += p.vx
          p.y += p.vy
          if (p.x < 8 || p.x > W - 8) p.vx *= -1
          if (p.y < top || p.y > H - 8) p.vy *= -1
          p.x = Math.min(W - 8, Math.max(8, p.x))
          p.y = Math.min(H - 8, Math.max(top, p.y))
        }
      }
      setSnapshot(ps.map((p) => ({ ...p })))
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  const st = stateOf(temp)
  return (
    <div className="card widget">
      <h3>🌡️ جرّبي بنفسك: حالات الماء</h3>
      <p className="prompt">
        <Inline text="حرّكي المنزلق وشوفي كيف تتحرك دقائق الماء. **مرّي على الحالات الثلاث**: صلبة وسائلة وغازية." />
      </p>
      <Slider label="درجة الحرارة" unit="°س" min={-50} max={150} step={5} value={temp} onChange={changeTemp} />
      <div className="readout">
        الحالة: <strong>{STATE_LABEL[st]}</strong>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="svg states" aria-hidden="true">
        <rect x={1} y={1} width={W - 2} height={H - 2} rx={6} fill="none" stroke="#90a4ae" />
        {snapshot.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={6} fill={st === 'solid' ? '#4fc3f7' : st === 'liquid' ? '#29b6f6' : '#b3e5fc'} />
        ))}
      </svg>
      <p className="meta">
        {['solid', 'liquid', 'gas'].map((k) => (seen.has(k) ? '✅' : '⬜')).join(' ')} الحالات التي مررتِ بها
      </p>
      <Success show={seen.size === 3} text="هيك بدها! شفتي الحالات الثلاث 🎉" />
    </div>
  )
}

/** ---------- بناء الذرة ---------- */
const SYMBOLS = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca']
const NAMES = ['الهيدروجين', 'الهيليوم', 'الليثيوم', 'البيريليوم', 'البورون', 'الكربون', 'النيتروجين', 'الأكسجين', 'الفلور', 'النيون', 'الصوديوم', 'المغنيسيوم', 'الألمنيوم', 'السليكون', 'الفوسفور', 'الكبريت', 'الكلور', 'الأرجون', 'البوتاسيوم', 'الكالسيوم']

export function shellsOf(electrons: number): number[] {
  const caps = [2, 8, 8, 2]
  const out: number[] = []
  let left = electrons
  for (const c of caps) {
    if (left <= 0) break
    out.push(Math.min(c, left))
    left -= c
  }
  return out
}

export function AtomSim({ spec, onDone }: { spec: Extract<WidgetSpec, { kind: 'atom' }> } & Done) {
  const [p, setP] = useState(1)
  const [n, setN] = useState(0)
  const ok = p === spec.protons && n === spec.neutrons
  const fired = useRef(false)
  useEffect(() => {
    if (ok && !fired.current) {
      fired.current = true
      onDone()
    }
  }, [ok, onDone])
  const shells = shellsOf(p)
  return (
    <div className="card widget">
      <h3>⚛️ جرّبي بنفسك: ابني ذرة</h3>
      <p className="prompt">
        <Inline text={`ابني ذرة **${spec.name}**: اجعلي عدد البروتونات **${spec.protons}** وعدد النيوترونات **${spec.neutrons}**.`} />
      </p>
      <Slider label="البروتونات" unit="" min={1} max={20} step={1} value={p} onChange={setP} />
      <Slider label="النيوترونات" unit="" min={0} max={25} step={1} value={n} onChange={setN} />
      <div className="readout">
        العنصر: <strong>{NAMES[p - 1]}</strong> ({SYMBOLS[p - 1]}) — العدد الذري: {toArabicDigits(p)} — العدد الكتلي:{' '}
        <strong>{toArabicDigits(p + n)}</strong>
      </div>
      <svg viewBox="0 0 200 200" className="svg atom" aria-hidden="true">
        {shells.map((_, i) => (
          <circle key={i} cx={100} cy={100} r={30 + i * 20} fill="none" stroke="#b0bec5" strokeDasharray="3 3" />
        ))}
        {shells.flatMap((count, i) =>
          Array.from({ length: count }, (_, j) => {
            const ang = (2 * Math.PI * j) / count + i
            return <circle key={`${i}-${j}`} cx={100 + (30 + i * 20) * Math.cos(ang)} cy={100 + (30 + i * 20) * Math.sin(ang)} r={4} fill="#1e88e5" />
          }),
        )}
        {Array.from({ length: p + n }, (_, i) => {
          const ang = i * 2.4
          const r = 3 + Math.sqrt(i) * 2.6
          return <circle key={i} cx={100 + r * Math.cos(ang)} cy={100 + r * Math.sin(ang)} r={3.2} fill={i < p ? '#e53935' : '#78909c'} />
        })}
      </svg>
      <p className="meta">🔴 بروتون (+) &nbsp; ⚪ نيوترون (0) &nbsp; 🔵 إلكترون (−)</p>
      <Success show={ok} text={`أسطورة! هيك بتكوّن ذرة ${spec.name} 🌟`} />
    </div>
  )
}
