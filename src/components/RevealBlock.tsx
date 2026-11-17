import { useState } from 'react'
import { Inline } from './Text'

interface Props {
  title: string
  cards: { front: string; back: string }[]
  onDone: () => void
}

export function RevealBlock({ title, cards, onDone }: Props) {
  const [open, setOpen] = useState<Set<number>>(new Set())

  function flip(i: number) {
    if (open.has(i)) return
    const next = new Set(open).add(i)
    setOpen(next)
    if (next.size === cards.length) onDone()
  }

  return (
    <div className="card reveal">
      <h3>{title}</h3>
      <p className="meta">اضغطي على كل بطاقة لتنكشف ({open.size}/{cards.length})</p>
      <div className="cards">
        {cards.map((c, i) => (
          <button key={i} type="button" className={`flip${open.has(i) ? ' open' : ''}`} onClick={() => flip(i)}>
            <strong>
              <Inline text={c.front} />
            </strong>
            {open.has(i) && (
              <span className="back">
                <Inline text={c.back} />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
