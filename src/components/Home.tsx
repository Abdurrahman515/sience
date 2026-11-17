import { Fragment, useState } from 'react'
import { getLesson } from '../content/registry'
import { SEMESTERS, isPending, type SemesterExam } from '../content/curriculum'
import type { ProgressData } from '../lib/progress'
import type { ExamDef } from '../lib/exam'
import { totalStars } from '../lib/progress'
import { display, toArabicDigits } from '../lib/arabicText'
import { chapterKey, isOpen, semesterKey, unitKey, type UiState } from '../lib/uiState'
import { Stars } from './Stars'
import { Collapsible } from './Collapsible'
import { CertificateForm } from './CertificateForm'
import { canPrintCertificate } from '../lib/certificate'
import { examMode, lockText, lockedUntil, percentText, passRatioOf } from '../lib/examRules'

function ExamCard({ exam, progress, go }: { exam: SemesterExam; progress: ProgressData; go: (h: string) => void }) {
  if (isPending(exam)) {
    return (
      <div className="exam-card pending" aria-disabled="true">
        <span className="emoji">{exam.emoji}</span>
        <span className="grow">
          <strong>{exam.title}</strong>
          <small>قريباً — بعد إضافة بقية دروس الفصل</small>
        </span>
      </div>
    )
  }
  return <ReadyExamCard exam={exam} progress={progress} go={go} />
}

function ReadyExamCard({ exam, progress, go }: { exam: ExamDef; progress: ProgressData; go: (h: string) => void }) {
  const p = progress.exams[exam.id]
  const [certOpen, setCertOpen] = useState(false)
  // وقت الفتح مرة واحدة عند العرض (تُعاد الشاشة عند كل تنقّل)
  const [now] = useState(() => Date.now())
  const until = lockedUntil(progress, exam.id, now)
  const canCert = canPrintCertificate(exam.id, progress)
  const sub =
    examMode(exam.id) === 'review'
      ? `${display(String(exam.questions.length))} سؤالاً — تصحيح فوري — النجاح ${percentText(passRatioOf(exam.id))}`
      : `${display(String(exam.questions.length))} سؤالاً — ${display(String(exam.minutes))} دقيقة — النجاح ${percentText(passRatioOf(exam.id))}`
  const body = (
    <>
      <span className="emoji">{until > 0 ? '🔒' : exam.emoji}</span>
      <span className="grow">
        <strong>{exam.title}</strong>
        <small>{until > 0 ? `مقفل — تقدرين تعيدينه بعد ${lockText(until - now)}` : sub}</small>
      </span>
      {p && (
        <span className="best">
          أفضل نتيجة: {display(String(p.best))}/{display(String(p.total))}
        </span>
      )}
    </>
  )
  return (
    <div className="exam-wrap">
      {until > 0 ? (
        <div className="exam-card pending" aria-disabled="true">
          {body}
        </div>
      ) : (
        <button type="button" className="exam-card" onClick={() => go(`#/exam/${exam.id}`)}>
          {body}
        </button>
      )}
      {canCert && (
        <>
          <button type="button" className="btn ghost small cert-btn" aria-expanded={certOpen} onClick={() => setCertOpen((o) => !o)}>
            🎓 شهادة الشكر والتقدير
          </button>
          {certOpen && p && <CertificateForm examId={exam.id} examTitle={exam.title} score={p.best} total={p.total} />}
        </>
      )}
    </div>
  )
}

function doneCount(ids: string[], progress: ProgressData): string {
  const done = ids.filter((id) => progress.lessons[id]?.done).length
  return `${toArabicDigits(done)}/${toArabicDigits(ids.length)} دروس`
}

interface Props {
  progress: ProgressData
  ui: UiState
  onToggle: (key: string) => void
  go: (h: string) => void
}

export function Home({ progress, ui, onToggle, go }: Props) {
  return (
    <div className="home">
      <header className="hero">
        <h1>🔬 علوم أول متوسط</h1>
        <p>تعلّمي العلوم خطوة خطوة، بالشرح والألعاب والتحدّيات!</p>
        <div className="total">
          ⭐ نجومك: <strong>{toArabicDigits(totalStars(progress))}</strong>
        </div>
      </header>

      <button type="button" className="lab-banner" onClick={() => go('#/lab')}>
        <span className="lab-banner-emoji" aria-hidden="true">🧪</span>
        <span className="grow">
          <strong>مختبر العلوم الافتراضي</strong>
          <small style={{ color: "white" }}>٢٦ تجربة تفاعلية تجريها بيدك - ابدئي الآن!</small>
        </span>
        <span aria-hidden="true">←</span>
      </button>

      {SEMESTERS.map((s) => (
        <Collapsible
          key={s.id}
          level="semester"
          title={s.title}
          open={isOpen(ui, semesterKey(s.id))}
          onToggle={() => onToggle(semesterKey(s.id))}
          badge={s.soon ? 'قريباً' : undefined}
        >
          {s.soon && s.units.length === 0 && <p className="soon">دروس هذا الفصل ستُضاف قريباً ✨</p>}

          {s.units.map((u, i) => (
            <Fragment key={u.foldKey ?? u.id}>
              {/* اختبار منتصف الفصل يظهر قبل العنصر الثالث (بعد الوحدتين الأولى والثانية، أو بعد الفصل ١٠ في الفصل الثاني) */}
              {i === 2 && s.exams.filter((e) => e.id.startsWith('midterm')).map((e) => (
                <ExamCard key={e.id} exam={e} progress={progress} go={go} />
              ))}

              <Collapsible
                key={u.foldKey ?? u.id}
                level="unit"
                title={u.label ?? `الوحدة ${toArabicDigits(u.id)}: ${u.title}`}
                open={isOpen(ui, unitKey(u.foldKey ?? u.id))}
                onToggle={() => onToggle(unitKey(u.foldKey ?? u.id))}
                badge={u.soon ? 'قريباً' : undefined}
              >
                {u.soon && <p className="soon">دروس هذه الوحدة ستُضاف قريباً ✨</p>}
                {u.chapters.map((c) => (
                  <Collapsible
                    key={c.id}
                    level="chapter"
                    title={`الفصل ${toArabicDigits(c.id)}: ${c.title}`}
                    open={isOpen(ui, chapterKey(c.id))}
                    onToggle={() => onToggle(chapterKey(c.id))}
                    badge={doneCount(c.lessonIds, progress)}
                  >
                    <div className="lesson-grid">
                      {c.lessonIds.map((id) => {
                        const l = getLesson(id)
                        if (!l) return null
                        const p = progress.lessons[id]
                        return (
                          <button key={id} type="button" className={`lesson-card${p?.done ? ' done' : ''}`} onClick={() => go(`#/lesson/${id}`)}>
                            <span className="emoji">{l.emoji}</span>
                            <span className="grow">
                              <strong>{l.title}</strong>
                              <small>ص {l.pages}</small>
                            </span>
                            <Stars count={p?.stars ?? 0} />
                          </button>
                        )
                      })}
                    </div>
                  </Collapsible>
                ))}
                {u.review && <ExamCard exam={u.review} progress={progress} go={go} />}
              </Collapsible>
            </Fragment>
          ))}

          <div className="semester-exams">
            {s.exams
              // المنتصف يظهر أعلاه إن وُجدت ٣ وحدات على الأقل، وإلا يظهر هنا مع النهاية
              .filter((e) => e.id.startsWith('final') || (e.id.startsWith('midterm') && s.units.length < 3))
              .map((e) => (
                <ExamCard key={e.id} exam={e} progress={progress} go={go} />
              ))}
          </div>
        </Collapsible>
      ))}

      <footer>
        <button type="button" className="btn ghost" onClick={() => go('#/settings')}>
          ⚙️ حفظ التقدم واستعادته
        </button>
      </footer>
    </div>
  )
}
