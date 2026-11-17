import { useMemo, useState } from 'react'
import { Bench, LineChart, Milestones, NumField, Thermometer, TimeScrub, n, useDoneOnce } from './ui'
import { COMMUNITIES, WEB_EDGES, WEB_NODES, boxTemp, bottleTemp, genField, trueDensity } from './labLogic'
import type { BenchProps } from './benches1'

/** ====== ١٢-١: كثافة الجماعة الحيوية ====== */
export function Quadrats({ onDone }: BenchProps) {
  const fields = useMemo(() => COMMUNITIES.map((c) => genField(c.seed, c.perCell)), [])
  const [ci, setCi] = useState(0)
  const [sampled, setSampled] = useState<Record<string, number[]>>({})
  const [dens, setDens] = useState(false)
  const [densest, setDensest] = useState<string | null>(null)
  const c = COMMUNITIES[ci]
  const cells = fields[ci]
  const mine = sampled[c.id] ?? []
  const mean = (id: string) => {
    const f = fields[COMMUNITIES.findIndex((x) => x.id === id)]
    const s = sampled[id] ?? []
    return s.length ? s.reduce((t, i) => t + f[i], 0) / s.length : 0
  }
  const ms = [
    { label: 'أخذتِ ٣ عيّنات على الأقل من كل جماعة', done: COMMUNITIES.every((x) => (sampled[x.id] ?? []).length >= 3) },
    { label: 'حسبتِ كثافة الجماعة (ج)', done: dens },
    { label: 'عرفتِ أكثف الجماعات', done: densest === 'ج' },
  ]
  useDoneOnce(ms.every((m) => m.done), onDone)
  const allSampled = ms[0].done
  return (
    <Bench title="حقل الأزهار ومربّعات العيّنة">
      <div className="chips" role="group" aria-label="الجماعة">
        {COMMUNITIES.map((x, i) => (<button key={x.id} type="button" className={`chip${ci === i ? ' on' : ''}${(sampled[x.id] ?? []).length >= 3 ? ' got' : ''}`} onClick={() => setCi(i)}>الجماعة ({x.id})</button>))}
      </div>
      <p className="muted-line">كل مربع مساحته ١ م². اضغطي على ٣ مربعات على الأقل لتعدّي الأزهار فيها.</p>
      <svg viewBox="0 0 300 180" className="svg" role="group" aria-label={`حقل الجماعة ${c.id}`}>
        <rect width="300" height="180" fill="#e8f5e9" rx="10" />
        {cells.map((count, i) => {
          const x = (i % 10) * 30, y = Math.floor(i / 10) * 18
          const on = mine.includes(i)
          return (
            <g key={i} role="button" aria-label={`مربع ${i + 1}`} tabIndex={0} onClick={() => setSampled((s) => ({ ...s, [c.id]: on ? mine : [...mine, i] }))} onKeyDown={(e) => { if (e.key === 'Enter' && !on) setSampled((s) => ({ ...s, [c.id]: [...mine, i] })) }} style={{ cursor: 'pointer' }}>
              <rect x={x + 1} y={y + 1} width="28" height="16" fill={on ? '#fff59d' : 'transparent'} stroke={on ? '#f9a825' : '#c8e6c9'} />
              {Array.from({ length: count }, (_, k) => (<circle key={k} cx={x + 5 + ((k * 7 + i) % 5) * 5} cy={y + 5 + ((k * 3 + i) % 3) * 4} r="1.8" fill="#e91e63" />))}
              {on && <text x={x + 24} y={y + 14} fontSize="9" fontWeight="700" fill="#1f2340">{n(count)}</text>}
            </g>
          )
        })}
      </svg>
      <div className="readout">
        العيّنات المأخوذة: <strong>{n(mine.length)}</strong>
        {mine.length > 0 && <> · متوسط العدد في المربع = <strong>{n(Math.round(mean(c.id) * 10) / 10)}</strong> زهرة/م²</>}
      </div>
      {allSampled && (
        <>
          <NumField label="كثافة الجماعة (ج) بالأزهار لكل م²" expected={trueDensity(fields[2])} tol={0.35} unit="زهرة/م²" onCorrect={() => setDens(true)} hint="الكثافة = عدد الأفراد ÷ المساحة. استعيني بمتوسط عيّناتك في الجماعة (ج)." />
          <p>أيّ الجماعات الثلاث أكثف؟</p>
          <div className="chips" role="group" aria-label="أكثف جماعة">
            {COMMUNITIES.map((x) => (<button key={x.id} type="button" className={`chip${densest === x.id ? ' on' : ''}`} onClick={() => setDensest(x.id)}>({x.id}) — {n(Math.round(mean(x.id) * 10) / 10)}</button>))}
          </div>
          {densest && densest !== 'ج' && <div className="feedback bad" role="status">قارني متوسطات الجماعات الثلاث: الأكبر هو الأكثف.</div>}
        </>
      )}
      <Milestones items={ms} />
    </Bench>
  )
}

/** ====== ١٢-٢: الشبكات الغذائية ====== */
export function FoodWebBuilder({ onDone }: BenchProps) {
  const [from, setFrom] = useState<string | null>(null)
  const [edges, setEdges] = useState<[string, string][]>([])
  const [msg, setMsg] = useState('')
  const pos = (id: string) => WEB_NODES.find((x) => x.id === id)!
  const nm = (id: string) => pos(id).name
  function tap(id: string) {
    if (from === null) { setFrom(id); setMsg(`${nm(id)} هو المأكول؛ اضغطي الآن على من يأكله ➜`); return }
    if (from === id) { setFrom(null); setMsg(''); return }
    const ok = WEB_EDGES.some(([a, b]) => a === from && b === id)
    const rev = WEB_EDGES.some(([a, b]) => a === id && b === from)
    if (ok) {
      setEdges((e) => (e.some(([a, b]) => a === from && b === id) ? e : [...e, [from, id]]))
      setMsg(`✔ ${nm(id)} يأكل ${nm(from)}: انتقلت الطاقة من ${nm(from)} إلى ${nm(id)}.`)
    } else if (rev) setMsg('السهم يبدأ من المأكول وينتهي عند الآكل، فاعكسي الاتجاه 🔄')
    else setMsg(`${nm(id)} لا يتغذى على ${nm(from)} في هذه الشبكة. تذكّري: ما الذي يأكله كل مخلوق؟ 🤔`)
    setFrom(null)
  }
  const done = edges.length === WEB_EDGES.length
  useDoneOnce(done, onDone)
  return (
    <Bench title="لوحة الشبكة الغذائية">
      <p className="muted-line">اضغطي على المخلوق المأكول ثم على من يأكله لترسمي سهم انتقال الطاقة.</p>
      <svg viewBox="0 0 320 230" className="svg" role="group" aria-label="مخلوقات الصحراء">
        <defs><marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="#2e7d32" /></marker></defs>
        <rect width="320" height="230" rx="12" fill="#fff8e1" />
        {edges.map(([a, b]) => {
          const A = pos(a), B = pos(b)
          const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy)
          return <line key={`${a}-${b}`} x1={A.x + (dx / len) * 20} y1={A.y + (dy / len) * 20} x2={B.x - (dx / len) * 22} y2={B.y - (dy / len) * 22} stroke="#2e7d32" strokeWidth="3" markerEnd="url(#arr)" />
        })}
        {WEB_NODES.map((x) => (
          <g key={x.id} role="button" aria-label={x.name} tabIndex={0} onClick={() => tap(x.id)} onKeyDown={(e) => { if (e.key === 'Enter') tap(x.id) }} style={{ cursor: 'pointer' }}>
            <circle cx={x.x} cy={x.y} r="19" fill={from === x.id ? '#ffe082' : '#fff'} stroke={x.role === 'منتج' ? '#2e7d32' : '#8d6e63'} strokeWidth="3" />
            <text x={x.x} y={x.y + 7} textAnchor="middle" fontSize="20">{x.emoji}</text>
            <text x={x.x} y={x.y + 33} textAnchor="middle" fontSize="10" fill="#1f2340">{x.name}</text>
          </g>
        ))}
      </svg>
      {msg && <div className={`feedback ${msg.startsWith('✔') ? 'ok' : 'bad'}`} role="status">{msg}</div>}
      <div className="legend small">{WEB_NODES.map((x) => (<span key={x.id}>{x.emoji} {x.name}: {x.role}</span>))}</div>
      <Milestones items={[{ label: `رسمتِ كل الأسهم (${n(edges.length)}/${n(WEB_EDGES.length)})`, done }]} />
    </Bench>
  )
}

/** ====== ١٣-١: مجمّع الطاقة الشمسية ====== */
export function SolarBox({ onDone }: BenchProps) {
  const [black, setBlack] = useState(false)
  const [cover, setCover] = useState(false)
  const [ins, setIns] = useState(false)
  const [min, setMin] = useState(0)
  const [seen, setSeen] = useState<string[]>([])
  const key = `${black ? 'b' : 'w'}${cover ? 'c' : 'o'}${ins ? 'i' : 'n'}`
  function setM(v: number) { setMin(v); if (v >= 30) setSeen((s) => (s.includes(key) ? s : [...s, key])) }
  const reset = (f: () => void) => { f(); setMin(0) }
  const ms = [
    { label: 'قستِ حرارة صندوق عادي ٣٠ دقيقة', done: seen.includes('won') },
    { label: 'قستِ حرارة صندوق أسود بغطاء بلاستيك', done: seen.includes('bcn') || seen.includes('bci') },
  ]
  useDoneOnce(ms.every((m) => m.done), onDone)
  const pts = (b: boolean, c: boolean, i: boolean): [number, number][] => Array.from({ length: Math.floor(min / 3) + 1 }, (_, k) => [k * 3, boxTemp(b, c, i, k * 3)])
  const t = boxTemp(black, cover, ins, min)
  return (
    <Bench title="صندوق المجمّع الشمسي">
      <div className="chips" role="group" aria-label="تصميم الصندوق">
        <button type="button" className={`chip${black ? ' on' : ''}`} onClick={() => reset(() => setBlack(!black))}>⬛ دهان أسود داخل الصندوق</button>
        <button type="button" className={`chip${cover ? ' on' : ''}`} onClick={() => reset(() => setCover(!cover))}>🧴 غطاء بلاستيك شفاف</button>
        <button type="button" className={`chip${ins ? ' on' : ''}`} onClick={() => reset(() => setIns(!ins))}>🧱 عزل بصندوق خارجي وقش</button>
      </div>
      <TimeScrub label="الزمن تحت الشمس" unit="دقيقة" max={30} step={3} value={min} onChange={setM} speed={200} />
      <svg viewBox="0 0 320 170" className="svg" role="img" aria-label="صندوق مجمع طاقة شمسية">
        <text x="26" y="40" fontSize="34">☀️</text>
        {[0, 1, 2].map((i) => (<line key={i} x1={78} y1={44 + i * 8} x2={150 + i * 10} y2={85 + i * 6} stroke="#ffd54f" strokeWidth="3" strokeDasharray="5 4" />))}
        {ins && <rect x="146" y="78" width="164" height="78" rx="8" fill="#d7ccc8" stroke="#8d6e63" strokeWidth="3" />}
        <rect x="156" y="88" width="144" height="58" rx="5" fill={black ? '#263238' : '#fafafa'} stroke="#546e7a" strokeWidth="3" />
        {cover && <rect x="154" y="84" width="148" height="9" fill="#b3e5fc" opacity="0.7" stroke="#0288d1" />}
        <rect x="222" y={146 - 40 * Math.min(1, (t - 20) / 50)} width="12" height={40 * Math.min(1, (t - 20) / 50)} fill="#ef5350" />
      </svg>
      <div className="flex-row">
        <Thermometer value={t} min={20} max={70} />
        <LineChart series={[{ name: 'التصميم الحالي', color: '#ef5350', pts: pts(black, cover, ins) }, { name: 'صندوق عادي', color: '#90a4ae', pts: pts(false, false, false) }]} xLabel="الزمن (دقيقة)" yLabel="الحرارة (°س)" xMax={30} yMin={20} yMax={70} />
      </div>
      <div className="readout">الأسود يمتصّ الإشعاع الشمسي، والغطاء يحبس الحرارة في الصندوق، والعزل يمنع هروبها: هكذا يسخّن المجمّع الشمسي الماء والهواء ☀️</div>
      <Milestones items={ms} />
    </Bench>
  )
}

/** ====== ١٣-٢: ظاهرة الدفيئة ====== */
export function GreenhouseLab({ onDone }: BenchProps) {
  const [step, setStep] = useState(0)
  const [min, setMin] = useState(0)
  const done = step >= 3 && min >= 30
  useDoneOnce(done, onDone)
  const labels = ['🍶 جهّزي (ب): أضيفي خلاً وصودا الخبز لينتج ثاني أكسيد الكربون', '🔒 غطّي الزجاجتين وركّبي مقياسي الحرارة', '💡 شغّلي المصباح فوق الزجاجتين']
  const pts = (co2: boolean): [number, number][] => Array.from({ length: Math.floor(min / 3) + 1 }, (_, k) => [k * 3, bottleTemp(co2, k * 3)])
  return (
    <Bench title="زجاجتان ومصباح">
      <div className="stack">
        {labels.map((l, i) => (<button key={l} type="button" className={`btn${i < step ? ' ghost' : ''}`} disabled={i !== step} onClick={() => setStep(i + 1)}>{i < step ? '✅ ' : ''}{l}</button>))}
      </div>
      <svg viewBox="0 0 320 170" className="svg" role="img" aria-label="زجاجتان تحت مصباح">
        <text x="140" y="30" fontSize="30">💡</text>
        {step >= 3 && [0, 1].map((i) => (<line key={i} x1={150} y1="44" x2={95 + i * 130} y2="84" stroke="#ffd54f" strokeWidth="3" strokeDasharray="5 4" />))}
        {[0, 1].map((i) => (
          <g key={i}>
            <rect x={60 + i * 130} y="86" width="70" height="70" rx="12" fill="#e1f5fe" stroke="#607d8b" strokeWidth="3" />
            {i === 1 && step >= 1 && Array.from({ length: 6 }, (_, k) => (<circle key={k} className="bubble" cx={78 + k * 8} cy="140" r="3" fill="#cfd8dc" style={{ animationDelay: `${k * 0.25}s` }} />))}
            <text x={95 + i * 130} y="170" textAnchor="middle" fontSize="11" fill="#4343b5">{i === 0 ? 'طبيعي (أ)' : 'ثاني أكسيد الكربون (ب)'}</text>
          </g>
        ))}
      </svg>
      <TimeScrub label="الزمن" unit="دقيقة" max={30} step={3} value={min} onChange={(v) => step >= 3 && setMin(v)} speed={200} />
      {step < 3 && <p className="muted-line">أكملي الخطوات الثلاث أولاً لتبدأ القياس.</p>}
      <div className="flex-row">
        <Thermometer value={bottleTemp(false, min)} min={20} max={40} label="الزجاجة أ" />
        <Thermometer value={bottleTemp(true, min)} min={20} max={40} label="الزجاجة ب" />
        <LineChart series={[{ name: 'طبيعي (أ)', color: '#42a5f5', pts: pts(false) }, { name: 'ثاني أكسيد الكربون (ب)', color: '#ef5350', pts: pts(true) }]} xLabel="الزمن (دقيقة)" yLabel="الحرارة (°س)" xMax={30} yMin={20} yMax={40} />
      </div>
      <div className="readout">غاز ثاني أكسيد الكربون يحبس جزءاً من الحرارة المنعكسة كما تفعل الدفيئة، فسخنت الزجاجة (ب) أكثر 🌍🔥</div>
      <Milestones items={[{ label: 'أكملتِ التجهيز وقستِ ٣٠ دقيقة', done }]} />
    </Bench>
  )
}
