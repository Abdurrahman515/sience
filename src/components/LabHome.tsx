import { LAB_EXPERIMENTS } from '../lab/experiments'
import { UNITS } from '../content/registry'
import { getLesson } from '../content/registry'
import { labStars, type ProgressData } from '../lib/progress'
import { Stars } from './Stars'
import { n } from '../lab/ui'

export function LabHome({ progress, go }: { progress: ProgressData; go: (h: string) => void }) {
  const done = LAB_EXPERIMENTS.filter((e) => progress.labs?.[e.id]?.done).length
  return (
    <div className="lab-home">
      <button type="button" className="btn ghost small" onClick={() => go('#/')}>← الرئيسية</button>
      <header className="lab-hero">
        <div className="orbs" aria-hidden="true"><i /><i /><i /><i /></div>
        <h1>🔬 مختبر العلوم الافتراضي</h1>
        <p>{n(LAB_EXPERIMENTS.length)} تجربة من كراسة التجارب تجريها بيدك على الشاشة: اخلطي وقيسي وراقبي وسجّلي… بلا زجاج مكسور ولا فوضى! 🧪✨</p>
        <div className="lab-stats">
          <span>✅ أنجزتِ <strong>{n(done)}</strong> / {n(LAB_EXPERIMENTS.length)}</span>
          <span>⭐ نجوم المختبر <strong>{n(labStars(progress))}</strong></span>
        </div>
      </header>
      {UNITS.map((u) => {
        const exps = LAB_EXPERIMENTS.filter((e) => e.unit === u.id)
        if (exps.length === 0) return null
        return (
          <section key={u.id} className="lab-unit">
            <h2>{u.title}</h2>
            <div className="lab-grid">
              {exps.map((e) => {
                const p = progress.labs?.[e.id]
                const lessonDone = !!progress.lessons[e.after.lessonId]?.done
                const lesson = getLesson(e.after.lessonId)
                return (
                  <button key={e.id} type="button" className={`lab-card${p?.done ? ' finished' : ''}`} onClick={() => go(`#/lab/${e.id}`)}>
                    <span className="lab-emoji" aria-hidden="true">{e.emoji}</span>
                    <span className="lab-info">
                      <small>تجربة {n(e.num)} · الفصل {n(e.chapter)}</small>
                      <strong>{e.title}</strong>
                      <em className={lessonDone ? 'ready' : ''}>{lessonDone ? '✅ جاهزة' : '📚 بعد الدرس'}: {lesson?.title ?? e.after.label}</em>
                    </span>
                    {p?.done && <Stars count={p.stars} />}
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
