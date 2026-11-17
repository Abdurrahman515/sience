import { useState, type ReactElement } from 'react'
import { Bench, LineChart, Milestones, TimeScrub, n, useDoneOnce } from './ui'
import { SLIDES, armAngle, yeastVolume } from './labLogic'
import { Slider } from '../components/widgets/Sims'
import type { BenchProps } from './benches1'

/** ====== ٩-١: الميتوكندريا (تنفّس الخميرة) ====== */
export function YeastLab({ onDone }: BenchProps) {
  const [sugar, setSugar] = useState(true)
  const [warm, setWarm] = useState(true)
  const [min, setMin] = useState(0)
  const [seen, setSeen] = useState<string[]>([])
  const key = `${sugar ? 'sugar' : 'none'}-${warm ? 'warm' : 'cold'}`
  const vol = yeastVolume(sugar, warm, min)
  function setM(v: number) { setMin(v); if (v >= 60) setSeen((s) => (s.includes(key) ? s : [...s, key])) }
  const ms = [
    { label: 'مع سكر في حمام دافئ', done: seen.includes('sugar-warm') },
    { label: 'بدون سكر', done: seen.includes('none-warm') },
    { label: 'مع سكر في ماء بارد', done: seen.includes('sugar-cold') },
  ]
  useDoneOnce(ms.every((m) => m.done), onDone)
  const pts: [number, number][] = Array.from({ length: Math.floor(min / 5) + 1 }, (_, i) => [i * 5, yeastVolume(sugar, warm, i * 5)])
  return (
    <Bench title="كيس الخميرة وحمام مائي">
      <div className="chips" role="group" aria-label="الغذاء">
        <button type="button" className={`chip${sugar ? ' on' : ''}`} onClick={() => { setSugar(true); setMin(0) }}>🍬 خميرة + محلول سكر</button>
        <button type="button" className={`chip${!sugar ? ' on' : ''}`} onClick={() => { setSugar(false); setMin(0) }}>💧 خميرة + ماء فقط</button>
      </div>
      <div className="chips" role="group" aria-label="الحرارة">
        <button type="button" className={`chip${warm ? ' on' : ''}`} onClick={() => { setWarm(true); setMin(0) }}>🌡️ حمام دافئ (٣٧°س)</button>
        <button type="button" className={`chip${!warm ? ' on' : ''}`} onClick={() => { setWarm(false); setMin(0) }}>🧊 ماء بارد (٥°س)</button>
      </div>
      <TimeScrub label="الزمن" unit="دقيقة" max={60} step={5} value={min} onChange={setM} speed={200} />
      <svg viewBox="0 0 320 170" className="svg" role="img" aria-label="كيس خميرة ينتفخ ومخبار يقيس الإزاحة">
        <rect x="20" y="95" width="140" height="65" rx="10" fill={warm ? '#ffe0b2' : '#bbdefb'} stroke="#8d6e63" strokeWidth="3" />
        <ellipse cx="90" cy={105} rx={30 + vol * 0.8} ry={20 + vol * 0.9} fill="#fffde7" stroke="#f9a825" strokeWidth="3" style={{ transition: 'all .5s' }} />
        {vol > 3 && [0, 1, 2, 3].map((i) => (<circle key={i} className="bubble" cx={75 + i * 10} cy={110} r="3" fill="#fff" style={{ animationDelay: `${i * 0.3}s` }} />))}
        <rect x="220" y="20" width="44" height="130" rx="8" fill="#fff" stroke="#607d8b" strokeWidth="3" />
        <rect x="223" y={150 - 12 - Math.min(110, vol * 2)} width="38" height={12 + Math.min(110, vol * 2)} fill="#4fc3f7" opacity="0.8" style={{ transition: 'all .5s' }} />
        <text x="292" y="40" fontSize="10" fill="#4343b5">مخبار</text>
      </svg>
      <div className="readout">غاز ثاني أكسيد الكربون المنطلق (حجم الماء المُزاح): <strong>{n(vol)}</strong> مل</div>
      <LineChart series={[{ name: 'الغاز المنطلق', color: '#f9a825', pts }]} xLabel="الزمن (دقيقة)" yLabel="الحجم (مل)" xMax={60} yMin={0} yMax={80} />
      <Milestones items={ms} />
    </Bench>
  )
}

/** ====== ٩-٢: اللبنات البنائية للأعضاء (المجهر) ====== */
const SLIDE_OPTIONS = SLIDES.map((s) => s.answer)
export function MicroscopeLab({ onDone }: BenchProps) {
  const [slide, setSlide] = useState<(typeof SLIDES)[number]['id']>('bone')
  const [mag, setMag] = useState(1)
  const [ids, setIds] = useState<string[]>([])
  const [msg, setMsg] = useState('')
  const cur = SLIDES.find((s) => s.id === slide)!
  function pick(opt: string) {
    if (opt === cur.answer) { setIds((x) => (x.includes(slide) ? x : [...x, slide])); setMsg('✔ ملاحظة ممتازة!') }
    else setMsg('كبّري أكثر وقارني الشكل بالوصف: ما نمط ترتيب الخلايا؟ 🔬')
  }
  const ms = [{ label: `تعرّفتِ على الأنسجة الثلاثة (${n(ids.length)}/${n(SLIDES.length)})`, done: ids.length === SLIDES.length }]
  useDoneOnce(ms[0].done, onDone)
  const reps = mag === 1 ? 3 : mag === 2 ? 5 : 8
  return (
    <Bench title="المجهر والشرائح">
      <div className="chips" role="group" aria-label="الشريحة">
        {SLIDES.map((s) => (<button key={s.id} type="button" className={`chip${slide === s.id ? ' on' : ''}${ids.includes(s.id) ? ' got' : ''}`} onClick={() => { setSlide(s.id); setMsg('') }}>{s.name}</button>))}
      </div>
      <Slider label="قوة التكبير (١=×٤، ٢=×١٠، ٣=×٤٠)" unit="" min={1} max={3} step={1} value={mag} onChange={setMag} />
      <svg viewBox="0 0 320 190" className="svg scope" role="img" aria-label={`شريحة ${cur.name} تحت المجهر`}>
        <defs><clipPath id="lens"><circle cx="160" cy="95" r="88" /></clipPath></defs>
        <rect width="320" height="190" fill="#1a1a2e" />
        <g clipPath="url(#lens)">
          <rect x="60" y="0" width="200" height="190" fill="#fce4ec" />
          {slide === 'bone' && Array.from({ length: reps }, (_, i) => {
            const x = 90 + ((i * 53) % 150), y = 40 + ((i * 41) % 110)
            return (<g key={i}>{[18, 12, 7].map((r) => (<circle key={r} cx={x} cy={y} r={mag >= 2 ? r : r * 0.6} fill="none" stroke="#c2185b" strokeWidth="2" />))}<circle cx={x} cy={y} r="3" fill="#880e4f" /></g>)
          })}
          {slide === 'muscle' && Array.from({ length: reps * 2 }, (_, i) => (<g key={i}><rect x="60" y={20 + i * (140 / (reps * 2))} width="200" height={mag >= 2 ? 9 : 5} fill="#ef9a9a" opacity="0.9" />{mag >= 3 && Array.from({ length: 10 }, (_, j) => (<line key={j} x1={72 + j * 20} x2={72 + j * 20} y1={20 + i * (140 / (reps * 2))} y2={20 + i * (140 / (reps * 2)) + 9} stroke="#b71c1c" strokeWidth="2" />))}</g>))}
          {slide === 'skin' && Array.from({ length: reps }, (_, row) => Array.from({ length: 8 }, (_, c) => (<ellipse key={`${row}-${c}`} cx={80 + c * 24 + (row % 2) * 10} cy={30 + row * (130 / reps)} rx={mag >= 2 ? 12 : 8} ry={mag >= 2 ? 6 : 4} fill={row < 2 ? '#f8bbd0' : '#f48fb1'} stroke="#ad1457" />)))}
        </g>
        <circle cx="160" cy="95" r="88" fill="none" stroke="#546e7a" strokeWidth="6" />
      </svg>
      {mag === 3 ? (
        <>
          <p>ماذا ترين تحت أقوى تكبير؟</p>
          <div className="stack">{SLIDE_OPTIONS.map((o) => (<button key={o} type="button" className="option" onClick={() => pick(o)} disabled={ids.includes(slide)}>{o}</button>))}</div>
        </>
      ) : <p className="muted-line">كبّري حتى (٣) لترين التفاصيل وتحدّدي النسيج.</p>}
      {msg && <div className={`feedback ${msg.startsWith('✔') ? 'ok' : 'bad'}`} role="status">{msg}</div>}
      <Milestones items={ms} />
    </Bench>
  )
}

/** ====== ١٠–١١: التشريح الافتراضي ====== */
export interface Organ { id: string; name: string; fn: string; x: number; y: number }
export interface DissectionDef {
  id: string; title: string; emoji: string; steps: string[]; organs: Organ[]
  body: (open: boolean) => ReactElement
}
export const DISSECTIONS: Record<string, DissectionDef> = {
  earthworm: {
    id: 'earthworm', title: 'دودة الأرض', emoji: '🪱',
    steps: ['ثبّتي الدودة بالدبابيس في صينية التشريح', 'افحصي الحلقات والسرج بالعدسة المكبّرة', 'اشقّي الجلد بحذر من السرج حتى الفم', 'افتحي الجدران وثبّتيها بالدبابيس'],
    organs: [
      { id: 'mouth', name: 'الفم', fn: 'تدخل منه التربة والطعام.', x: 50, y: 95 },
      { id: 'pharynx', name: 'البلعوم', fn: 'يسحب الطعام إلى الداخل.', x: 78, y: 95 },
      { id: 'hearts', name: 'القلوب (الأقواس الأبهرية)', fn: 'تضخّ الدم في الجسم.', x: 108, y: 82 },
      { id: 'crop', name: 'الحوصلة', fn: 'تخزّن الطعام مؤقتاً.', x: 140, y: 95 },
      { id: 'gizzard', name: 'القانصة', fn: 'تطحن الطعام بمساعدة حبيبات التربة.', x: 172, y: 95 },
      { id: 'intestine', name: 'الأمعاء', fn: 'يتم فيها هضم الطعام وامتصاصه.', x: 235, y: 95 },
    ],
    body: (open) => (
      <g>
        <path d="M30 95 Q90 60 160 82 T290 95 Q200 125 150 108 T30 95 Z" fill={open ? '#f8bbd0' : '#ef9a9a'} stroke="#ad1457" strokeWidth="3" />
        {Array.from({ length: 22 }, (_, i) => (<line key={i} x1={44 + i * 11} x2={44 + i * 11} y1={78 + Math.sin(i / 3) * 4} y2={112 - Math.sin(i / 3) * 3} stroke="#c2185b" opacity="0.4" />))}
        <ellipse cx="108" cy="92" rx="22" ry="19" fill="none" stroke="#880e4f" strokeWidth="3" strokeDasharray="3 3" />
        <text x="108" y="64" textAnchor="middle" fontSize="9" fill="#880e4f">السرج</text>
      </g>
    ),
  },
  grasshopper: {
    id: 'grasshopper', title: 'الجرادة', emoji: '🦗',
    steps: ['ثبّتي الجرادة على ظهرها في الصينية', 'افحصي الرأس والصدر والبطن بالعدسة', 'اقصّي الأجنحة والأرجل من أماكن اتصالها', 'اشقّي الجلد على الظهر وثبّتي الجدران'],
    organs: [
      { id: 'antenna', name: 'قرنا الاستشعار', fn: 'للشمّ واللمس.', x: 42, y: 62 },
      { id: 'thorax', name: 'الصدر', fn: 'تتصل به الأرجل الثلاثة والأجنحة.', x: 105, y: 92 },
      { id: 'spiracle', name: 'الثغور التنفسية', fn: 'فتحات تدخل منها الهواء إلى القصبات الهوائية.', x: 170, y: 108 },
      { id: 'crop', name: 'الحوصلة', fn: 'تخزّن الغذاء المبلوع.', x: 135, y: 88 },
      { id: 'heart', name: 'القلب', fn: 'أنبوب ظهري يضخّ الدم.', x: 200, y: 84 },
      { id: 'abdomen', name: 'البطن', fn: 'يضم أجزاء الهضم والتكاثر.', x: 245, y: 95 },
    ],
    body: (open) => (
      <g>
        <ellipse cx="55" cy="90" rx="22" ry="18" fill="#9ccc65" stroke="#33691e" strokeWidth="3" />
        <ellipse cx="115" cy="92" rx="38" ry="22" fill="#aed581" stroke="#33691e" strokeWidth="3" />
        <path d="M150 90 Q220 70 280 95 Q220 118 150 102 Z" fill={open ? '#dcedc8' : '#9ccc65'} stroke="#33691e" strokeWidth="3" />
        <path d="M40 78 Q20 50 8 40 M52 76 Q40 44 30 30" stroke="#33691e" strokeWidth="2" fill="none" />
        {[95, 120, 140].map((x) => (<path key={x} d={`M${x} 110 L${x - 8} 140 L${x + 16} 150`} stroke="#33691e" strokeWidth="3" fill="none" />))}
      </g>
    ),
  },
  fish: {
    id: 'fish', title: 'السمكة', emoji: '🐟',
    steps: ['ضعي السمكة على جنبها في الصينية وثبّتيها', 'افحصي الزعانف والحراشف والغطاء الخيشومي', 'اقطعي الغطاء الخيشومي بحذر وارفعيه', 'اشقّي جدار البطن من الأمام إلى الخلف وافتحيه'],
    organs: [
      { id: 'gills', name: 'الخياشيم', fn: 'تمتص الأكسجين الذائب في الماء.', x: 82, y: 92 },
      { id: 'heart', name: 'القلب', fn: 'يضخّ الدم إلى الخياشيم والجسم.', x: 104, y: 112 },
      { id: 'liver', name: 'الكبد', fn: 'يفرز العصارة الصفراوية للهضم.', x: 135, y: 108 },
      { id: 'stomach', name: 'المعدة', fn: 'يبدأ فيها هضم الطعام.', x: 162, y: 104 },
      { id: 'intestine', name: 'الأمعاء', fn: 'يُمتصّ فيها الغذاء المهضوم.', x: 198, y: 108 },
      { id: 'bladder', name: 'كيس العوم', fn: 'يتحكم بطفو السمكة في الماء.', x: 170, y: 78 },
    ],
    body: (open) => (
      <g>
        <path d="M30 95 Q90 40 190 70 Q250 85 300 60 L290 95 L300 130 Q250 105 190 125 Q90 150 30 95 Z" fill={open ? '#b3e5fc' : '#81d4fa'} stroke="#0277bd" strokeWidth="3" />
        <path d="M70 70 Q85 95 70 120" stroke="#0277bd" strokeWidth="3" fill="none" />
        <circle cx="52" cy="92" r="5" fill="#fff" stroke="#01579b" strokeWidth="2" />
        <path d="M130 52 Q150 30 170 62" fill="#4fc3f7" stroke="#0277bd" strokeWidth="2" />
      </g>
    ),
  },
}

export function Dissection({ id, onDone }: BenchProps & { id: keyof typeof DISSECTIONS }) {
  const def = DISSECTIONS[id]
  const [step, setStep] = useState(0)
  const [sel, setSel] = useState<string | null>(null)
  const [named, setNamed] = useState<string[]>([])
  const [msg, setMsg] = useState('')
  const opened = step >= def.steps.length
  const opts = (o: Organ) => {
    const others = def.organs.filter((x) => x.id !== o.id).slice(0, 3)
    const all = [o, ...others]
    const k = (def.organs.indexOf(o) % all.length)
    return [...all.slice(k), ...all.slice(0, k)].map((x) => x.name)
  }
  const cur = def.organs.find((o) => o.id === sel)
  function choose(name: string) {
    if (!cur) return
    if (name === cur.name) { setNamed((x) => [...x, cur.id]); setMsg(`✔ ${cur.name}: ${cur.fn}`); setSel(null) }
    else setMsg('ليس هذا العضو. تأمّلي مكانه في الجسم وشكله ثم جرّبي مرة ثانية 🔍')
  }
  const ms = [
    { label: 'نفّذتِ خطوات التشريح بالترتيب', done: opened },
    { label: `سمّيتِ الأعضاء (${n(named.length)}/${n(def.organs.length)})`, done: named.length === def.organs.length },
  ]
  useDoneOnce(ms.every((m) => m.done), onDone)
  return (
    <Bench title={`تشريح افتراضي: ${def.title}`}>
      <p className="muted-line">🌿 هذا تشريح افتراضي بلا أي كائن حي، لكن اتبعي قواعد السلامة كأنك في المختبر: القفازات والنظارة وغسل اليدين.</p>
      <ol className="steps-list">
        {def.steps.map((s, i) => (
          <li key={s} className={i < step ? 'done' : i === step ? 'now' : ''}>
            {i < step ? '✅ ' : ''}{s}
            {i === step && (<button type="button" className="btn small" onClick={() => setStep(step + 1)}>نفّذي ✂️</button>)}
          </li>
        ))}
      </ol>
      <svg viewBox="0 0 320 190" className="svg" role="img" aria-label={`رسم ${def.title}`}>
        <rect width="320" height="190" rx="12" fill="#e0f2f1" />
        {def.body(opened)}
        {opened && def.organs.map((o, i) => (
          <g key={o.id} role="button" aria-label={`العضو ${i + 1}`} tabIndex={0} onClick={() => { setSel(o.id); setMsg('') }} onKeyDown={(e) => { if (e.key === 'Enter') setSel(o.id) }} style={{ cursor: 'pointer' }}>
            <circle cx={o.x} cy={o.y} r="11" fill={named.includes(o.id) ? '#66bb6a' : sel === o.id ? '#ffca28' : '#fff'} stroke="#00695c" strokeWidth="2.5" />
            <text x={o.x} y={o.y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#1f2340">{named.includes(o.id) ? '✔' : n(i + 1)}</text>
          </g>
        ))}
      </svg>
      {opened && cur && (
        <>
          <p>ما اسم العضو رقم <strong>{n(def.organs.indexOf(cur) + 1)}</strong>؟</p>
          <div className="stack">{opts(cur).map((nm) => (<button key={nm} type="button" className="option" onClick={() => choose(nm)}>{nm}</button>))}</div>
        </>
      )}
      {opened && !cur && named.length < def.organs.length && <p className="muted-line">اضغطي على رقم داخل الرسم لتسمّي العضو.</p>}
      {msg && <div className={`feedback ${msg.startsWith('✔') ? 'ok' : 'bad'}`} role="status">{msg}</div>}
      <Milestones items={ms} />
    </Bench>
  )
}

/** ====== ١١-٢: كيف تعمل العضلات والعظام معاً ====== */
export function ArmModel({ onDone }: BenchProps) {
  const [b, setB] = useState(0)
  const [flexed, setFlexed] = useState(false)
  const [extended, setExtended] = useState(true)
  const [answer, setAnswer] = useState<string | null>(null)
  function setBiceps(v: number) { setB(v); if (v >= 90) setFlexed(true); if (v <= 10 && flexed) setExtended(true) }
  const theta = armAngle(b)
  const phi = ((180 - theta) * Math.PI) / 180
  const ex = 120 + 85 * Math.sin(phi), ey = 130 + 85 * Math.cos(phi)
  const ms = [
    { label: 'ثنيتِ الذراع (انقباض ذات الرأسين)', done: flexed },
    { label: 'مددتِ الذراع من جديد', done: flexed && extended && b <= 10 },
    { label: 'عرفتِ العضلة المنقبضة عند المدّ', done: answer === 'ثلاثية الرؤوس' },
  ]
  useDoneOnce(ms.every((m) => m.done), onDone)
  return (
    <Bench title="نموذج الذراع">
      <Slider label="شدّ العضلة ذات الرأسين (في الأمام)" unit="٪" min={0} max={100} step={10} value={b} onChange={setBiceps} />
      <svg viewBox="0 0 320 190" className="svg" role="img" aria-label="ذراع تنثني وتمتد بالعضلات">
        <rect width="320" height="190" rx="12" fill="#fff8e1" />
        <line x1="120" y1="40" x2="120" y2="130" stroke="#eceff1" strokeWidth="14" strokeLinecap="round" />
        <line x1="120" y1="130" x2={ex} y2={ey} stroke="#eceff1" strokeWidth="12" strokeLinecap="round" style={{ transition: 'all .4s' }} />
        <circle cx="120" cy="130" r="9" fill="#cfd8dc" stroke="#78909c" strokeWidth="2" />
        <ellipse cx="136" cy="86" rx={7 + b * 0.12} ry="34" fill="#ef5350" opacity="0.85" style={{ transition: 'all .4s' }} />
        <ellipse cx="104" cy="86" rx={7 + (100 - b) * 0.12} ry="34" fill="#7e57c2" opacity="0.85" style={{ transition: 'all .4s' }} />
        <text x="190" y="62" fontSize="11" fill="#c62828">ذات الرأسين {b >= 50 ? '(منقبضة)' : '(مرتخية)'}</text>
        <text x="190" y="80" fontSize="11" fill="#5e35b1">ثلاثية الرؤوس {b < 50 ? '(منقبضة)' : '(مرتخية)'}</text>
      </svg>
      <div className="readout">زاوية الكوع: <strong>{n(Math.round(theta))}</strong>° — العضلتان تعملان كفريق متضاد: إذا انقبضت إحداهما ارتخت الأخرى!</div>
      <p>عند <strong>مدّ</strong> الذراع، أيّ عضلة تنقبض؟</p>
      <div className="chips" role="group" aria-label="العضلة المنقبضة عند المد">
        {['ذات الرأسين', 'ثلاثية الرؤوس'].map((o) => (<button key={o} type="button" className={`chip${answer === o ? ' on' : ''}`} onClick={() => setAnswer(o)}>{o}</button>))}
      </div>
      {answer === 'ذات الرأسين' && <div className="feedback bad" role="status">لاحظي النموذج: عند المدّ تنتفخ العضلة الخلفية وتنقبض، والأمامية ترتخي.</div>}
      <Milestones items={ms} />
    </Bench>
  )
}
