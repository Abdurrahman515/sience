import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Block, Lesson } from '../content/types'
import { Rich } from './Text'
import { MCQuestion } from './MCQuestion'
import { PracticeBlock } from './PracticeBlock'
import { RevealBlock } from './RevealBlock'
import { WidgetBlock } from './WidgetBlock'
import { Stars } from './Stars'
import { starsFor } from '../lib/progress'
import { display } from '../lib/arabicText'

interface Stat { items: number; firstTry: number }

interface Props {
  lesson: Lesson
  onFinish: (firstTry: number, total: number) => void
  onExit: () => void
  nextTitle?: string
  onNext?: () => void
}

function BlockView({ block, index, onDone }: { block: Block; index: number; onDone: (i: number, s?: Stat) => void }) {
  const done = useCallback((s?: Stat) => onDone(index, s), [index, onDone])
  const simDone = useCallback(() => onDone(index), [index, onDone])
  const quizDone = useCallback((first: boolean) => onDone(index, { items: 1, firstTry: first ? 1 : 0 }), [index, onDone])
  const sayDone = useRef(false)
  useEffect(() => {
    if (block.type === 'say' && !sayDone.current) {
      sayDone.current = true
      onDone(index)
    }
  }, [block, index, onDone])

  switch (block.type) {
    case 'say':
      return (
        <div className="card say">
          {(block.title || block.emoji) && (
            <h3>
              {block.emoji} {block.title}
            </h3>
          )}
          <Rich text={block.text} />
        </div>
      )
    case 'reveal':
      return <RevealBlock title={block.title} cards={block.cards} onDone={simDone} />
    case 'widget':
      return <WidgetBlock spec={block.widget} onDone={done} onSimDone={simDone} />
    case 'quiz':
      return <MCQuestion question={block.question} onResolved={quizDone} />
    case 'practice':
      return <PracticeBlock gen={block.gen} count={block.count} title={block.title} onDone={done} />
  }
}

export function LessonPlayer({ lesson, onFinish, onExit, nextTitle, onNext }: Props) {
  const [step, setStep] = useState(1)
  const [doneSet, setDoneSet] = useState<Set<number>>(new Set())
  const [stats, setStats] = useState<Record<number, Stat>>({})
  const lastRef = useRef<HTMLDivElement>(null)
  const reported = useRef(false)
  const total = lesson.blocks.length

  const handleDone = useCallback((i: number, s?: Stat) => {
    if (s) setStats((st) => ({ ...st, [i]: s }))
    setDoneSet((d) => (d.has(i) ? d : new Set(d).add(i)))
  }, [])

  const finished = step >= total && doneSet.has(total - 1)
  const summary = useMemo(() => {
    const all = Object.values(stats)
    return { items: all.reduce((a, s) => a + s.items, 0), firstTry: all.reduce((a, s) => a + s.firstTry, 0) }
  }, [stats])

  useEffect(() => {
    if (finished && !reported.current) {
      reported.current = true
      onFinish(summary.firstTry, summary.items)
    }
  }, [finished, summary, onFinish])

  useEffect(() => {
    lastRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
  }, [step, finished])

  const canContinue = step < total && doneSet.has(step - 1)
  const stars = starsFor(summary.firstTry, summary.items)

  return (
    <div className="lesson">
      <div className="lesson-head">
        <button type="button" className="btn ghost" onClick={onExit}>
          ← الرئيسية
        </button>
        <h2>
          {lesson.emoji} {lesson.title}
        </h2>
        <div className="progress" aria-label="تقدم الدرس">
          <div className="bar" style={{ width: `${Math.round((Math.min(step, total) / total) * 100)}%` }} />
        </div>
      </div>

      {lesson.blocks.slice(0, step).map((b, i) => (
        <div key={i} ref={i === step - 1 ? lastRef : undefined} className="block-wrap">
          <BlockView block={b} index={i} onDone={handleDone} />
        </div>
      ))}

      {canContinue && (
        <div className="continue">
          <button type="button" className="btn big" onClick={() => setStep((s) => s + 1)}>
            كمّلي ←
          </button>
        </div>
      )}

      {finished && (
        <div className="card finish" ref={lastRef}>
          <h2>🎉 خلصتِ الدرس!</h2>
          <Stars count={stars} />
          {summary.items > 0 && (
            <p>
              أجبتِ صح من أول مرة على {display(String(summary.firstTry))} من {display(String(summary.items))}
            </p>
          )}
          <div className="row">
            {onNext && (
              <button type="button" className="btn big" onClick={onNext}>
                الدرس التالي: {nextTitle}
              </button>
            )}
            <button type="button" className="btn ghost" onClick={onExit}>
              الرئيسية
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
