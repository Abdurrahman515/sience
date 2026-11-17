import { useMemo, useState } from 'react'
import type { WidgetSpec } from '../../content/types'
import { hashString, mulberry32, shuffle } from '../../lib/rng'
import { Inline } from '../Text'
import { toArabicDigits } from '../../lib/arabicText'

type Spec = Extract<WidgetSpec, { kind: 'order' }>

interface Props {
  spec: Spec
  onDone: (stats: { items: number; firstTry: number }) => void
}

export function OrderWidget({ spec, onDone }: Props) {
  const shuffled = useMemo(() => {
    let arr = shuffle(mulberry32(hashString(spec.title)), spec.steps)
    if (arr.every((s, i) => s === spec.steps[i])) arr = [...arr].reverse()
    return arr
  }, [spec])
  const [count, setCount] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [hint, setHint] = useState(false)
  const done = count === spec.steps.length

  function tap(step: string) {
    if (done) return
    if (step === spec.steps[count]) {
      const n = count + 1
      setCount(n)
      setHint(false)
      if (n === spec.steps.length) onDone({ items: 1, firstTry: mistakes === 0 ? 1 : 0 })
    } else {
      setMistakes((m) => m + 1)
      setHint(true)
    }
  }

  return (
    <div className="card widget">
      <h3>{spec.title}</h3>
      <p className="prompt">
        <Inline text={spec.prompt} />
      </p>
      <ol className="ordered">
        {spec.steps.slice(0, count).map((s, i) => (
          <li key={s}>
            <span className="num">{toArabicDigits(i + 1)}</span> <Inline text={s} />
          </li>
        ))}
      </ol>
      {!done && (
        <div className="chips">
          {shuffled.map((s) =>
            spec.steps.indexOf(s) >= count ? (
              <button key={s} type="button" className="chip" onClick={() => tap(s)}>
                <Inline text={s} />
              </button>
            ) : null,
          )}
        </div>
      )}
      {hint && (
        <div className="feedback bad" role="status">
          <Inline text={`مو هي الخطوة الصح هلق 🤔 ${spec.hint}`} />
        </div>
      )}
      {done && (
        <div className="feedback ok" role="status">
          <Inline text="أسطورة! رتّبتِ كل الخطوات صح 🌟" />
        </div>
      )}
    </div>
  )
}
