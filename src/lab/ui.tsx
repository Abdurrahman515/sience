import { useEffect, useRef, useState, type ReactNode } from 'react'
import { toArabicDigits } from '../lib/arabicText'
import { checkNumericValue } from './numeric'

export const n = toArabicDigits

/** شريط الزمن: منزلق + زر تشغيل يحرّكه تلقائياً */
export function TimeScrub(props: {
  label: string; unit: string; min?: number; max: number; step?: number; value: number
  onChange: (v: number) => void; speed?: number
}) {
  const { min = 0, step = 1 } = props
  const [playing, setPlaying] = useState(false)
  const val = useRef(props.value)
  useEffect(() => {
    val.current = props.value
  }, [props.value])
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      const next = Math.min(props.max, val.current + step)
      props.onChange(next)
      if (next >= props.max) setPlaying(false)
    }, props.speed ?? 250)
    return () => clearInterval(id)
  }, [playing, props.max, props.speed, step]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="timescrub">
      <label className="slider">
        <span>{props.label}: <strong>{n(props.value)}</strong> {props.unit}</span>
        <input type="range" min={min} max={props.max} step={step} value={props.value} onChange={(e) => props.onChange(Number(e.target.value))} />
      </label>
      <button type="button" className="btn small ghost" onClick={() => { if (props.value >= props.max) props.onChange(min); setPlaying((p) => !p) }}>
        {playing ? '⏸ إيقاف' : '▶ شغّلي'}
      </button>
    </div>
  )
}

/** مخطط خطي بسيط (عدة سلاسل) */
export function LineChart(props: {
  series: { name: string; color: string; pts: [number, number][] }[]
  xLabel: string; yLabel: string; xMax: number; yMin: number; yMax: number
}) {
  const W = 320, H = 170, L = 38, B = 28, T = 10, R = 10
  const sx = (x: number) => L + (x / props.xMax) * (W - L - R)
  const sy = (y: number) => H - B - ((y - props.yMin) / (props.yMax - props.yMin)) * (H - B - T)
  const ticks = [0, 0.25, 0.5, 0.75, 1]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="svg chart" role="img" aria-label={`مخطط: ${props.yLabel} مقابل ${props.xLabel}`}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={sy(props.yMin + t * (props.yMax - props.yMin))} y2={sy(props.yMin + t * (props.yMax - props.yMin))} stroke="#e1e5f5" />
          <text x={L - 4} y={sy(props.yMin + t * (props.yMax - props.yMin)) + 4} fontSize="9" textAnchor="start" fill="#6b7090">{n(Math.round(props.yMin + t * (props.yMax - props.yMin)))}</text>
          <text x={sx(t * props.xMax)} y={H - B + 12} fontSize="9" textAnchor="middle" fill="#6b7090">{n(Math.round(t * props.xMax))}</text>
        </g>
      ))}
      <text x={W / 2} y={H - 3} fontSize="10" textAnchor="middle" fill="#4343b5">{props.xLabel}</text>
      <text x={W - 4} y={12} fontSize="10" textAnchor="start" fill="#4343b5">{props.yLabel}</text>
      {props.series.map((s) => (
        <g key={s.name}>
          {s.pts.length > 1 && <polyline fill="none" stroke={s.color} strokeWidth="3" strokeLinejoin="round" points={s.pts.map(([x, y]) => `${sx(x)},${sy(y)}`).join(' ')} />}
          {s.pts.length > 0 && <circle cx={sx(s.pts[s.pts.length - 1][0])} cy={sy(s.pts[s.pts.length - 1][1])} r="4" fill={s.color} />}
        </g>
      ))}
      {props.series.map((s, i) => (
        <g key={`l${s.name}`}>
          <rect x={L + 8} y={T + 12 + i * 14} width="10" height="10" rx="2" fill={s.color} />
          <text x={L + 22} y={T + 21 + i * 14} fontSize="9" textAnchor="end" fill="#1f2340">{s.name}</text>
        </g>
      ))}
    </svg>
  )
}

/** ميزان حرارة */
export function Thermometer({ value, min = 0, max = 80, label }: { value: number; min?: number; max?: number; label?: string }) {
  const f = Math.max(0, Math.min(1, (value - min) / (max - min)))
  return (
    <svg viewBox="0 0 60 150" className="thermo" role="img" aria-label={`${label ?? 'ميزان الحرارة'}: ${value} درجة`}>
      <rect x="24" y="8" width="12" height="104" rx="6" fill="#fff" stroke="#9aa0c0" strokeWidth="2" />
      <rect x="27" y={10 + (1 - f) * 100} width="6" height={f * 100 + 4} fill="#ef5350" style={{ transition: 'all .4s' }} />
      <circle cx="30" cy="120" r="14" fill="#ef5350" stroke="#9aa0c0" strokeWidth="2" />
      <text x="30" y="148" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1f2340">{n(value)}°</text>
    </svg>
  )
}

/** حقل رقمي مع تحقق (يقبل الأرقام العربية والعشرية) */
export function NumField(props: { label: string; expected: number; tol?: number; unit?: string; onCorrect: () => void; hint?: string }) {
  const [text, setText] = useState('')
  const [state, setState] = useState<'idle' | 'ok' | 'bad'>('idle')
  const fired = useRef(false)
  function check() {
    const ok = checkNumericValue(text, props.expected, props.tol ?? 0.05)
    setState(ok ? 'ok' : 'bad')
    if (ok && !fired.current) {
      fired.current = true
      props.onCorrect()
    }
  }
  return (
    <div className={`numfield ${state}`}>
      <label>
        <span>{props.label}</span>
        <input inputMode="decimal" aria-label={props.label} value={text} disabled={state === 'ok'} onChange={(e) => { setText(e.target.value); setState('idle') }} />
      </label>
      {props.unit && <span className="unit-tag">{props.unit}</span>}
      <button type="button" className="btn small" disabled={state === 'ok' || text.trim() === ''} onClick={check}>تحقّقي</button>
      {state === 'ok' && <span className="okmark">✔ مظبوط!</span>}
      {state === 'bad' && <span className="badmark">{props.hint ?? 'قريبة… راجعي القياسات وجرّبي مرة تانية 🔍'}</span>}
    </div>
  )
}

/** شارة مراحل التجربة */
export function Milestones({ items }: { items: { label: string; done: boolean }[] }) {
  return (
    <ul className="milestones" aria-label="مراحل التجربة">
      {items.map((m) => (
        <li key={m.label} className={m.done ? 'done' : ''}>{m.done ? '✅' : '⬜'} {m.label}</li>
      ))}
    </ul>
  )
}

export function Bench({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bench">
      <h4>🧪 {title}</h4>
      {children}
    </section>
  )
}

/** يستدعي onDone مرة واحدة عند تحقق الشرط */
export function useDoneOnce(ok: boolean, onDone: () => void) {
  const fired = useRef(false)
  useEffect(() => {
    if (ok && !fired.current) {
      fired.current = true
      onDone()
    }
  }, [ok, onDone])
}
