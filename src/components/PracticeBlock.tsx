import { useMemo, useRef, useState } from 'react'
import type { GenId, NumQ } from '../content/types'
import { checkNumeric, generate } from '../lib/generators'
import { parseNumber, display } from '../lib/arabicText'
import { mulberry32 } from '../lib/rng'
import { praise, tryAgain } from '../lib/praise'
import { Inline } from './Text'

interface Props {
  gen: GenId
  count: number
  title?: string
  seed?: number
  onDone: (stats: { items: number; firstTry: number }) => void
}

export function PracticeBlock({ gen, count, title, seed, onDone }: Props) {
  const [autoSeed] = useState(() => Math.floor(Math.random() * 1e9))
  const questions: NumQ[] = useMemo(() => {
    const rng = mulberry32(seed ?? autoSeed)
    const out: NumQ[] = []
    const seen = new Set<string>()
    let guard = 0
    while (out.length < count && guard++ < 50) {
      const q = generate(gen, rng, `${gen}-${out.length}`)
      if (!seen.has(q.q)) {
        seen.add(q.q)
        out.push(q)
      }
    }
    return out
  }, [gen, count, seed, autoSeed])

  const rng = useRef(mulberry32(99))
  const [i, setI] = useState(0)
  const [value, setValue] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [solved, setSolved] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [firstTry, setFirstTry] = useState(0)
  const [finished, setFinished] = useState(false)
  const q = questions[i]

  function check() {
    const n = parseNumber(value)
    if (n === null) {
      setMsg({ ok: false, text: 'اكتبي رقماً بس (مثلاً ١٢ أو ٣٫٥).' })
      return
    }
    const r = checkNumeric(q, n)
    if (r.ok) {
      setSolved(true)
      if (attempts === 0) setFirstTry((f) => f + 1)
      setMsg({ ok: true, text: praise(rng.current) })
      return
    }
    const a = attempts + 1
    setAttempts(a)
    let text = `${tryAgain(rng.current)}\n${r.why ?? 'راجعي خطوات الحل: المعطيات، المطلوب، القانون، ثم التعويض.'}`
    if (a >= 2 && q.law) text += `\n💡 تلميح: ${q.law}`
    if (a >= 3 && q.sub) text += `\n✏️ عوّضي هيك: ${q.sub}`
    setMsg({ ok: false, text })
  }

  function next() {
    if (i + 1 >= questions.length) {
      setFinished(true)
      onDone({ items: questions.length, firstTry })
      return
    }
    setI(i + 1)
    setValue('')
    setAttempts(0)
    setSolved(false)
    setMsg(null)
  }

  if (!q) return null
  return (
    <div className="card practice">
      {title && <h3>{title}</h3>}
      <p className="meta">
        المسألة {display(String(i + 1))} من {display(String(questions.length))}
      </p>
      <p className="q">
        <Inline text={q.q} />
      </p>
      {!finished && (
        <div className="answer-row">
          <input
            className="num-input"
            inputMode="decimal"
            aria-label="إجابتك"
            placeholder="الجواب"
            value={value}
            disabled={solved}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !solved && check()}
          />
          <span className="unit">{q.unit}</span>
          {!solved && (
            <button type="button" className="btn small" onClick={check}>
              تحقّقي
            </button>
          )}
        </div>
      )}
      {msg && (
        <div className={`feedback ${msg.ok ? 'ok' : 'bad'}`} role="status">
          <Inline text={msg.text} />
          {msg.ok && (
            <p className="explain">
              <Inline text={q.explain} />
            </p>
          )}
        </div>
      )}
      {solved && !finished && (
        <button type="button" className="btn small" onClick={next}>
          {i + 1 >= questions.length ? 'خلصنا ✔' : 'المسألة التالية'}
        </button>
      )}
    </div>
  )
}
