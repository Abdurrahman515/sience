import { useState } from 'react'
import type { WidgetSpec } from '../../content/types'
import { Inline } from '../Text'

type Spec = Extract<WidgetSpec, { kind: 'sort' }>

interface Props {
  spec: Spec
  onDone: (stats: { items: number; firstTry: number }) => void
}

export function SortWidget({ spec, onDone }: Props) {
  const [placed, setPlaced] = useState<Record<number, number>>({})
  const [mistakes, setMistakes] = useState<Record<number, number>>({})
  const [selected, setSelected] = useState<number | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const total = spec.items.length
  const done = Object.keys(placed).length === total

  function place(cat: number) {
    if (selected === null || done) return
    const item = spec.items[selected]
    if (item.cat === cat) {
      const next = { ...placed, [selected]: cat }
      setPlaced(next)
      setSelected(null)
      setHint(null)
      if (Object.keys(next).length === total) {
        const firstTry = spec.items.filter((_, i) => !mistakes[i]).length
        onDone({ items: total, firstTry })
      }
    } else {
      setMistakes((m) => ({ ...m, [selected]: (m[selected] ?? 0) + 1 }))
      setHint(item.hint)
    }
  }

  return (
    <div className="card widget">
      <h3>{spec.title}</h3>
      <p className="prompt">
        <Inline text={spec.prompt} />
      </p>
      <div className="chips">
        {spec.items.map((it, i) =>
          placed[i] === undefined ? (
            <button
              key={i}
              type="button"
              className={`chip${selected === i ? ' selected' : ''}`}
              onClick={() => {
                setSelected(i)
                setHint(null)
              }}
            >
              <Inline text={it.text} />
            </button>
          ) : null,
        )}
      </div>
      {!done && (
        <p className="meta">{selected === null ? '① اضغطي على عبارة' : '② الآن اضغطي على المجموعة المناسبة'}</p>
      )}
      <div className="buckets">
        {spec.categories.map((c, ci) => (
          <div key={ci} className="bucket">
            <button type="button" className="bucket-title" disabled={selected === null || done} onClick={() => place(ci)}>
              <Inline text={c} />
            </button>
            <ul>
              {spec.items.map((it, i) =>
                placed[i] === ci ? (
                  <li key={i}>
                    <Inline text={it.text} />
                  </li>
                ) : null,
              )}
            </ul>
          </div>
        ))}
      </div>
      {hint && (
        <div className="feedback bad" role="status">
          <Inline text={`قربتِ! 🤔 فكّري بالتلميح: ${hint}`} />
        </div>
      )}
      {done && (
        <div className="feedback ok" role="status">
          <Inline text="كفو عليكِ! صنّفتِ كل العناصر صح 🎉" />
        </div>
      )}
    </div>
  )
}
