import { useState } from 'react'
import { Bench, LineChart, Milestones, Thermometer, TimeScrub, n, useDoneOnce } from './ui'
import { BARO_DAYS, LAMP_SPOTS, PLANETS, STAR_CLASSES, STAR_SKY, baroPointer, lampTemp, planetAngle, type StarCls } from './labLogic'
import { Slider } from '../components/widgets/Sims'
import type { BenchProps } from './benches1'

/** ====== ٧-١: باروميتر منزلي ====== */
export function HomeBarometer({ onDone }: BenchProps) {
  const [day, setDay] = useState(1)
  const [rec, setRec] = useState<number[]>([])
  const d = BARO_DAYS[day - 1]
  const pointer = baroPointer(d.hpa)
  const word = pointer > 0.66 ? 'مرتفع' : pointer < 0.33 ? 'منخفض' : 'متوسط'
  const tipY = 62 - pointer * 40
  const dome = 8 - pointer * 14
  const ms = [{ label: 'سجّلتِ قراءة الباروميتر خمسة أيام', done: rec.length === 5 }]
  useDoneOnce(rec.length === 5, onDone)
  return (
    <Bench title="باروميتر البالون">
      <div className="chips" role="group" aria-label="اليوم">
        {BARO_DAYS.map((x) => (<button key={x.day} type="button" className={`chip${day === x.day ? ' on' : ''}${rec.includes(x.day) ? ' got' : ''}`} onClick={() => setDay(x.day)}>اليوم {n(x.day)}</button>))}
      </div>
      <svg viewBox="0 0 320 150" className="svg" role="img" aria-label="باروميتر منزلي من برطمان وبالون">
        <rect x="70" y="60" width="90" height="80" rx="8" fill="#e1f5fe" stroke="#607d8b" strokeWidth="3" />
        <path d={`M66 62 Q115 ${62 + dome} 164 62`} fill="#ef5350" stroke="#b71c1c" strokeWidth="3" style={{ transition: 'd .6s' }} />
        <line x1="115" y1={62 + dome / 2} x2="235" y2={tipY} stroke="#fdd835" strokeWidth="5" strokeLinecap="round" style={{ transition: 'all .6s' }} />
        <rect x="240" y="14" width="56" height="90" rx="6" fill="#fff8e1" stroke="#8d6e63" strokeWidth="2" />
        <text x="268" y="30" textAnchor="middle" fontSize="11" fill="#c62828">مرتفع</text>
        <text x="268" y="98" textAnchor="middle" fontSize="11" fill="#1565c0">منخفض</text>
        {[0, 1, 2, 3, 4].map((i) => (<line key={i} x1="240" x2="252" y1={38 + i * 14} y2={38 + i * 14} stroke="#8d6e63" />))}
      </svg>
      <div className="readout">
        قراءة المؤشر اليوم: <strong>{word}</strong> · الباروميتر الصناعي: <strong>{n(d.hpa)}</strong> هكتوباسكال · الحرارة: <strong>{n(d.temp)}</strong>°س · الطقس: <strong>{d.sky}</strong>
      </div>
      <button type="button" className="btn" disabled={rec.includes(day)} onClick={() => setRec((r) => [...r, day])}>📝 سجّلي قراءة اليوم {n(day)}</button>
      <table className="data">
        <thead><tr><th>اليوم</th><th>المؤشر</th><th>الصناعي</th><th>الطقس</th></tr></thead>
        <tbody>{BARO_DAYS.map((x) => (<tr key={x.day}><td>{n(x.day)}</td><td>{rec.includes(x.day) ? (baroPointer(x.hpa) > 0.66 ? 'مرتفع' : baroPointer(x.hpa) < 0.33 ? 'منخفض' : 'متوسط') : '—'}</td><td>{rec.includes(x.day) ? n(x.hpa) : '—'}</td><td>{rec.includes(x.day) ? x.sky : '—'}</td></tr>))}</tbody>
      </table>
      <Milestones items={ms} />
    </Bench>
  )
}

/** ====== ٧-٢: الأشعة الشمسية ودرجة الحرارة ====== */
const SPOT_COLORS = ['#ef5350', '#fb8c00', '#42a5f5']
export function LampGlobe({ onDone }: BenchProps) {
  const [spot, setSpot] = useState(0)
  const [minute, setMinute] = useState(0)
  const [done, setDone] = useState<number[]>([])
  function setM(v: number) {
    setMinute(v)
    if (v >= 10) setDone((d) => (d.includes(spot) ? d : [...d, spot]))
  }
  const series = LAMP_SPOTS.map((s, i) => {
    const upTo = done.includes(i) && i !== spot ? 10 : i === spot ? minute : 0
    return { name: s.label.length > 18 ? s.label.slice(0, 18) + '…' : s.label, color: SPOT_COLORS[i], pts: Array.from({ length: upTo + 1 }, (_, m) => [m, lampTemp(s.angle, m)] as [number, number]) }
  }).filter((s) => s.pts.length > 1)
  const ms = [{ label: 'قستِ الحرارة في المواضع الثلاثة لمدة ١٠ دقائق', done: done.length === 3 }]
  useDoneOnce(done.length === 3, onDone)
  const cur = LAMP_SPOTS[spot]
  return (
    <Bench title="مصباح وكرة ومقياس حرارة">
      <div className="chips" role="group" aria-label="موضع المقياس">
        {LAMP_SPOTS.map((s, i) => (<button key={s.id} type="button" className={`chip${spot === i ? ' on' : ''}${done.includes(i) ? ' got' : ''}`} onClick={() => { setSpot(i); setMinute(0) }}>{s.label}</button>))}
      </div>
      <svg viewBox="0 0 320 170" className="svg" role="img" aria-label="مصباح يضيء كرة من الأمام">
        <text x="40" y="150" fontSize="38">💡</text>
        {[0, 1, 2].map((i) => (<line key={i} x1="95" y1={125 - i * 25} x2="190" y2={105 - i * 22} stroke="#ffd54f" strokeWidth="3" strokeDasharray="6 5" />))}
        <circle cx="230" cy="90" r="64" fill="#ffe0b2" stroke="#8d6e63" strokeWidth="3" />
        <path d="M230 26 A64 64 0 0 1 230 154" fill="#fff3e0" opacity="0.7" />
        {[0, 1, 2].map((i) => {
          const a = (LAMP_SPOTS[i].angle * Math.PI) / 180
          return <circle key={i} cx={230 - 64 * Math.cos(a)} cy={90 - 64 * Math.sin(a)} r={spot === i ? 7 : 4} fill={SPOT_COLORS[i]} stroke="#fff" strokeWidth="2" />
        })}
      </svg>
      <TimeScrub label="الزمن" unit="دقيقة" max={10} step={1} value={minute} onChange={setM} speed={300} />
      <div className="flex-row">
        <Thermometer value={lampTemp(cur.angle, minute)} min={20} max={42} />
        <LineChart series={series} xLabel="الزمن (دقيقة)" yLabel="الحرارة (°س)" xMax={10} yMin={20} yMax={40} />
      </div>
      <div className="readout">الضوء المباشر (زاوية صغيرة) يركّز الطاقة في مساحة أصغر فيسخّن أكثر، والضوء المائل (قرب القمة) ينتشر على مساحة أكبر فيسخّن أقل — كما في المناطق الاستوائية مقابل القطبية 🌍</div>
      <Milestones items={ms} />
    </Bench>
  )
}

/** ====== ٨-١: نمذجة مدارات الكواكب ====== */
export function PlanetOrbits({ onDone }: BenchProps) {
  const [year, setYear] = useState(0)
  const [snaps, setSnaps] = useState<number[]>([])
  const cx = 150, cy = 150
  const ms = [{ label: 'التقطتِ مواقع الكواكب بعد ١ و٢ و٣ و٤ سنوات', done: [1, 2, 3, 4].every((y) => snaps.includes(y)) }]
  useDoneOnce(ms[0].done, onDone)
  return (
    <Bench title="ساحة المدارات">
      <Slider label="مرّت" unit="سنة أرضية" min={0} max={4} step={1} value={year} onChange={setYear} />
      <svg viewBox="0 0 300 300" className="svg" role="img" aria-label="مدارات الكواكب الثمانية حول الشمس">
        {PLANETS.map((p, i) => (<circle key={p.name} cx={cx} cy={cy} r={22 + i * 15} fill="none" stroke="#c5cae9" strokeDasharray="3 4" />))}
        <line x1={cx} y1={cy} x2={cx + 140} y2={cy} stroke="#9fa8da" strokeDasharray="5 4" />
        <text x={cx + 120} y={cy - 6} fontSize="9" fill="#5c6bc0">الخط المرجعي</text>
        <circle cx={cx} cy={cy} r="12" fill="#ffca28" stroke="#f57f17" strokeWidth="3" />
        {PLANETS.map((p, i) => {
          const a = (planetAngle(p.period, year) * Math.PI) / 180
          return <circle key={p.name} cx={cx + (22 + i * 15) * Math.cos(a)} cy={cy - (22 + i * 15) * Math.sin(a)} r={i === 2 ? 5 : 4} fill={p.color} stroke="#37474f" strokeWidth="1.5" style={{ transition: 'all .8s' }}><title>{p.name}</title></circle>
        })}
      </svg>
      <div className="legend small">{PLANETS.map((p) => (<span key={p.name}><i style={{ background: p.color }} /> {p.name}</span>))}</div>
      <button type="button" className="btn" disabled={year === 0 || snaps.includes(year)} onClick={() => setSnaps((s) => [...s, year])}>📸 التقطي موقع الكواكب (السنة {n(year)})</button>
      <div className="readout">
        {year === 0 ? 'كل الكواكب على الخط المرجعي. حرّكي السنوات وشاهدي من يسبق!' : `عطارد أنجز نحو ${n(Math.round((year / 0.24) * 10) / 10)} دورة، والأرض ${n(year)}، ونبتون لم يتحرك إلا ${n(Math.round((360 * year / 165) * 10) / 10)}° فقط!`}
      </div>
      <p className="muted-line">اللقطات المحفوظة: {snaps.length ? [...snaps].sort().map((s) => n(s)).join('، ') : 'لا شيء بعد'}</p>
      <Milestones items={ms} />
    </Bench>
  )
}

/** ====== ٨-٢: ألوان النجوم ====== */
export function StarSky({ onDone }: BenchProps) {
  const [sel, setSel] = useState<number | null>(null)
  const [named, setNamed] = useState<Record<number, StarCls>>({})
  const [msg, setMsg] = useState('')
  const counts = STAR_CLASSES.map((c) => ({ cls: c.cls, n: Object.values(named).filter((x) => x === c.cls).length }))
  function choose(cls: StarCls) {
    if (sel === null) return
    if (STAR_SKY[sel].cls === cls) { setNamed((o) => ({ ...o, [sel]: cls })); setMsg('✔ صنّفتِ النجم بشكل صحيح!'); setSel(null) }
    else setMsg('قارني درجة حرارة سطح النجم بالمجال في جدول دربر، وانتبهي: نفس اللون قد يكون صنفين، والحرارة هي الفيصل 🌡️')
  }
  const done = Object.keys(named).length === STAR_SKY.length
  useDoneOnce(done, onDone)
  return (
    <Bench title="سماء الليل ومخطط دربر">
      <svg viewBox="0 0 320 200" className="svg sky" role="group" aria-label="سماء الليل">
        <rect width="320" height="200" rx="12" fill="#0d1b4c" />
        {STAR_SKY.map((s, i) => (
          <g key={i} role="button" aria-label={`نجم ${i + 1}`} tabIndex={0} onClick={() => { setSel(i); setMsg('') }} onKeyDown={(e) => { if (e.key === 'Enter') setSel(i) }} style={{ cursor: 'pointer' }}>
            <circle cx={s.x} cy={s.y} r={sel === i ? 11 : 7} fill={named[i] ? STAR_CLASSES.find((c) => c.cls === named[i])!.hex : '#fff'} opacity={named[i] ? 1 : 0.85} stroke={sel === i ? '#ffd54f' : 'none'} strokeWidth="3" />
            <text x={s.x} y={s.y + 22} textAnchor="middle" fontSize="9" fill="#c5cae9">{named[i] ?? n(i + 1)}</text>
          </g>
        ))}
      </svg>
      {sel !== null ? (
        <>
          <p>النجم <strong>{n(sel + 1)}</strong>: درجة حرارة سطحه <strong>{n(STAR_SKY[sel].k)}</strong> كلفن. ما صنفه الطيفي؟</p>
          <div className="chips" role="group" aria-label="الصنف الطيفي">
            {STAR_CLASSES.map((c) => (<button key={c.cls} type="button" className="chip" onClick={() => choose(c.cls)}>{c.cls}</button>))}
          </div>
        </>
      ) : <p className="muted-line">اضغطي على نجم لقياس حرارته وتصنيفه.</p>}
      {msg && <div className={`feedback ${msg.startsWith('✔') ? 'ok' : 'bad'}`} role="status">{msg}</div>}
      <table className="data small">
        <thead><tr><th>الصنف</th><th>اللون</th><th>الحرارة (كلفن)</th></tr></thead>
        <tbody>{STAR_CLASSES.map((c) => (<tr key={c.cls}><td>{c.cls}</td><td>{c.color}</td><td>{c.lo === c.hi ? n(c.lo) : `${n(c.lo)} – ${n(c.hi)}`}</td></tr>))}</tbody>
      </table>
      <div className="bars" aria-label="عدد النجوم في كل صنف">
        {counts.map((c) => (<div key={c.cls} className="bar"><div style={{ height: c.n * 18 }} /><span>{c.cls}</span></div>))}
      </div>
      <Milestones items={[{ label: `صنّفتِ نجوم السماء (${n(Object.keys(named).length)}/${n(STAR_SKY.length)})`, done }]} />
    </Bench>
  )
}
