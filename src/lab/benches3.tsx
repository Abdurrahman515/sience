import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { Bench, Milestones, TimeScrub, n, useDoneOnce } from './ui'
import { LIQUIDS, crystalSize } from './labLogic'
import { Slider } from '../components/widgets/Sims'
import type { BenchProps } from './benches1'

/** ====== ٥-١: بلورات الشب والجيود ====== */
export function AlumCrystals({ onDone }: BenchProps) {
  const [seeded, setSeeded] = useState(false)
  const [poured, setPoured] = useState(false)
  const [slow, setSlow] = useState(true)
  const [hours, setHours] = useState(0)
  const [seen, setSeen] = useState<{ slow: boolean; fast: boolean }>({ slow: false, fast: false })
  const size = crystalSize(hours, slow, seeded)
  function setH(v: number) {
    setHours(v)
    if (poured && v >= 24) setSeen((s) => ({ ...s, [slow ? 'slow' : 'fast']: true }))
  }
  const ms = [
    { label: 'وضعتِ بذور الشب وسكبتِ المحلول الساخن', done: seeded && poured },
    { label: 'راقبتِ التبريد البطيء ٢٤ ساعة', done: seen.slow },
    { label: 'قارنتِه بالتبريد السريع', done: seen.fast },
  ]
  useDoneOnce(ms.every((m) => m.done), onDone)
  const crystals = Array.from({ length: seeded ? 7 : 2 }, (_, i) => ({ x: 70 + i * 28, y: 112 - (i % 2) * 6 }))
  return (
    <Bench title="دورق الشب وورق الألومنيوم">
      <div className="actions">
        <button type="button" className="btn" disabled={seeded} onClick={() => setSeeded(true)}>💎 ضعي بذور الشب على الألومنيوم</button>
        <button type="button" className="btn" disabled={poured} onClick={() => setPoured(true)}>🔥 اسكبي المحلول الساخن (٨٠°س)</button>
      </div>
      <div className="chips" role="group" aria-label="سرعة التبريد">
        <button type="button" className={`chip${slow ? ' on' : ''}`} onClick={() => setSlow(true)}>تبريد بطيء (مكان هادئ)</button>
        <button type="button" className={`chip${!slow ? ' on' : ''}`} onClick={() => setSlow(false)}>تبريد سريع (ثلج)</button>
      </div>
      <TimeScrub label="الزمن" unit="ساعة" max={24} step={2} value={hours} onChange={setH} speed={180} />
      <svg viewBox="0 0 320 160" className="svg" role="img" aria-label="الشب يتبلور على الألومنيوم">
        <path d="M80 20 h160 l-12 120 h-136 z" fill="#fff" stroke="#607d8b" strokeWidth="3" />
        <rect x="90" y="40" width="140" height="95" fill={poured ? '#e1f5fe' : '#fff'} opacity="0.8" />
        <path d="M95 125 q65 -22 130 0 v10 h-130 z" fill="#cfd8dc" stroke="#90a4ae" />
        {poured && crystals.map((c, i) => (
          <polygon key={i} points={`${c.x},${c.y - size * 1.4} ${c.x + size},${c.y - size * 0.4} ${c.x + size * 0.7},${c.y + size * 0.6} ${c.x - size * 0.7},${c.y + size * 0.6} ${c.x - size},${c.y - size * 0.4}`} fill="#e0f7fa" stroke="#26a69a" strokeWidth="2" style={{ transition: 'all .5s' }} />
        ))}
      </svg>
      <div className="readout">حجم أكبر بلورة: <strong>{n(size)}</strong> ملم — {slow ? 'التبريد البطيء يعطي الذرات وقتاً لترتيب نفسها فتكبر البلورات وتتناسق.' : 'التبريد السريع يعطي بلورات صغيرة كثيرة.'}</div>
      <Milestones items={ms} />
    </Bench>
  )
}

/** ====== ٥-٢: العمليات الرسوبية ====== */
export function Sediments({ onDone }: BenchProps) {
  const [tab, setTab] = useState<'clastic' | 'chem' | 'cement'>('clastic')
  const [shaken, setShaken] = useState(false)
  const [days, setDays] = useState(0)
  const [layers, setLayers] = useState(false)
  const [salt, setSalt] = useState(0)
  const [evap, setEvap] = useState(0)
  const [chem, setChem] = useState(false)
  const [cementStep, setCementStep] = useState(0)
  const [wait, setWait] = useState(0)
  const [hard, setHard] = useState(false)
  function setD(v: number) { setDays(v); if (shaken && v >= 3) setLayers(true) }
  function setE(v: number) { setEvap(v); if (salt >= 6 && v >= 3) setChem(true) }
  function setW(v: number) { setWait(v); if (cementStep >= 1 && v >= 4) setHard(true) }
  const ms = [
    { label: 'ترسّبت الطبقات حسب حجم الحبيبات', done: layers },
    { label: 'تكوّنت بلورات من محلول مشبّع', done: chem },
    { label: 'تماسكت الحبيبات وصارت صخراً', done: hard },
  ]
  useDoneOnce(ms.every((m) => m.done), onDone)
  const settle = shaken ? Math.min(1, days / 3) : 0
  return (
    <Bench title="برطمان الترسيب">
      <div className="chips" role="group" aria-label="نوع الترسيب">
        <button type="button" className={`chip${tab === 'clastic' ? ' on' : ''}`} onClick={() => setTab('clastic')}>🏞️ رسوبيات فتاتية</button>
        <button type="button" className={`chip${tab === 'chem' ? ' on' : ''}`} onClick={() => setTab('chem')}>🧂 رسوبيات كيميائية</button>
        <button type="button" className={`chip${tab === 'cement' ? ' on' : ''}`} onClick={() => setTab('cement')}>🧱 التماسك</button>
      </div>
      {tab === 'clastic' && (
        <>
          <button type="button" className="btn" disabled={shaken} onClick={() => setShaken(true)}>🫨 رجّي البرطمان بالماء</button>
          <TimeScrub label="الزمن" unit="يوم" max={3} step={1} value={days} onChange={setD} speed={500} />
          <svg viewBox="0 0 320 170" className="svg" role="img" aria-label="طبقات الرواسب في البرطمان">
            <rect x="110" y="15" width="100" height="140" rx="12" fill="#e1f5fe" stroke="#607d8b" strokeWidth="3" />
            {shaken && settle < 1 && Array.from({ length: 24 }, (_, i) => (<circle key={i} cx={120 + ((i * 37) % 80)} cy={30 + ((i * 53) % 110) * (1 - settle * 0.4)} r={2 + (i % 3)} fill={['#8d6e63', '#d7b98e', '#a1887f'][i % 3]} opacity={1 - settle} />))}
            <rect x="113" y={155 - 36 * Math.min(1, settle * 3)} width="94" height={36 * Math.min(1, settle * 3)} fill="#78909c" />
            <rect x="113" y={119 - 36 * Math.min(1, Math.max(0, settle * 3 - 1))} width="94" height={36 * Math.min(1, Math.max(0, settle * 3 - 1))} fill="#d7b98e" />
            <rect x="113" y={83 - 36 * Math.min(1, Math.max(0, settle * 3 - 2))} width="94" height={36 * Math.min(1, Math.max(0, settle * 3 - 2))} fill="#a1887f" />
            {layers && (<><text x="218" y="140" textAnchor="end" fontSize="12" fill="#37474f">حصى (الأكبر)</text><text x="218" y="105" textAnchor="end" fontSize="12" fill="#37474f">رمل</text><text x="218" y="70" textAnchor="end" fontSize="12" fill="#37474f">طين (الأصغر)</text></>)}
          </svg>
          {layers && <div className="feedback ok" role="status">الحبيبات الكبيرة ثقيلة فتترسّب أولاً، والصغيرة تبقى معلّقة وتترسّب أخيراً: هكذا تتشكّل طبقات الصخور الرسوبية الفتاتية.</div>}
        </>
      )}
      {tab === 'chem' && (
        <>
          <Slider label="الملح المضاف للماء" unit="ملعقة" min={0} max={8} step={1} value={salt} onChange={setSalt} />
          <p className="muted-line">{salt > 6 ? 'وصل المحلول للإشباع: الزيادة ترسّبت في القاع ولم تذب.' : 'استمري بالإضافة حتى يتوقف الملح عن الذوبان.'}</p>
          <TimeScrub label="التبخّر" unit="يوم" max={3} step={1} value={evap} onChange={setE} speed={500} />
          <svg viewBox="0 0 320 130" className="svg" role="img" aria-label="تبخر الماء المالح">
            <path d="M80 30 h160 l-10 90 h-140 z" fill="#fff" stroke="#607d8b" strokeWidth="3" />
            <rect x="90" y={120 - Math.max(0, 70 - evap * 24)} width="140" height={Math.max(0, 70 - evap * 24)} fill="#bbdefb" opacity="0.8" />
            {salt >= 6 && evap >= 3 && [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (<rect key={i} x={98 + i * 16} y="110" width="9" height="9" fill="#fff" stroke="#9e9e9e" />))}
          </svg>
          {chem && <div className="feedback ok" role="status">تبخّر الماء وبقيت بلورات الملح: هكذا تتكوّن الصخور الرسوبية الكيميائية، مثل الصخر الملحي.</div>}
        </>
      )}
      {tab === 'cement' && (
        <>
          <p className="muted-line">اخلطي رملاً ومسحوق الجير مع قليل من الماء الملوّن حتى يصير القوام غليظاً.</p>
          <button type="button" className="btn" disabled={cementStep >= 1} onClick={() => setCementStep(1)}>🥣 اخلطي وضعي في الكأس الورقية</button>
          {cementStep >= 1 && <TimeScrub label="الانتظار" unit="يوم" max={4} step={1} value={wait} onChange={setW} speed={500} />}
          <svg viewBox="0 0 320 110" className="svg" role="img" aria-label="خليط يتصلّب">
            <rect x="110" y="30" width="100" height="60" rx="8" fill={hard ? '#bdbdbd' : cementStep ? '#d7ccc8' : '#fff'} stroke="#8d6e63" strokeWidth="3" style={{ transition: 'fill 1s' }} />
            {hard && <text x="160" y="66" textAnchor="middle" fontSize="13">صخر صلب 🪨</text>}
          </svg>
          {hard && <div className="feedback ok" role="status">المادة اللاصقة ربطت الحبيبات معاً: هذا ما يحدث للرواسب تحت الضغط والمعادن الذائبة (التماسك).</div>}
        </>
      )}
      <Milestones items={ms} />
    </Bench>
  )
}

/** ====== ٦-١: أحجية الصفائح الأرضية ====== */
export const PLATES = [
  { id: 'pacific', name: 'الهادئ', pts: '0,0 100,0 95,55 120,110 100,180 0,180', fill: '#80cbc4', cx: 45, cy: 90 },
  { id: 'namerica', name: 'أمريكا الشمالية', pts: '100,0 190,0 150,45 95,55', fill: '#a5d6a7', cx: 135, cy: 25 },
  { id: 'eurasia', name: 'أوراسيا', pts: '190,0 300,0 250,100 210,60 150,45', fill: '#ffcc80', cx: 220, cy: 40 },
  { id: 'samerica', name: 'أمريكا الجنوبية', pts: '95,55 150,45 190,115 120,110', fill: '#ce93d8', cx: 138, cy: 82 },
  { id: 'africa', name: 'أفريقيا', pts: '150,45 210,60 250,100 190,115', fill: '#ef9a9a', cx: 200, cy: 82 },
  { id: 'antarctic', name: 'أنتاركتيكا', pts: '120,110 190,115 250,100 300,180 190,180 100,180', fill: '#b0bec5', cx: 190, cy: 150 },
  { id: 'indo', name: 'الهندية الأسترالية', pts: '300,0 300,180 250,100', fill: '#fff59d', cx: 280, cy: 90 },
]
export const PLATE_OFFSETS: Record<string, [number, number]> = {
  pacific: [-24, 32], namerica: [32, -24], eurasia: [-32, 32], samerica: [40, 40], africa: [-40, 24], antarctic: [32, -32], indo: [24, 24],
}
export const VOLCANOES: [number, number][] = [[98, 30], [96, 60], [110, 100], [160, 46], [200, 62], [250, 98], [275, 60], [190, 112]]

export function PlatePuzzle({ onDone }: BenchProps) {
  const [off, setOff] = useState<Record<string, [number, number]>>(() => ({ ...PLATE_OFFSETS }))
  const drag = useRef<{ id: string; sx: number; sy: number; ox: number; oy: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [showContinents, setShowContinents] = useState(false)
  const placed = PLATES.filter((p) => off[p.id][0] === 0 && off[p.id][1] === 0).length
  const scale = () => {
    const w = svgRef.current?.getBoundingClientRect().width ?? 0
    return w > 0 ? 360 / w : 1
  }
  function down(id: string, e: PointerEvent) {
    if (off[id][0] === 0 && off[id][1] === 0) return
    drag.current = { id, sx: e.clientX, sy: e.clientY, ox: off[id][0], oy: off[id][1] }
  }
  function move(e: PointerEvent) {
    const d = drag.current
    if (!d) return
    const k = scale()
    setOff((o) => ({ ...o, [d.id]: [d.ox + (e.clientX - d.sx) * k, d.oy + (e.clientY - d.sy) * k] }))
  }
  function up() {
    const d = drag.current
    drag.current = null
    if (!d) return
    setOff((o) => {
      const [x, y] = o[d.id]
      return Math.abs(x) + Math.abs(y) < 16 ? { ...o, [d.id]: [0, 0] } : o
    })
  }
  function key(id: string, e: KeyboardEvent) {
    if (off[id][0] === 0 && off[id][1] === 0) return
    const step = 8
    const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0
    const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0
    if (!dx && !dy) return
    e.preventDefault()
    setOff((o) => {
      const nx = o[id][0] + dx, ny = o[id][1] + dy
      return { ...o, [id]: Math.abs(nx) + Math.abs(ny) < 16 ? [0, 0] : [nx, ny] }
    })
  }
  const done = placed === PLATES.length
  useDoneOnce(done, onDone)
  return (
    <Bench title="أحجية الغلاف الصخري">
      <p className="muted-line">اسحبي كل قطعة (أو حرّكيها بالأسهم) إلى مكانها لتكتملي الخريطة. تم وضع <strong>{n(placed)}</strong> من {n(PLATES.length)}.</p>
      <svg ref={svgRef} viewBox="0 0 360 240" className="svg puzzle" onPointerMove={move} onPointerUp={up} onPointerLeave={up} role="group" aria-label="قطع الصفائح الأرضية" style={{ touchAction: 'none' }}>
        <rect x="30" y="30" width="300" height="180" fill="none" stroke="#c5cae9" strokeDasharray="6 6" />
        {PLATES.map((p) => {
          const [dx, dy] = off[p.id]
          const isPlaced = dx === 0 && dy === 0
          return (
            <g key={p.id} transform={`translate(${30 + dx} ${30 + dy})`} onPointerDown={(e) => down(p.id, e)} onKeyDown={(e) => key(p.id, e)} tabIndex={0} role="button" aria-label={`صفيحة ${p.name}`} style={{ cursor: isPlaced ? 'default' : 'grab', transition: isPlaced ? 'transform .25s' : undefined }}>
              <polygon points={p.pts} fill={p.fill} stroke="#37474f" strokeWidth="2.5" strokeLinejoin="round" />
              <text x={p.cx} y={p.cy} textAnchor="middle" fontSize="11" fontWeight="700" fill="#1f2340" pointerEvents="none">{showContinents && done ? '🌍' : ''} {p.name}</text>
            </g>
          )
        })}
        {done && VOLCANOES.map(([x, y], i) => (<text key={i} x={30 + x} y={30 + y} fontSize="14" textAnchor="middle">🌋</text>))}
      </svg>
      {done && (
        <>
          <div className="feedback ok" role="status">اكتملت الأحجية! الزلازل والبراكين 🌋 تتركّز عند حدود الصفائح حيث تتصادم أو تبتعد أو تنزلق.</div>
          <button type="button" className="btn ghost" onClick={() => setShowContinents((s) => !s)}>🌍 {showContinents ? 'أخفي' : 'أظهري'} القارات</button>
        </>
      )}
      <Milestones items={[{ label: 'طابقتِ كل الصفائح', done }]} />
    </Bench>
  )
}

/** ====== ٦-٢: التجوية الكيميائية والميكانيكية ====== */
export function WeatheringLab({ onDone }: BenchProps) {
  const [tab, setTab] = useState<'litmus' | 'cement' | 'sugar'>('litmus')
  const [tested, setTested] = useState<string[]>([])
  const [liquid, setLiquid] = useState<string | null>(null)
  const [fluid, setFluid] = useState<'vinegar' | 'water'>('vinegar')
  const [days, setDays] = useState(0)
  const [seenCement, setSeenCement] = useState(false)
  const [jar, setJar] = useState<'plain' | 'pebbles'>('plain')
  const [shakes, setShakes] = useState(0)
  const [seenJars, setSeenJars] = useState<string[]>([])
  function setD(v: number) { setDays(v); if (fluid === 'vinegar' && v >= 3) setSeenCement(true) }
  function setS(v: number) { setShakes(v); if (v >= 20) setSeenJars((j) => (j.includes(jar) ? j : [...j, jar])) }
  const L = LIQUIDS.find((l) => l.id === liquid)
  const strip = !L ? '#b39ddb' : L.kind === 'حمضي' ? (L.id === 'ماء المطر' ? '#ef9a9a' : '#e53935') : L.kind === 'قاعدي' ? '#1e88e5' : '#b39ddb'
  const ms = [
    { label: 'اختبرتِ السوائل الخمسة', done: tested.length === LIQUIDS.length },
    { label: 'راقبتِ أثر الخل في الأسمنت ٣ أيام', done: seenCement },
    { label: 'رجّيتِ مكعبات السكر في الحالتين', done: seenJars.length === 2 },
  ]
  useDoneOnce(ms.every((m) => m.done), onDone)
  const loss = fluid === 'vinegar' ? Math.min(1, days / 3) * 0.55 : 0.02 * days
  const e = shakes / 20
  const cubeSize = (jar === 'pebbles' ? 1 - 0.75 * e : 1 - 0.35 * e) * 16
  return (
    <Bench title="ورق تباع الشمس والأسمنت والسكر">
      <div className="chips" role="group" aria-label="الجزء">
        <button type="button" className={`chip${tab === 'litmus' ? ' on' : ''}`} onClick={() => setTab('litmus')}>🧪 حموضة السوائل</button>
        <button type="button" className={`chip${tab === 'cement' ? ' on' : ''}`} onClick={() => setTab('cement')}>⚗️ تجوية كيميائية</button>
        <button type="button" className={`chip${tab === 'sugar' ? ' on' : ''}`} onClick={() => setTab('sugar')}>🔨 تجوية ميكانيكية</button>
      </div>
      {tab === 'litmus' && (
        <>
          <div className="chips" role="group" aria-label="السوائل">
            {LIQUIDS.map((l) => (<button key={l.id} type="button" className={`chip${liquid === l.id ? ' on' : ''}${tested.includes(l.id) ? ' got' : ''}`} onClick={() => { setLiquid(l.id); setTested((t) => (t.includes(l.id) ? t : [...t, l.id])) }}>{l.id}</button>))}
          </div>
          <svg viewBox="0 0 320 90" className="svg" role="img" aria-label="شريط ورق تباع الشمس">
            <rect x="40" y="25" width="240" height="30" rx="6" fill={strip} stroke="#5e35b1" strokeWidth="2" style={{ transition: 'fill .6s' }} />
          </svg>
          {L && <div className="feedback ok" role="status">{L.id}: {L.kind === 'حمضي' ? 'احمرّ الشريط → مادة حمضية' : L.kind === 'قاعدي' ? 'ازرقّ الشريط → مادة قاعدية' : 'لم يتغيّر لون الشريط → مادة متعادلة'}.</div>}
          <p className="muted-line">الأحمر = حمضي، الأزرق = قاعدي، بلا تغيير = متعادل.</p>
        </>
      )}
      {tab === 'cement' && (
        <>
          <div className="chips" role="group" aria-label="السائل">
            <button type="button" className={`chip${fluid === 'vinegar' ? ' on' : ''}`} onClick={() => { setFluid('vinegar'); setDays(0) }}>خل (حمض)</button>
            <button type="button" className={`chip${fluid === 'water' ? ' on' : ''}`} onClick={() => { setFluid('water'); setDays(0) }}>ماء (للمقارنة)</button>
          </div>
          <TimeScrub label="مدة الغمر" unit="يوم" max={3} step={1} value={days} onChange={setD} speed={500} />
          <svg viewBox="0 0 320 130" className="svg" role="img" aria-label="قطعة أسمنت في السائل">
            <path d="M100 20 h120 l-8 100 h-104 z" fill="#fff" stroke="#607d8b" strokeWidth="3" />
            <rect x="106" y="50" width="108" height="66" fill={fluid === 'vinegar' ? '#fff8e1' : '#e1f5fe'} opacity="0.85" />
            <rect x={140 + loss * 10} y={90 + loss * 12} width={40 * (1 - loss)} height={22 * (1 - loss * 0.6)} rx="4" fill="#9e9e9e" />
            {fluid === 'vinegar' && days > 0 && [0, 1, 2, 3, 4].map((i) => (<circle key={i} className="bubble" cx={130 + i * 15} cy="95" r="3" fill="#fff" style={{ animationDelay: `${i * 0.25}s` }} />))}
          </svg>
          {fluid === 'vinegar' && days >= 3 && <div className="feedback ok" role="status">الخل حمض فتفاعل مع الأسمنت (كربونات الكالسيوم) وأكل جزءاً منه وتصاعدت فقاعات: هذه <strong>تجوية كيميائية</strong>، فالتركيب الكيميائي تغيّر.</div>}
        </>
      )}
      {tab === 'sugar' && (
        <>
          <div className="chips" role="group" aria-label="البرطمان">
            <button type="button" className={`chip${jar === 'plain' ? ' on' : ''}`} onClick={() => { setJar('plain'); setShakes(0) }}>سكر فقط</button>
            <button type="button" className={`chip${jar === 'pebbles' ? ' on' : ''}`} onClick={() => { setJar('pebbles'); setShakes(0) }}>سكر + حصى</button>
          </div>
          <Slider label="عدد الرجّات" unit="رجّة" min={0} max={20} step={4} value={shakes} onChange={setS} />
          <svg viewBox="0 0 320 130" className="svg" role="img" aria-label="مكعبات السكر في البرطمان">
            <rect x="100" y="12" width="120" height="110" rx="10" fill="#fff" stroke="#607d8b" strokeWidth="3" />
            {Array.from({ length: 10 }, (_, i) => (<rect key={i} x={112 + (i % 5) * 20 + (20 - cubeSize) / 2} y={80 - Math.floor(i / 5) * 24 + (16 - cubeSize)} width={cubeSize} height={cubeSize} rx="2" fill="#fafafa" stroke="#bdbdbd" />))}
            {Array.from({ length: Math.floor(e * 24) }, (_, i) => (<circle key={`d${i}`} cx={110 + ((i * 29) % 100)} cy={108 - ((i * 7) % 8)} r="1.6" fill="#e0e0e0" />))}
          </svg>
          {shakes >= 20 && <div className="feedback ok" role="status">تفتّت السكر إلى قطع أصغر، لكنه ما زال سكراً بالتركيب نفسه: هذه <strong>تجوية ميكانيكية</strong>. {jar === 'pebbles' ? 'والحصى سرّعت التفتت بالاحتكاك والاصطدام.' : ''}</div>}
        </>
      )}
      <Milestones items={ms} />
    </Bench>
  )
}
