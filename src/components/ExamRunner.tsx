import { useEffect, useMemo, useRef, useState } from 'react'
import type { ExamDef } from '../lib/exam'
import { type Answer, formatClock, gradeLabel, isCorrect, optionsOf, scoreExam } from '../lib/exam'
import { checkNumeric } from '../lib/generators'
import { display, parseNumber, toArabicDigits } from '../lib/arabicText'
import { hashString, mulberry32 } from '../lib/rng'
import { miss, praise } from '../lib/praise'
import { LOCK_MS, examMode, examPassed, lockText, passRatioOf, percentText } from '../lib/examRules'
import { groupErrors } from '../lib/examReview'
import { certKindOf } from '../lib/certificate'
import { LESSONS, getLesson, lessonIdOfQuestion } from '../content/registry'
import type { Question } from '../content/types'
import { Inline } from './Text'
import { CertificateForm } from './CertificateForm'

interface Props {
  exam: ExamDef
  onFinish: (score: number, total: number) => void
  onExit: () => void
  /** إعادة الاختبار (مراجعات الوحدات فقط) */
  onRetry?: () => void
}

const ORDER = LESSONS.map((l) => l.id)
const correctText = (q: Question) => (q.kind === 'mc' ? display(q.correct) : `${display(String(q.answer))} ${q.unit}`)

function Results({ exam, qs, answers, score, onExit, onRetry }: {
  exam: ExamDef; qs: Question[]; answers: Record<string, Answer>; score: number; onExit: () => void; onRetry?: () => void
}) {
  const mode = examMode(exam.id)
  const ok = examPassed(exam.id, score, qs.length)
  const g = gradeLabel(score, qs.length)
  const wrong = qs.filter((q) => !isCorrect(q, answers[q.id] ?? null))
  const groups = groupErrors(wrong, lessonIdOfQuestion, ORDER)
  const toReview = groups.filter((x) => x.lessonId && getLesson(x.lessonId))
  return (
    <div className="exam">
      <div className="card finish">
        <h2>
          {g.emoji} نتيجتك: {display(String(score))} من {display(String(qs.length))}
        </h2>
        <p className={ok ? 'pass' : 'fail'}>
          {ok ? `✅ نجحتِ! (حد النجاح ${percentText(passRatioOf(exam.id))})` : `لسه ما وصلتِ لحد النجاح (${percentText(passRatioOf(exam.id))})`}
        </p>
        <p>{g.text}</p>
        {!ok && mode === 'strict' && (
          <p className="lock-note" role="status">
            🔒 تقدرين تعيدين هذا الاختبار بعد {lockText(LOCK_MS)}. استفيدي من الوقت بمراجعة الدروس تحت.
          </p>
        )}
        <div className="row">
          {mode === 'review' && onRetry && (
            <button type="button" className="btn" onClick={onRetry}>
              🔁 أعيدي الاختبار
            </button>
          )}
          <button type="button" className="btn big" onClick={onExit}>
            الرئيسية
          </button>
        </div>
      </div>

      {ok && certKindOf(exam.id) && (
        <CertificateForm examId={exam.id} examTitle={exam.title} score={score} total={qs.length} />
      )}

      {toReview.length > 0 && (
        <div className="card review-lessons">
          <h3>📚 دروس تحتاج مراجعة</h3>
          <div className="chips">
            {toReview.map((x) => (
              <a key={x.lessonId} className="btn ghost small" href={`#/lesson/${x.lessonId}`}>
                {getLesson(x.lessonId!)!.emoji} {getLesson(x.lessonId!)!.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {wrong.length > 0 && <h3 className="section">راجعي أخطاءك ({display(String(wrong.length))})</h3>}
      {groups.map((grp) => (
        <section key={grp.lessonId ?? 'other'} className="err-group">
          <h4>{grp.lessonId && getLesson(grp.lessonId) ? `${getLesson(grp.lessonId)!.emoji} ${getLesson(grp.lessonId)!.title}` : 'أسئلة أخرى'}</h4>
          {grp.questions.map((q) => (
            <div key={q.id} className="card review">
              <p className="q">
                <Inline text={q.q} />
              </p>
              <p className="your">
                إجابتك: {answers[q.id] === undefined || answers[q.id] === null ? 'لم تجيبي' : display(String(answers[q.id]))}
              </p>
              <p className="right">الإجابة الصحيحة: {correctText(q)}</p>
              <p className="explain">
                <Inline text={q.explain} />
              </p>
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}

export function ExamRunner({ exam, onFinish, onExit, onRetry }: Props) {
  const qs = exam.questions
  const mode = examMode(exam.id)
  const instant = mode === 'review'
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [raw, setRaw] = useState<Record<string, string>>({})
  /** مراجعة الوحدة: الأسئلة التي صُحّحت فوراً (الإجابة الأولى هي المحتسبة) */
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [left, setLeft] = useState(exam.minutes * 60)
  const [submitted, setSubmitted] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const reported = useRef(false)
  const finished = submitted || (!instant && left <= 0)

  useEffect(() => {
    if (finished || instant) return
    const t = setInterval(() => setLeft((l) => l - 1), 1000)
    return () => clearInterval(t)
  }, [finished, instant])

  const score = useMemo(() => (finished ? scoreExam(qs, answers) : 0), [finished, qs, answers])

  useEffect(() => {
    if (finished && !reported.current) {
      reported.current = true
      onFinish(score, qs.length)
    }
  }, [finished, score, qs.length, onFinish])

  if (finished) return <Results exam={exam} qs={qs} answers={answers} score={score} onExit={onExit} onRetry={onRetry} />

  const q = qs[idx]
  const answered = Object.values(answers).filter((a) => a !== null && a !== undefined).length
  const isChecked = !!checked[q.id]
  const rng = mulberry32(hashString(q.id) + 11)

  function setNumeric(v: string) {
    setRaw((r) => ({ ...r, [q.id]: v }))
    setAnswers((a) => ({ ...a, [q.id]: parseNumber(v) }))
  }

  function pickMc(o: string) {
    if (instant && isChecked) return
    setAnswers((a) => ({ ...a, [q.id]: o }))
    if (instant) setChecked((c) => ({ ...c, [q.id]: true }))
  }

  function checkNum() {
    if (answers[q.id] == null) return
    setChecked((c) => ({ ...c, [q.id]: true }))
  }

  function feedbackFor() {
    const a = answers[q.id] ?? null
    const ok = isCorrect(q, a)
    let why: string | undefined
    if (!ok) {
      if (q.kind === 'mc') why = q.wrongs.find((w) => w.t === a)?.why
      else if (typeof a === 'number') why = checkNumeric(q, a).why
    }
    return (
      <div className={`feedback ${ok ? 'ok' : 'bad'}`} role="status">
        <Inline text={ok ? praise(rng) : miss(rng)} />
        {!ok && why && (
          <p>
            <Inline text={why} />
          </p>
        )}
        {!ok && <p className="right">الإجابة الصحيحة: {correctText(q)}</p>}
        <p className="explain">
          <Inline text={q.explain} />
        </p>
      </div>
    )
  }

  const last = idx === qs.length - 1

  return (
    <div className="exam">
      <div className="exam-head">
        <strong>{exam.title}</strong>
        {!instant && (
          <span className={`clock${left < 60 ? ' low' : ''}`} aria-label="الوقت المتبقي">
            ⏱ {toArabicDigits(formatClock(left))}
          </span>
        )}
      </div>
      <p className="meta">
        السؤال {display(String(idx + 1))} من {display(String(qs.length))}
        {!instant && ` — أجبتِ على ${display(String(answered))}`}
        {instant ? ' — تصحيح فوري' : ` — بلا تصحيح حتى النهاية (النجاح ${percentText(passRatioOf(exam.id))})`}
      </p>
      <div className="card quiz">
        <p className="q">
          <Inline text={q.q} />
        </p>
        {q.kind === 'mc' ? (
          <div className="options">
            {optionsOf(q).map((o) => {
              const picked = answers[q.id] === o
              const cls = instant && isChecked
                ? o === q.correct ? ' right' : picked ? ' wrong' : ''
                : picked ? ' picked' : ''
              return (
                <button key={o} type="button" className={`option${cls}`} disabled={instant && isChecked} onClick={() => pickMc(o)}>
                  <Inline text={o} />
                </button>
              )
            })}
          </div>
        ) : (
          <div className="answer-row">
            <input
              className="num-input"
              inputMode="decimal"
              aria-label="إجابتك"
              placeholder="الجواب"
              value={raw[q.id] ?? ''}
              disabled={instant && isChecked}
              onChange={(e) => setNumeric(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && instant && !isChecked && checkNum()}
            />
            <span className="unit">{q.unit}</span>
            {instant && !isChecked && (
              <button type="button" className="btn small" disabled={answers[q.id] == null} onClick={checkNum}>
                تحقّقي
              </button>
            )}
          </div>
        )}
        {instant && isChecked && feedbackFor()}
      </div>

      {instant ? (
        <div className="row">
          {!last ? (
            <button type="button" className="btn" disabled={!isChecked} onClick={() => setIdx(idx + 1)}>
              السؤال التالي ←
            </button>
          ) : (
            <button type="button" className="btn" disabled={!isChecked} onClick={() => setSubmitted(true)}>
              شوفي نتيجتك 🎯
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="row">
            <button type="button" className="btn ghost" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>
              → السابق
            </button>
            {!last ? (
              <button type="button" className="btn" onClick={() => setIdx(idx + 1)}>
                التالي ←
              </button>
            ) : (
              <button type="button" className="btn" onClick={() => setConfirm(true)}>
                إنهاء الاختبار
              </button>
            )}
          </div>
          <div className="dots" aria-label="خريطة الأسئلة">
            {qs.map((x, i) => (
              <button
                key={x.id}
                type="button"
                className={`dot${i === idx ? ' cur' : ''}${answers[x.id] != null ? ' ans' : ''}`}
                onClick={() => setIdx(i)}
                aria-label={`السؤال ${i + 1}`}
              >
                {toArabicDigits(i + 1)}
              </button>
            ))}
          </div>
        </>
      )}
      {confirm && (
        <div className="card confirm" role="alertdialog">
          <p>
            {answered < qs.length
              ? `لسه ${display(String(qs.length - answered))} أسئلة بدون جواب. متأكدة بدك تنهي؟`
              : 'جاهزة تسلّمي ورقة الاختبار؟'}
          </p>
          <div className="row">
            <button type="button" className="btn" onClick={() => setSubmitted(true)}>
              نعم، سلّمي
            </button>
            <button type="button" className="btn ghost" onClick={() => setConfirm(false)}>
              رجوع
            </button>
          </div>
        </div>
      )}
      <button type="button" className="btn ghost exit" onClick={onExit}>
        الخروج بدون تسليم
      </button>
    </div>
  )
}
