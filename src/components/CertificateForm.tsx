import { useState } from 'react'
import { certFileName, certKindOf, cleanName, loadName, saveName, NAME_MAX } from '../lib/certificate'

interface Props {
  examId: string
  examTitle: string
  score: number
  total: number
}

function storage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/** تُكتب فيها الطالبة اسمها فتُطبع شهادة PDF أفقية (تعمل دون إنترنت). */
export function CertificateForm({ examId, examTitle, score, total }: Props) {
  const [name, setName] = useState(() => loadName(storage()))
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const kind = certKindOf(examId)
  const clean = cleanName(name)

  async function print() {
    if (!clean || !kind || busy) return
    setBusy(true)
    setMsg(null)
    try {
      const { makeCertificatePdf, downloadBlob } = await import('../lib/certificatePdf')
      const blob = await makeCertificatePdf({ name: clean, examTitle, kind, score, total, date: new Date() })
      downloadBlob(blob, certFileName(examId))
      saveName(storage(), clean)
      setMsg({ ok: true, text: 'تم تجهيز شهادتك 🎉 دوري عليها بملف التنزيلات.' })
    } catch {
      setMsg({ ok: false, text: 'ما قدرت أجهّز الشهادة، جرّبي مرة تانية.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card cert-form">
      <h3>🎓 شهادة شكر وتقدير</h3>
      <label htmlFor={`cert-name-${examId}`}>اكتبي اسمك لتُطبع على الشهادة:</label>
      <div className="answer-row">
        <input
          id={`cert-name-${examId}`}
          className="name-input"
          value={name}
          maxLength={NAME_MAX}
          placeholder="اسم الطالبة"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && void print()}
        />
        <button type="button" className="btn" disabled={!clean || busy} onClick={() => void print()}>
          {busy ? 'لحظة...' : '🖨️ اطبعي الشهادة (PDF)'}
        </button>
      </div>
      {msg && (
        <div className={`feedback ${msg.ok ? 'ok' : 'bad'}`} role="status">
          {msg.text}
        </div>
      )}
    </div>
  )
}
