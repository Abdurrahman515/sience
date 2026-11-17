import { useEffect, useState } from 'react'
import { Bench, Milestones, TimeScrub, n, useDoneOnce } from './ui'
import { BRICK_KG, TEMP_BANDS, TEMP_COLORS, brickForces, flaskFade, rollTime, tempBand } from './labLogic'
import { formatNumber } from '../lib/arabicText'
import { Slider } from '../components/widgets/Sims'

export type BenchProps = { onDone: () => void }

/** ====== ١-١: دورقان وسائل ملوّن ====== */
export function ShakeFlasks({ onDone }: BenchProps) {
  const [shakes, setShakes] = useState(1)
  const [seenA, setSeenA] = useState(false)
  const [seenB, setSeenB] = useState(false)
  const [halved, setHalved] = useState(false)
  const [halvedShaken, setHalvedShaken] = useState(false)
  const [active, setActive] = useState<number | null>(null)
  const [t, setT] = useState(0)
  const [times, setTimes] = useState<Record<number, number>>({})
  const fade = active ? flaskFade(active) : 0
  const blue = active ? Math.max(0, 1 - t / fade) : 0

  function setTime(v: number) {
    setT(v)
    if (active && v >= fade) setTimes((o) => ({ ...o, [active]: fade }))
  }
  const ms = [
    { label: 'رجّيتِ الدورقين ولاحظتِ الفرق', done: seenA && seenB },
    { label: 'سكبتِ نصف سائل (ب) ورجّيتِه', done: halvedShaken },
    { label: 'قستِ زمن العودة لرجّة ورجّتين وثلاث', done: [1, 2, 3].every((k) => times[k]) },
  ]
  useDoneOnce(ms.every((m) => m.done), onDone)
  return (
    <Bench title="طاولة الدورقين">
      <div className="chips" role="group" aria-label="عدد الرجّات">
        {[1, 2, 3].map((k) => (
          <button key={k} type="button" className={`chip${shakes === k ? ' on' : ''}`} onClick={() => setShakes(k)}>
            {k === 1 ? 'رجّة واحدة' : k === 2 ? 'رجّتان' : 'ثلاث رجّات'}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 320 190" className="svg" role="img" aria-label="الدورقان أ وب">
        <defs>
          <clipPath id="flaskBClip">
            <path d="M200 40 h30 v35 l30 70 q4 12 -10 12 h-70 q-14 0 -10 -12 l30 -70 z" />
          </clipPath>
        </defs>

        <rect x="0" y="160" width="320" height="30" fill="#d7ccc8" />

        {/* الدورق أ */}
        <path d="M60 40 h30 v35 l30 70 q4 12 -10 12 h-70 q-14 0 -10 -12 l30 -70 z" fill="#fff" stroke="#607d8b" strokeWidth="3" />
        <path d="M41 120 h68 l11 25 q4 12 -10 12 h-68 q-14 0 -10 -12 l11 -25 z" fill="#1e88e5" opacity={0.15 + 0.85 * blue} style={{ transition: 'opacity .3s' }} />
        <text x="90" y="182" textAnchor="middle" fontSize="13" fontWeight="700" fill="#4343b5">الدورق (أ)</text>

        {/* الدورق ب */}
        <path d="M200 40 h30 v35 l30 70 q4 12 -10 12 h-70 q-14 0 -10 -12 l30 -70 z" fill="#fff" stroke="#607d8b" strokeWidth="3" />
        <rect
          x="160"
          y={halved ? 138 : 120}
          width="110"
          height={halved ? 20 : 38}
          fill="#ec407a"
          opacity="0.55"
          clipPath="url(#flaskBClip)"
        />
        <text x="230" y="182" textAnchor="middle" fontSize="13" fontWeight="700" fill="#4343b5">الدورق (ب)</text>
      </svg>
      <div className="actions">
        <button type="button" className="btn" onClick={() => { setSeenA(true); setActive(shakes); setT(0) }}>🫨 رجّي الدورق (أ)</button>
        <button type="button" className="btn" onClick={() => { setSeenB(true); if (halved) setHalvedShaken(true) }}>🫨 رجّي الدورق (ب)</button>
        <button type="button" className="btn ghost" disabled={halved} onClick={() => setHalved(true)}>🥤 اسكبي نصف (ب)</button>
      </div>
      {active !== null && (
        <TimeScrub label="الزمن بعد الرج" unit="ث" max={40} value={t} onChange={setTime} speed={150} />
      )}
      <table className="data">
        <thead><tr><th>عدد الرجّات</th><th>زمن عودة السائل (أ)</th><th>الدورق (ب)</th></tr></thead>
        <tbody>
          {[1, 2, 3].map((k) => (
            <tr key={k}><td>{n(k)}</td><td>{times[k] ? `${n(times[k])} ث` : '—'}</td><td>{seenB ? 'لا يتغيّر' : '—'}</td></tr>
          ))}
        </tbody>
      </table>
      <Milestones items={ms} />
    </Bench>
  )
}

/** ====== ١-٢: خريطة الطقس ====== */
const CITIES = [
  { id: 1, name: 'المدينة ١', t: -4, sym: 'ثلج', icon: '❄️', x: 60, y: 40 },
  { id: 2, name: 'المدينة ٢', t: 3, sym: 'مطر', icon: '🌧️', x: 150, y: 60 },
  { id: 3, name: 'المدينة ٣', t: 12, sym: 'غائم', icon: '☁️', x: 250, y: 40 },
  { id: 4, name: 'المدينة ٤', t: 25, sym: 'مشمس', icon: '☀️', x: 60, y: 130 },
  { id: 5, name: 'المدينة ٥', t: 18, sym: 'غائم جزئياً', icon: '⛅', x: 160, y: 140 },
  { id: 6, name: 'المدينة ٦', t: 8, sym: 'غائم مع رعد', icon: '⛈️', x: 250, y: 120 },
] as const
export const WEATHER_SYMBOLS = ['ثلج', 'مطر', 'غائم', 'مشمس', 'غائم جزئياً', 'غائم مع رعد']

export function WeatherMap({ onDone }: BenchProps) {
  const [sel, setSel] = useState<number>(1)
  const [band, setBand] = useState<number | null>(null)
  const [sym, setSym] = useState<string | null>(null)
  const [solved, setSolved] = useState<number[]>([])
  const [msg, setMsg] = useState('')
  const [front, setFront] = useState<string | null>(null)
  const city = CITIES.find((c) => c.id === sel)!

  function check() {
    if (band === null || sym === null) return
    if (band === tempBand(city.t) && sym === city.sym) {
      setSolved((s) => (s.includes(sel) ? s : [...s, sel]))
      setMsg('✔ قراءة مظبوطة!')
    } else if (band !== tempBand(city.t)) setMsg('لوّن المدينة على الخريطة بيدل على درجة حرارتها، قارني اللون بالمفتاح 🎨')
    else setMsg('رمز الطقس غير مطابق، دقّقي في الرمز فوق المدينة 🔍')
  }
  const ms = [
    { label: 'قرأتِ حرارة وطقس المدن الست', done: solved.length === 6 },
    { label: 'عرفتِ نوع الجبهة على خريطة السعودية', done: front === 'باردة' },
  ]
  useDoneOnce(ms.every((m) => m.done), onDone)
  return (
    <Bench title="خريطة الطقس">
      <svg viewBox="0 0 320 180" className="svg" role="img" aria-label="خريطة طقس تدريبية">
        <rect width="320" height="180" fill="#eef3ff" rx="12" />
        {CITIES.map((c) => (
          <g key={c.id} onClick={() => { setSel(c.id); setBand(null); setSym(null); setMsg('') }} style={{ cursor: 'pointer' }} role="button" aria-label={c.name}>
            <circle cx={c.x} cy={c.y} r="26" fill={TEMP_COLORS[tempBand(c.t)]} stroke={sel === c.id ? '#4343b5' : '#90a4ae'} strokeWidth={sel === c.id ? 4 : 2} />
            <text x={c.x} y={c.y + 6} textAnchor="middle" fontSize="22">{c.icon}</text>
            <text x={c.x} y={c.y + 40} textAnchor="middle" fontSize="10" fill="#1f2340">{solved.includes(c.id) ? `✔ ${n(c.id)}` : n(c.id)}</text>
          </g>
        ))}
      </svg>
      <div className="legend">
        {TEMP_BANDS.map((b, i) => (<span key={b}><i style={{ background: TEMP_COLORS[i] }} /> {b} °س</span>))}
      </div>
      <p><strong>{city.name}</strong> — ما درجة حرارتها؟ وما رمز الطقس؟</p>
      <div className="chips" role="group" aria-label="نطاق الحرارة">
        {TEMP_BANDS.map((b, i) => (<button key={b} type="button" className={`chip${band === i ? ' on' : ''}`} onClick={() => setBand(i)}>{b}</button>))}
      </div>
      <div className="chips" role="group" aria-label="رمز الطقس">
        {WEATHER_SYMBOLS.map((s) => (<button key={s} type="button" className={`chip${sym === s ? ' on' : ''}`} onClick={() => setSym(s)}>{s}</button>))}
      </div>
      <button type="button" className="btn small" disabled={band === null || sym === null} onClick={check}>سجّلي في الجدول</button>
      {msg && <div className={`feedback ${msg.startsWith('✔') ? 'ok' : 'bad'}`} role="status">{msg}</div>}
      <hr />
      <p><strong>الجزء الثاني:</strong> على خريطة المملكة جبهة هوائية تتقدّم بمثلثات ▼ نحو الجنوب الغربي، بين منطقة ضغط مرتفع (H) فوق الرياض ومنخفض (L) قرب نجران. ما نوع الجبهة؟</p>
      <svg viewBox="0 0 320 120" className="svg" role="img" aria-label="جبهة هوائية بين ضغط مرتفع ومنخفض">
        <path d="M20 90 Q80 20 170 35 Q250 40 290 100 Q200 115 120 110 Z" fill="#fff3e0" stroke="#8d6e63" strokeWidth="2" />
        <text x="110" y="62" fontSize="22" fontWeight="700" fill="#c62828">H</text>
        <text x="215" y="95" fontSize="22" fontWeight="700" fill="#1565c0">L</text>
        <path d="M180 40 Q190 70 180 105" stroke="#1565c0" strokeWidth="3" fill="none" />
        {[48, 66, 84, 102].map((y) => (<polygon key={y} points={`180,${y} 190,${y + 4} 180,${y + 9}`} fill="#1565c0" />))}
      </svg>
      <div className="chips" role="group" aria-label="نوع الجبهة">
        {['باردة', 'دافئة', 'مستقرة'].map((f) => (<button key={f} type="button" className={`chip${front === f ? ' on' : ''}`} onClick={() => setFront(f)}>جبهة {f}</button>))}
      </div>
      {front && front !== 'باردة' && <div className="feedback bad" role="status">المثلثات الزرقاء ▼ رمز الجبهة الباردة. الدافئة نصف دوائر، والمستقرة مثلثات ونصف دوائر معاً.</div>}
      <Milestones items={ms} />
    </Bench>
  )
}

/** ====== ٢-١: كرتان على مستوى مائل ====== */
export function MarbleRamp({ onDone }: BenchProps) {
  const [angle, setAngle] = useState<10 | 25>(10)
  const [swapped, setSwapped] = useState(false)
  const [trials, setTrials] = useState<{ angle: number; swapped: boolean }[]>([])
  const [p, setP] = useState(0)
  const [running, setRunning] = useState(false)
  const time = rollTime(angle)
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setP((v) => { if (v >= 1) { setRunning(false); return 1 } return Math.min(1, v + 0.05) }), 40)
    return () => clearInterval(id)
  }, [running])
  const count = (a: number) => trials.filter((t) => t.angle === a).length
  const ms = [
    { label: 'ثلاث محاولات بميل صغير', done: count(10) >= 3 },
    { label: 'ثلاث محاولات بميل كبير', done: count(25) >= 3 },
    { label: 'بدّلتِ مكان انطلاق الكرتين', done: trials.some((t) => t.swapped) },
  ]
  useDoneOnce(ms.every((m) => m.done), onDone)
  const rad = (angle * Math.PI) / 180
  const L = 250
  const x0 = 30, y0 = 40
  const pos = (frac: number, off: number) => {
    const d = (frac * frac) * L
    return [x0 + d * Math.cos(rad) - off * Math.sin(rad), y0 + d * Math.sin(rad) + off * Math.cos(rad)]
  }
  const [lx, ly] = pos(p, -12)
  const [hx, hy] = pos(p, 6)
  return (
    <Bench title="مزراب التدحرج">
      <div className="chips" role="group" aria-label="ميل المزراب">
        <button type="button" className={`chip${angle === 10 ? ' on' : ''}`} onClick={() => { setAngle(10); setP(0) }}>ميل صغير ({n(10)}°)</button>
        <button type="button" className={`chip${angle === 25 ? ' on' : ''}`} onClick={() => { setAngle(25); setP(0) }}>ميل كبير ({n(25)}°)</button>
      </div>
      <svg viewBox="0 0 320 190" className="svg" role="img" aria-label="كرتان تتدحرجان على مزراب">
        <line x1={x0} y1={y0} x2={x0 + L * Math.cos(rad)} y2={y0 + L * Math.sin(rad)} stroke="#8d6e63" strokeWidth="6" strokeLinecap="round" />
        <line x1={x0 + L * Math.cos(rad) + 6} y1={y0 + L * Math.sin(rad) - 18} x2={x0 + L * Math.cos(rad) + 6} y2={y0 + L * Math.sin(rad) + 14} stroke="#c62828" strokeWidth="4" />
        <circle cx={swapped ? hx : lx} cy={swapped ? hy : ly} r="6" fill="#64b5f6" stroke="#1565c0" strokeWidth="2" />
        <circle cx={swapped ? lx : hx} cy={swapped ? ly : hy} r="9" fill="#ef5350" stroke="#b71c1c" strokeWidth="2" />
        <text x="85" y="180" textAnchor="middle" fontSize="11" fill="#1565c0">● كرة خفيفة (٥ جم)</text>
        <text x="235" y="180" textAnchor="middle" fontSize="11" fill="#b71c1c">● كرة ثقيلة (٢٠ جم)</text>
      </svg>
      <div className="actions">
        <button type="button" className="btn" onClick={() => { setTrials((t) => [...t, { angle, swapped }]); setP(0); setRunning(true) }}>🚀 أطلقي الكرتين معاً</button>
        <button type="button" className="btn ghost" onClick={() => setSwapped((s) => !s)}>🔁 بدّلي مكان الانطلاق</button>
      </div>
      <div className="readout">زمن الوصول المقدّر: <strong>{formatNumber(time, 2)}</strong> ث — للكرتين معاً! 🏁</div>
      <table className="data">
        <thead><tr><th>الميل</th><th>المحاولات</th><th>الأخف أسرع</th><th>الأثقل أسرع</th><th>نفس السرعة</th></tr></thead>
        <tbody>
          {[10, 25].map((a) => (<tr key={a}><td>{n(a)}°</td><td>{n(count(a))}</td><td>٠</td><td>٠</td><td>{n(count(a))}</td></tr>))}
        </tbody>
      </table>
      <Milestones items={ms} />
    </Bench>
  )
}

/** ====== ٢-٢: سحب الطوب بميزان زنبركي ====== */
interface BrickRec { start?: number; keep?: number; stopped?: boolean }
export function BrickPull({ onDone }: BenchProps) {
  const [count, setCount] = useState(1)
  const [pull, setPull] = useState(0)
  const [moving, setMoving] = useState(false)
  const [recs, setRecs] = useState<Record<number, BrickRec>>({})
  const { fs, fk } = brickForces(count)

  function change(v: number) {
    setPull(v)
    if (!moving && v >= fs) {
      setMoving(true)
      setRecs((r) => ({ ...r, [count]: { ...r[count], start: r[count]?.start ?? v, keep: v } }))
    } else if (moving && v < fk) {
      setMoving(false)
      setRecs((r) => ({ ...r, [count]: { ...r[count], stopped: true } }))
    } else if (moving) {
      setRecs((r) => ({ ...r, [count]: { ...r[count], keep: Math.min(r[count]?.keep ?? v, v) } }))
    }
  }
  const ms = [1, 2, 3].map((k) => ({ label: `${n(k)} ${k === 1 ? 'طوبة' : 'طوب'}: قوة البدء والاستمرار`, done: !!(recs[k]?.start && recs[k]?.stopped) }))
  useDoneOnce(ms.every((m) => m.done), onDone)
  return (
    <Bench title="الميزان الزنبركي والطوب">
      <div className="chips" role="group" aria-label="عدد الطوب">
        {[1, 2, 3].map((k) => (
          <button key={k} type="button" className={`chip${count === k ? ' on' : ''}`} onClick={() => { setCount(k); setPull(0); setMoving(false) }}>
            {n(k)} {k === 1 ? 'طوبة' : 'طوب'} ({n(k * BRICK_KG)} كجم)
          </button>
        ))}
      </div>
      <Slider label="قوة السحب" unit="نيوتن" min={0} max={40} step={0.5} value={pull} onChange={change} />
      <svg viewBox="0 0 320 130" className="svg" role="img" aria-label="طوب يُسحب بميزان زنبركي">
        <rect x="0" y="100" width="320" height="30" fill="#d7ccc8" />
        <g style={{ transform: `translateX(${moving ? 60 : 0}px)`, transition: 'transform 1.2s ease-in-out' }}>
          {Array.from({ length: count }, (_, i) => (
            <rect key={i} x="60" y={78 - i * 22} width="70" height="22" rx="3" fill="#ef9a9a" stroke="#c62828" strokeWidth="2" />
          ))}
          <path d={`M130 ${89} h${20 + pull * 3}`} stroke="#43a047" strokeWidth="5" />
          <rect x={150 + pull * 3} y="78" width="46" height="22" rx="6" fill="#fff" stroke="#546e7a" strokeWidth="3" />
          <text x={173 + pull * 3} y="94" textAnchor="middle" fontSize="12" fontWeight="700">{n(pull)}</text>
        </g>
      </svg>
      <div className={`status-pill ${moving ? 'go' : 'stay'}`}>{moving ? '🏃 الطوب يتحرك — خفّفي القوة تدريجياً حتى يتوقف' : '🧱 الطوب ساكن — زيدي القوة ببطء'}</div>
      <table className="data">
        <thead><tr><th>عدد الطوب</th><th>الكتلة</th><th>قوة البدء</th><th>قوة الاستمرار</th></tr></thead>
        <tbody>
          {[1, 2, 3].map((k) => (
            <tr key={k}><td>{n(k)}</td><td>{n(k * BRICK_KG)} كجم</td><td>{recs[k]?.start !== undefined ? n(recs[k]!.start!) : '—'}</td><td>{recs[k]?.keep !== undefined ? n(recs[k]!.keep!) : '—'}</td></tr>
          ))}
        </tbody>
      </table>
      <Milestones items={ms} />
    </Bench>
  )
}
