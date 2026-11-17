import { useState } from 'react'
import type { ProgressData } from '../lib/progress'
import { emptyProgress, exportProgress, importProgress } from '../lib/progress'

interface Props {
  progress: ProgressData
  onReplace: (p: ProgressData) => void
  onExit: () => void
}

export function Settings({ progress, onReplace, onExit }: Props) {
  const [text, setText] = useState('')
  const [msg, setMsg] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)

  function download() {
    const blob = new Blob([exportProgress(progress)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'science-progress.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function doImport() {
    const p = importProgress(text)
    if (!p) {
      setMsg('الملف غير صالح. تأكدي أنك نسختِ المحتوى كاملاً.')
      return
    }
    onReplace(p)
    setMsg('تمت الاستعادة بنجاح ✅')
    setText('')
  }

  async function onFile(f: File | undefined) {
    if (f) setText(await f.text())
  }

  return (
    <div className="settings">
      <button type="button" className="btn ghost" onClick={onExit}>
        ← الرئيسية
      </button>
      <h2>⚙️ حفظ التقدم واستعادته</h2>
      <div className="card">
        <h3>تصدير</h3>
        <p>احفظي نسخة من تقدمك في ملف.</p>
        <button type="button" className="btn" onClick={download}>
          تنزيل الملف
        </button>
      </div>
      <div className="card">
        <h3>استيراد</h3>
        <input type="file" accept="application/json,.json" aria-label="اختيار ملف" onChange={(e) => onFile(e.target.files?.[0])} />
        <textarea aria-label="محتوى الملف" rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder="أو الصقي المحتوى هنا" />
        <button type="button" className="btn" disabled={!text.trim()} onClick={doImport}>
          استعادة
        </button>
        {msg && <p role="status">{msg}</p>}
      </div>
      <div className="card">
        <h3>مسح التقدم</h3>
        {confirmReset ? (
          <div className="row">
            <button
              type="button"
              className="btn danger"
              onClick={() => {
                onReplace(emptyProgress())
                setConfirmReset(false)
              }}
            >
              نعم، امسحي كل شيء
            </button>
            <button type="button" className="btn ghost" onClick={() => setConfirmReset(false)}>
              رجوع
            </button>
          </div>
        ) : (
          <button type="button" className="btn danger" onClick={() => setConfirmReset(true)}>
            مسح التقدم
          </button>
        )}
      </div>
    </div>
  )
}
