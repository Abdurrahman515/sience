import { useState } from 'react'
import { Bench, Milestones, NumField, TimeScrub, n, useDoneOnce } from './ui'
import { BLOCKS, DENSITY_TABLE, MOLECULES, STONES, density, matchMolecule, type Elem } from './labLogic'
import { Slider } from '../components/widgets/Sims'
import type { BenchProps } from './benches1'

/** ====== ٣-١: كثافة المواد الصلبة ====== */
export function DensityLab({ onDone }: BenchProps) {
  const [measured, setMeasured] = useState(false)
  const [dens, setDens] = useState<string[]>([])
  const [same, setSame] = useState<string | null>(null)
  const [submerged, setSubmerged] = useState(false)
  const [stoneOk, setStoneOk] = useState<string[]>([])
  const ms = [
    { label: 'قستِ أبعاد وكتل المتوازيات', done: measured },
    { label: 'حسبتِ كثافة المتوازيات الثلاثة', done: dens.length === 3 },
    { label: 'عرفتِ أي متوازيين من المادة نفسها', done: same === 'أ و ج' },
    { label: 'حسبتِ كثافة الحجرين بالإزاحة', done: stoneOk.length === 2 },
  ]
  useDoneOnce(ms.every((m) => m.done), onDone)
  return (
    <Bench title="الميزان والمخبار المدرّج">
      <svg viewBox="0 0 320 120" className="svg" role="img" aria-label="ثلاثة متوازيات مستطيلات معدنية">
        {BLOCKS.map((b, i) => (
          <g key={b.id}>
            <rect x={30 + i * 100} y={30 + (3 - b.dims[2]) * 6} width={b.dims[0] * 16} height={b.dims[2] * 18} rx="3" fill={b.mat === 'نحاس' ? '#d98a4a' : '#cfd8dc'} stroke="#546e7a" strokeWidth="3" />
            <text x={30 + i * 100 + b.dims[0] * 8} y="112" textAnchor="middle" fontSize="14" fontWeight="700" fill="#4343b5">({b.id})</text>
          </g>
        ))}
      </svg>
      {!measured ? (
        <button type="button" className="btn" onClick={() => setMeasured(true)}>📏 قيسي الأبعاد وزني الكتل</button>
      ) : (
        <table className="data">
          <thead><tr><th>المتوازي</th><th>الأبعاد (سم)</th><th>الحجم (سم³)</th><th>الكتلة (جم)</th></tr></thead>
          <tbody>
            {BLOCKS.map((b) => (
              <tr key={b.id}><td>{b.id}</td><td>{n(b.dims.join(' × '))}</td><td>{n(b.dims[0] * b.dims[1] * b.dims[2])}</td><td>{n(b.mass)}</td></tr>
            ))}
          </tbody>
        </table>
      )}
      {measured && (
        <>
          <p className="muted-line">الكثافة = الكتلة ÷ الحجم (جم/سم³). اكتبي النتيجة لأقرب جزء من عشرة.</p>
          {BLOCKS.map((b) => (
            <NumField key={b.id} label={`كثافة المتوازي (${b.id})`} expected={density(b.mass, b.dims[0] * b.dims[1] * b.dims[2])} tol={0.04} unit="جم/سم³"
              onCorrect={() => setDens((d) => [...d, b.id])} hint="احسبي الحجم أولاً (طول × عرض × ارتفاع) ثم اقسمي الكتلة عليه." />
          ))}
          <table className="data small">
            <thead><tr><th>المعدن</th><th>الكثافة (جم/سم³)</th></tr></thead>
            <tbody>{DENSITY_TABLE.map(([m, d]) => (<tr key={m}><td>{m}</td><td>{n(d)}</td></tr>))}</tbody>
          </table>
        </>
      )}
      {dens.length === 3 && (
        <>
          <p>أيّ متوازيين مصنوعين من المادة نفسها؟</p>
          <div className="chips" role="group" aria-label="المتوازيان من مادة واحدة">
            {['أ و ب', 'أ و ج', 'ب و ج'].map((c) => (<button key={c} type="button" className={`chip${same === c ? ' on' : ''}`} onClick={() => setSame(c)}>{c}</button>))}
          </div>
          {same && same !== 'أ و ج' && <div className="feedback bad" role="status">قارني الكثافات: الكثافة وحدها هي البصمة، والأجسام من مادة واحدة كثافتها واحدة 🔎</div>}
        </>
      )}
      {same === 'أ و ج' && (
        <>
          <hr />
          <p>الآن حجران من صخرة واحدة. لا يمكن قياس حجمهما بالمسطرة، فنغمرهما في الماء (٣٠ مل) ونقيس الإزاحة.</p>
          {!submerged ? (
            <button type="button" className="btn" onClick={() => setSubmerged(true)}>💧 اغمري الحجرين</button>
          ) : (
            <>
              <table className="data">
                <thead><tr><th></th>{STONES.map((s) => (<th key={s.id}>{s.id}</th>))}</tr></thead>
                <tbody>
                  <tr><td>الكتلة (جم)</td>{STONES.map((s) => (<td key={s.id}>{n(s.mass)}</td>))}</tr>
                  <tr><td>الحجم الأصلي للماء (مل)</td>{STONES.map((s) => (<td key={s.id}>{n(s.v0)}</td>))}</tr>
                  <tr><td>حجم الماء بعد الإضافة (مل)</td>{STONES.map((s) => (<td key={s.id}>{n(s.v1)}</td>))}</tr>
                </tbody>
              </table>
              {STONES.map((s) => (
                <NumField key={s.id} label={`كثافة ${s.id}`} expected={density(s.mass, s.v1 - s.v0)} tol={0.04} unit="جم/مل"
                  onCorrect={() => setStoneOk((o) => [...o, s.id])} hint="حجم الحجر = الحجم بعد الإضافة − الحجم الأصلي." />
              ))}
            </>
          )}
        </>
      )}
      <Milestones items={ms} />
    </Bench>
  )
}

/** ====== ٣-٢: دلائل التغير الكيميائي ====== */
export const SIGNS = ['فقاعات غاز', 'ارتفاع درجة الحرارة', 'تغيّر اللون', 'تكوّن راسب (مادة صلبة)']
export const CHEM_PARTS = [
  { id: 1, name: 'صودا الخبز + كلوريد الكالسيوم + ماء', signs: ['فقاعات غاز', 'ارتفاع درجة الحرارة'], before: '#e3f2fd', after: '#e8f5e9', note: 'انتفخ الكيس وسخن قليلاً، وظهرت فقاعات.' },
  { id: 2, name: 'نشا + ماء + صبغة اليود', signs: ['تغيّر اللون'], before: '#fff3e0', after: '#1a237e', note: 'تحوّل لون المحلول إلى أزرق داكن يكاد يكون أسود.' },
  { id: 3, name: 'ملح إبسوم + صودا الغسل + ماء', signs: ['تكوّن راسب (مادة صلبة)'], before: '#e1f5fe', after: '#f5f5f5', note: 'ظهر عكر أبيض عند التقاء المحلولين وترسّب كمادة صلبة.' },
  { id: 4, name: 'قطعة نقد نحاسية باهتة + ملح + خل', signs: ['تغيّر اللون'], before: '#e1f5fe', after: '#b2dfdb', note: 'لمعت القطعة وصار حولها لون مخضرّ.' },
] as const

export function ChemReactions({ onDone }: BenchProps) {
  const [part, setPart] = useState<number>(1)
  const [mixed, setMixed] = useState<number[]>([])
  const [picked, setPicked] = useState<string[]>([])
  const [ok, setOk] = useState<number[]>([])
  const [msg, setMsg] = useState('')
  const p = CHEM_PARTS.find((x) => x.id === part)!
  const isMixed = mixed.includes(part)
  function confirm() {
    const need = [...p.signs].sort().join('|')
    const got = [...picked].sort().join('|')
    if (need === got) { setOk((o) => (o.includes(part) ? o : [...o, part])); setMsg('✔ ملاحظة دقيقة! ' + p.note) }
    else setMsg('أعيدي النظر: ما الذي تغيّر فعلاً أمامك؟ قد يكون أكثر من دليل، وقد تكون بعض الأدلة غير موجودة 🔬')
  }
  const ms = CHEM_PARTS.map((x) => ({ label: `الجزء ${n(x.id)}`, done: ok.includes(x.id) }))
  useDoneOnce(ms.every((m) => m.done), onDone)
  return (
    <Bench title="طاولة التفاعلات">
      <div className="chips" role="group" aria-label="أجزاء التجربة">
        {CHEM_PARTS.map((x) => (<button key={x.id} type="button" className={`chip${part === x.id ? ' on' : ''}${ok.includes(x.id) ? ' got' : ''}`} onClick={() => { setPart(x.id); setPicked([]); setMsg('') }}>{ok.includes(x.id) ? '✅ ' : ''}الجزء {n(x.id)}</button>))}
      </div>
      <p className="muted-line">المواد: {p.name}</p>
      <svg viewBox="0 0 320 150" className="svg" role="img" aria-label="كأس التفاعل">
        <path d="M110 20 h100 l-8 110 q-1 10 -12 10 h-60 q-11 0 -12 -10 z" fill="#fff" stroke="#607d8b" strokeWidth="3" />
        <path d="M117 60 h86 l-5 70 q-1 10 -12 10 h-52 q-11 0 -12 -10 z" fill={isMixed ? p.after : p.before} style={{ transition: 'fill 1s' }} />
        {isMixed && part === 1 && [0, 1, 2, 3, 4, 5].map((i) => (<circle key={i} className="bubble" cx={130 + i * 12} cy={110 - (i % 3) * 14} r={4 + (i % 2)} fill="#fff" opacity="0.8" style={{ animationDelay: `${i * 0.2}s` }} />))}
        {isMixed && part === 4 && <circle cx="160" cy="125" r="10" fill="#ffb74d" stroke="#e65100" strokeWidth="2" />}
        {!isMixed && part === 4 && <circle cx="160" cy="125" r="10" fill="#8d6e63" stroke="#4e342e" strokeWidth="2" />}
      </svg>
      <button type="button" className="btn" disabled={isMixed} onClick={() => setMixed((m) => [...m, part])}>🥄 اخلطي المواد</button>
      {isMixed && (
        <>
          <p>ما الدلائل التي لاحظتِها على حدوث تغيّر كيميائي؟ (اختاري كل ما ينطبق)</p>
          <div className="chips" role="group" aria-label="دلائل التغير">
            {SIGNS.map((s) => (<button key={s} type="button" className={`chip${picked.includes(s) ? ' on' : ''}`} onClick={() => setPicked((x) => (x.includes(s) ? x.filter((y) => y !== s) : [...x, s]))}>{s}</button>))}
          </div>
          <button type="button" className="btn small" disabled={picked.length === 0} onClick={confirm}>تأكيد الملاحظة</button>
        </>
      )}
      {msg && <div className={`feedback ${msg.startsWith('✔') ? 'ok' : 'bad'}`} role="status">{msg}</div>}
      <Milestones items={ms} />
    </Bench>
  )
}

/** ====== ٤-١: بناء المركبات ====== */
const ELEM_META: Record<Elem, { name: string; color: string; ring: string }> = {
  H: { name: 'هيدروجين', color: '#64b5f6', ring: '#1565c0' },
  O: { name: 'أكسجين', color: '#ef5350', ring: '#b71c1c' },
  C: { name: 'كربون', color: '#fdd835', ring: '#f9a825' },
}
function molPositions(id: string): { e: Elem; x: number; y: number }[] {
  if (id === 'water') return [{ e: 'O', x: 160, y: 70 }, { e: 'H', x: 120, y: 115 }, { e: 'H', x: 200, y: 115 }]
  if (id === 'co2') return [{ e: 'O', x: 100, y: 90 }, { e: 'C', x: 160, y: 90 }, { e: 'O', x: 220, y: 90 }]
  return [{ e: 'C', x: 160, y: 90 }, { e: 'H', x: 120, y: 55 }, { e: 'H', x: 200, y: 55 }, { e: 'H', x: 120, y: 125 }, { e: 'H', x: 200, y: 125 }]
}
export function MoleculeBuilder({ onDone }: BenchProps) {
  const [cnt, setCnt] = useState<Record<Elem, number>>({ H: 0, O: 0, C: 0 })
  const [built, setBuilt] = useState<string[]>([])
  const [msg, setMsg] = useState('')
  const target = MOLECULES.find((m) => !built.includes(m.id))
  const hit = matchMolecule(cnt.H, cnt.O, cnt.C)
  function add(e: Elem, d: number) { setCnt((c) => ({ ...c, [e]: Math.max(0, Math.min(6, c[e] + d)) })); setMsg('') }
  function build() {
    if (!target) return
    if (hit?.id === target.id) { setBuilt((b) => [...b, hit.id]); setMsg(`✔ ركّبتِ ${hit.name} (${hit.formula})!`); setCnt({ H: 0, O: 0, C: 0 }) }
    else if (hit) setMsg(`هذا ${hit.name} (${hit.formula})، لكن المطلوب الآن ${target.name}.`)
    else setMsg(`لا يوجد مركّب بهذا العدد من الذرات. فكّري بصيغة ${target.name}: ${target.formula} 🧩`)
  }
  const ms = MOLECULES.map((m) => ({ label: `${m.name} ${m.formula}`, done: built.includes(m.id) }))
  useDoneOnce(ms.every((m) => m.done), onDone)
  const shape = hit ? molPositions(hit.id) : (['H', 'O', 'C'] as Elem[]).flatMap((e, i) => Array.from({ length: cnt[e] }, (_, j) => ({ e, x: 40 + j * 40, y: 40 + i * 40 })))
  return (
    <Bench title="صلصال وأعواد أسنان">
      {target ? <p>المطلوب الآن: <strong>{target.name}</strong> — صيغته <strong>{target.formula}</strong></p> : <p>🎉 ركّبتِ كل الجزيئات!</p>}
      <div className="elems">
        {(['H', 'O', 'C'] as Elem[]).map((e) => (
          <div key={e} className="elem" style={{ borderColor: ELEM_META[e].ring }}>
            <i style={{ background: ELEM_META[e].color }} />
            <span>{ELEM_META[e].name} ({e})</span>
            <button type="button" aria-label={`زيادة ${ELEM_META[e].name}`} className="btn small" onClick={() => add(e, 1)}>＋</button>
            <strong>{n(cnt[e])}</strong>
            <button type="button" aria-label={`إنقاص ${ELEM_META[e].name}`} className="btn small ghost" onClick={() => add(e, -1)}>－</button>
          </div>
        ))}
      </div>
      <svg viewBox="0 0 320 170" className="svg" role="img" aria-label="نموذج الجزيء">
        {hit && shape.slice(1).map((a, i) => (<line key={i} x1={shape[0].x} y1={shape[0].y} x2={a.x} y2={a.y} stroke="#8d6e63" strokeWidth="5" />))}
        {hit && hit.id === 'co2' && null}
        {shape.map((a, i) => (<circle key={i} cx={a.x} cy={a.y} r={a.e === 'H' ? 14 : 22} fill={ELEM_META[a.e].color} stroke={ELEM_META[a.e].ring} strokeWidth="3" style={{ transition: 'all .4s' }} />))}
        {shape.map((a, i) => (<text key={`t${i}`} x={a.x} y={a.y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="#1f2340">{a.e}</text>))}
      </svg>
      <button type="button" className="btn" disabled={!target} onClick={build}>🔗 ركّبي الجزيء</button>
      {msg && <div className={`feedback ${msg.startsWith('✔') ? 'ok' : 'bad'}`} role="status">{msg}</div>}
      <table className="data">
        <thead><tr><th>الصيغة</th><th>H</th><th>C</th><th>O</th><th>المجموع</th></tr></thead>
        <tbody>
          {MOLECULES.map((m) => (
            <tr key={m.id}><td>{m.formula}</td>{built.includes(m.id) ? (<><td>{n(m.atoms.H)}</td><td>{n(m.atoms.C)}</td><td>{n(m.atoms.O)}</td><td>{n(m.atoms.H + m.atoms.C + m.atoms.O)}</td></>) : (<><td>—</td><td>—</td><td>—</td><td>—</td></>)}</tr>
          ))}
        </tbody>
      </table>
      <Milestones items={ms} />
    </Bench>
  )
}

/** ====== ٤-٢: المخاليط والمركبات ====== */
const GRAINS = Array.from({ length: 18 }, (_, i) => ({ x: 20 + ((i * 53) % 270), y: 15 + ((i * 37) % 80), c: (['#e57373', '#fafafa', '#37474f'] as const)[i % 3] }))
export function MixturesLab({ onDone }: BenchProps) {
  const [tab, setTab] = useState<'granite' | 'sand' | 'salt'>('granite')
  const [zoom, setZoom] = useState(1)
  const [sorted, setSorted] = useState(false)
  const [sand, setSand] = useState(0)
  const [dissolved, setDissolved] = useState(false)
  const [heat, setHeat] = useState(0)
  const evaporated = heat >= 8
  const ms = [
    { label: 'فصلتِ حبيبات الغرانيت', done: sorted },
    { label: 'فصلتِ الرمل عن الماء', done: sand >= 3 },
    { label: 'استرجعتِ الملح بالتبخير', done: dissolved && evaporated },
  ]
  useDoneOnce(ms.every((m) => m.done), onDone)
  return (
    <Bench title="عدسة مكبّرة ومصدر حرارة">
      <div className="chips" role="group" aria-label="العيّنة">
        <button type="button" className={`chip${tab === 'granite' ? ' on' : ''}`} onClick={() => setTab('granite')}>🪨 الغرانيت</button>
        <button type="button" className={`chip${tab === 'sand' ? ' on' : ''}`} onClick={() => setTab('sand')}>🏖️ رمل وماء</button>
        <button type="button" className={`chip${tab === 'salt' ? ' on' : ''}`} onClick={() => setTab('salt')}>🧂 ملح وماء</button>
      </div>
      {tab === 'granite' && (
        <>
          <Slider label="قوة التكبير" unit="×" min={1} max={3} step={1} value={zoom} onChange={setZoom} />
          <svg viewBox="0 0 320 130" className="svg" role="img" aria-label="حبيبات الغرانيت تحت العدسة">
            <rect width="320" height="130" fill="#cfd8dc" rx="10" />
            {GRAINS.map((g, i) => {
              const color = zoom >= 3 ? g.c : zoom === 2 ? '#b0bec5' : '#90a4ae'
              const y = sorted ? 100 : g.y
              const x = sorted ? 40 + (['#e57373', '#fafafa', '#37474f'] as const).indexOf(g.c) * 100 + (i % 6) * 8 : g.x
              return <circle key={i} cx={x} cy={y} r={5 + zoom * 2} fill={color} stroke="#546e7a" style={{ transition: 'all .7s' }} />
            })}
          </svg>
          <button type="button" className="btn" disabled={zoom < 3 || sorted} onClick={() => setSorted(true)}>🧲 افصلي الحبيبات حسب اللون</button>
          {zoom < 3 && <p className="muted-line">كبّري إلى ×٣ لترى ألوان الحبيبات المختلفة.</p>}
          {sorted && <div className="feedback ok" role="status">كل لون معدن مختلف: الغرانيت <strong>مخلوط</strong> من معادن، فصلناها ميكانيكياً!</div>}
        </>
      )}
      {tab === 'sand' && (
        <>
          <svg viewBox="0 0 320 130" className="svg" role="img" aria-label="رمل وماء في طبق">
            <path d="M90 20 h140 l-10 100 h-120 z" fill="#fff" stroke="#607d8b" strokeWidth="3" />
            <rect x="100" y={sand >= 3 ? 105 : 45} width="120" height={sand >= 3 ? 14 : 70} fill={sand === 1 ? '#c8a97a' : sand === 2 ? '#bbdefb' : '#bbdefb'} opacity={sand === 3 ? 0.9 : 0.7} />
            {sand === 2 && <rect x="102" y="100" width="116" height="16" fill="#c8a97a" />}
            {sand >= 3 && <rect x="102" y="100" width="116" height="18" fill="#c8a97a" />}
          </svg>
          <div className="actions">
            <button type="button" className="btn" disabled={sand !== 0} onClick={() => setSand(1)}>🥄 اخلطي الرمل بالماء</button>
            <button type="button" className="btn" disabled={sand !== 1} onClick={() => setSand(2)}>⏳ اتركيه يرسب</button>
            <button type="button" className="btn" disabled={sand !== 2} onClick={() => setSand(3)}>🫗 اسكبي الماء</button>
          </div>
          {sand >= 3 && <div className="feedback ok" role="status">الرمل لم يذب، ظلّ حبيباته، فسهُل فصله بالترسيب والصبّ.</div>}
        </>
      )}
      {tab === 'salt' && (
        <>
          <svg viewBox="0 0 320 130" className="svg" role="img" aria-label="ماء مالح يتبخر">
            <path d="M90 20 h140 l-10 100 h-120 z" fill="#fff" stroke="#607d8b" strokeWidth="3" />
            <rect x="100" y={dissolved ? 115 - Math.max(0, 70 - heat * 9) : 115} width="120" height={dissolved ? Math.max(0, 70 - heat * 9) : 0} fill="#bbdefb" opacity="0.8" />
            {dissolved && evaporated && [0, 1, 2, 3, 4, 5, 6].map((i) => (<rect key={i} x={112 + i * 14} y={108 + (i % 2) * 3} width="7" height="7" fill="#fff" stroke="#9e9e9e" />))}
          </svg>
          <button type="button" className="btn" disabled={dissolved} onClick={() => setDissolved(true)}>🧂 أذيبي الملح بالتحريك</button>
          {dissolved && <TimeScrub label="التسخين" unit="دقيقة" max={10} value={heat} onChange={setHeat} speed={200} />}
          {dissolved && !evaporated && <p className="muted-line">الملح اختفى ولم يضيع! سخّني الماء حتى يتبخر.</p>}
          {dissolved && evaporated && <div className="feedback ok" role="status">تبخّر الماء وبقيت بلورات الملح: فالماء المالح <strong>مخلوط</strong> من مركّبين هما الملح والماء.</div>}
        </>
      )}
      <Milestones items={ms} />
    </Bench>
  )
}
