import { useCallback, useRef, useState } from 'react'
import type { LabExperiment } from '../lab/experiments'
import { BENCHES } from '../lab/benchMap'
import { MCQuestion } from './MCQuestion'
import { Stars } from './Stars'
import { starsFor } from '../lib/progress'
import { n } from '../lab/ui'

interface Props {
  exp: LabExperiment
  lessonDone: boolean
  onFinish: (firstTry: number, total: number) => void
  onExit: () => void
  nextTitle?: string
  onNext?: () => void
}

export function LabRunner({ exp, lessonDone, onFinish, onExit, nextTitle, onNext }: Props) {
  const Bench = BENCHES[exp.bench]
  const [benchDone, setBenchDone] = useState(false)
  const [resolved, setResolved] = useState<Record<string, boolean>>({})
  const reported = useRef(false)
  const onBench = useCallback(() => setBenchDone(true), [])
  const total = exp.questions.length
  const answered = Object.keys(resolved).length
  const allDone = benchDone && answered === total
  const firstTry = Object.values(resolved).filter(Boolean).length

  function resolve(id: string, first: boolean) {
    setResolved((r) => {
      if (id in r) return r
      const next = { ...r, [id]: first }
      if (Object.keys(next).length === total && !reported.current) {
        reported.current = true
        onFinish(Object.values(next).filter(Boolean).length, total)
      }
      return next
    })
  }

  return (
    <div className="lab-runner">
      <button type="button" className="btn ghost small" onClick={onExit}>← المختبر</button>
      <header className="lab-head">
        <span className="big-emoji" aria-hidden="true">{exp.emoji}</span>
        <div>
          <small>التجربة {n(exp.num)} · صفحات {exp.pages} من كراسة التجارب</small>
          <h2>{exp.title}</h2>
        </div>
      </header>
      <div className={`after-chip${lessonDone ? ' ready' : ''}`}>
        {lessonDone ? '✅ جاهزة — ' : '📚 '}{exp.after.label}
      </div>
      <div className="card lab-goal">
        <p><strong>هدف التجربة:</strong> {exp.goal}</p>
        <details>
          <summary>🧰 المواد والأدوات</summary>
          <ul className="materials">{exp.materials.map((m) => (<li key={m}>{m}</li>))}</ul>
        </details>
        <details>
          <summary>📋 الخطوات هنا</summary>
          <ol>{exp.steps.map((s) => (<li key={s}>{s}</li>))}</ol>
        </details>
        <p className="muted-line">🛡️ هذا مختبر افتراضي. عند تنفيذ التجربة الحقيقية: ارتدي النظارة والقفازات، ولا تتذوقي أي مادة، وأخبري معلمتك بأي حادث.</p>
      </div>

      <Bench onDone={onBench} />

      {benchDone && (
        <section className="lab-questions">
          <h3>🧠 أسئلة واستنتاجات</h3>
          {exp.questions.map((q) => (
            <MCQuestion key={q.id} question={q} onResolved={(f) => resolve(q.id, f)} />
          ))}
        </section>
      )}
      {!benchDone && <p className="muted-line">أكملي مراحل التجربة لتظهر أسئلة الاستنتاج 🔓</p>}

      {allDone && (
        <div className="card lesson-done" role="status">
          <h3>🎉 أنجزتِ التجربة!</h3>
          <Stars count={starsFor(firstTry, total)} />
          <p>أجبتِ {n(firstTry)} من {n(total)} أسئلة من أول محاولة.</p>
          <div className="actions">
            {onNext && <button type="button" className="btn" onClick={onNext}>التجربة التالية: {nextTitle}</button>}
            <button type="button" className="btn ghost" onClick={onExit}>العودة للمختبر</button>
          </div>
        </div>
      )}
    </div>
  )
}
