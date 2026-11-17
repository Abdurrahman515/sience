import { useMemo, useRef, useState } from 'react'
import type { MC } from '../content/types'
import { optionsOf } from '../lib/exam'
import { hashString, mulberry32 } from '../lib/rng'
import { praise, tryAgain } from '../lib/praise'
import { Inline } from './Text'

interface Props {
  question: MC
  /** تُستدعى مرة واحدة عند الإجابة الصحيحة؛ firstTry=true إن كانت من أول محاولة */
  onResolved: (firstTry: boolean) => void
}

export function MCQuestion({ question, onResolved }: Props) {
  const options = useMemo(() => optionsOf(question), [question])
  const rng = useRef(mulberry32(hashString(question.id) + 7))
  const [tried, setTried] = useState<string[]>([])
  const [solved, setSolved] = useState(false)
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)

  function choose(opt: string) {
    if (solved || tried.includes(opt)) return
    if (opt === question.correct) {
      setSolved(true)
      setFeedback({ ok: true, text: praise(rng.current) })
      onResolved(tried.length === 0)
      return
    }
    setTried((t) => [...t, opt])
    const w = question.wrongs.find((x) => x.t === opt)
    setFeedback({
      ok: false,
      text: `${tryAgain(rng.current)}\n${w?.why ?? 'فكّري بالسؤال مرة تانية.'}`,
    })
  }

  return (
    <div className="card quiz">
      <p className="q">
        <Inline text={question.q} />
      </p>
      <div className="options" role="group">
        {options.map((o) => {
          const wrong = tried.includes(o)
          const right = solved && o === question.correct
          return (
            <button
              key={o}
              type="button"
              className={`option${wrong ? ' wrong' : ''}${right ? ' right' : ''}`}
              disabled={solved || wrong}
              onClick={() => choose(o)}
            >
              <Inline text={o} />
            </button>
          )
        })}
      </div>
      {feedback && (
        <div className={`feedback ${feedback.ok ? 'ok' : 'bad'}`} role="status">
          <Inline text={feedback.text} />
          {feedback.ok && (
            <p className="explain">
              <Inline text={question.explain} />
            </p>
          )}
        </div>
      )}
    </div>
  )
}
