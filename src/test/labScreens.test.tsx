// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import App from '../App'
import { LabHome } from '../components/LabHome'
import { LabRunner } from '../components/LabRunner'
import { LAB_EXPERIMENTS, getExperiment } from '../lab/experiments'
import { emptyProgress, importProgress, isValidProgress, labStars, recordLab, exportProgress, STORAGE_KEY } from '../lib/progress'
import { parseHash } from '../lib/route'

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  window.location.hash = ''
})

describe('التوجيه والتقدم', () => {
  it('مسارات المختبر', () => {
    expect(parseHash('#/lab')).toEqual({ name: 'lab' })
    expect(parseHash('#/lab/e05')).toEqual({ name: 'experiment', id: 'e05' })
    expect(parseHash('#/lesson/u1c1l1')).toEqual({ name: 'lesson', id: 'u1c1l1' })
  })
  it('تسجيل تجربة ونجومها وإبقاء الأفضل', () => {
    let p = recordLab(emptyProgress(), 'e01', 3, 3)
    expect(p.labs?.e01.stars).toBe(3)
    p = recordLab(p, 'e01', 0, 3)
    expect(p.labs?.e01.stars).toBe(3)
    p = recordLab(p, 'e02', 1, 3)
    expect(labStars(p)).toBe(4)
  })
  it('التقدم القديم بلا labs يبقى صالحاً، والتصدير/الاستيراد يحفظ التجارب', () => {
    expect(isValidProgress(emptyProgress())).toBe(true)
    const p = recordLab(emptyProgress(), 'e03', 2, 3)
    const back = importProgress(exportProgress(p))
    expect(back?.labs?.e03.done).toBe(true)
    expect(isValidProgress({ ...p, labs: { x: { stars: 9, done: true } } })).toBe(false)
    expect(isValidProgress({ ...p, labs: 5 })).toBe(false)
  })
})

describe('الصفحة الرئيسية للمختبر', () => {
  it('تعرض ٢٦ بطاقة موزّعة على الوحدات، وتذكر بعد أي درس تُجرى', () => {
    render(<LabHome progress={emptyProgress()} go={() => {}} />)
    expect(screen.getAllByText(/📚 بعد الدرس/).length).toBe(26)
    expect(screen.getByText('بلورات الشب والجيود')).toBeTruthy()
    expect(screen.getByText('ظاهرة الدفيئة (البيوت الزجاجية)')).toBeTruthy()
  })
  it('تظهر «جاهزة» عند إنجاز الدرس المطلوب والنجوم عند إنجاز التجربة', () => {
    const p = recordLab(emptyProgress(), 'e05', 3, 3)
    p.lessons['u2c3l1'] = { stars: 3, firstTry: 3, total: 3, done: true, updatedAt: 1 }
    render(<LabHome progress={p} go={() => {}} />)
    expect(screen.getAllByText(/✅ جاهزة/).length).toBe(1)
    expect(screen.getByLabelText('3 من 3 نجوم')).toBeTruthy()
  })
  it('الضغط على بطاقة ينقل إلى التجربة', () => {
    const go = vi.fn()
    render(<LabHome progress={emptyProgress()} go={go} />)
    fireEvent.click(screen.getByText('كثافة المواد الصلبة'))
    expect(go).toHaveBeenCalledWith('#/lab/e05')
  })
})

describe('مُشغّل التجربة', () => {
  it('الأسئلة مقفلة حتى تكتمل المنصّة، وتعرض بعد أي درس تُجرى', () => {
    const exp = getExperiment('e24')!
    render(<LabRunner exp={exp} lessonDone={false} onFinish={() => {}} onExit={() => {}} />)
    expect(screen.queryByText('🧠 أسئلة واستنتاجات')).toBeNull()
    expect(screen.getByText(/بعد الفصل ١٢ — الدرس ٢/)).toBeTruthy()
    expect(screen.getByText(/مختبر افتراضي/)).toBeTruthy()
  })
  it('تجربة كاملة: المنصّة ثم الأسئلة ثم التسجيل مرة واحدة', () => {
    const onFinish = vi.fn()
    const exp = getExperiment('e24')!
    render(<LabRunner exp={exp} lessonDone onFinish={onFinish} onExit={() => {}} />)
    const nodeName = (n: string) => screen.getByRole('button', { name: n })
    const edges: [string, string][] = [['العشب', 'الجراد'], ['العشب', 'الفأر'], ['الجراد', 'الضب'], ['الفأر', 'الأفعى'], ['الضب', 'الصقر'], ['الأفعى', 'الصقر'], ['الفأر', 'الصقر']]
    for (const [a, b] of edges) { fireEvent.click(nodeName(a)); fireEvent.click(nodeName(b)) }
    expect(screen.getByText('🧠 أسئلة واستنتاجات')).toBeTruthy()
    for (const q of exp.questions) fireEvent.click(screen.getByText(q.correct, { selector: 'button *, button' }))
    expect(onFinish).toHaveBeenCalledTimes(1)
    expect(onFinish).toHaveBeenCalledWith(3, 3)
    expect(screen.getByText('🎉 أنجزتِ التجربة!')).toBeTruthy()
  })
})

describe('التطبيق', () => {
  it('الرئيسية فيها لافتة المختبر، والضغط عليها يفتح المختبر ثم التجربة', () => {
    render(<App />)
    fireEvent.click(screen.getByText('مختبر العلوم الافتراضي'))
    expect(window.location.hash).toBe('#/lab')
  })
  it('فتح #/lab ثم #/lab/e01 يعرض صفحة التجربة', () => {
    window.location.hash = '#/lab'
    render(<App />)
    expect(screen.getByText('🔬 مختبر العلوم الافتراضي')).toBeTruthy()
    cleanup()
    window.location.hash = '#/lab/e01'
    render(<App />)
    expect(screen.getByText('حل مشكلة بالطريقة العلمية')).toBeTruthy()
  })
  it('إنجاز تجربة يُحفظ في localStorage', () => {
    window.location.hash = '#/lab/e24'
    render(<App />)
    const exp = getExperiment('e24')!
    const edges: [string, string][] = [['العشب', 'الجراد'], ['العشب', 'الفأر'], ['الجراد', 'الضب'], ['الفأر', 'الأفعى'], ['الضب', 'الصقر'], ['الأفعى', 'الصقر'], ['الفأر', 'الصقر']]
    for (const [a, b] of edges) { fireEvent.click(screen.getByRole('button', { name: a })); fireEvent.click(screen.getByRole('button', { name: b })) }
    for (const q of exp.questions) fireEvent.click(screen.getByText(q.correct, { selector: 'button *, button' }))
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}')
    expect(saved.labs?.e24?.done).toBe(true)
    expect(LAB_EXPERIMENTS.length).toBe(26)
  })
})
