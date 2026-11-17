// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ExamRunner } from '../components/ExamRunner'
import { Home } from '../components/Home'
import { mc } from '../content/helpers'
import { emptyProgress, recordExam } from '../lib/progress'
import { emptyUi } from '../lib/uiState'
import type { ExamDef } from '../lib/exam'

afterEach(cleanup)

const q1 = mc('t-1', 'سؤال أول؟', 'صح١', [['خطأ١', 'سبب الخطأ الأول']], 'شرح أول')
const q2 = mc('t-2', 'سؤال ثان؟', 'صح٢', [['خطأ٢', 'سبب الخطأ الثاني']], 'شرح ثان')
const mk = (id: string): ExamDef => ({ id, title: 'اختبار تجريبي', emoji: '📝', minutes: 5, questions: [q1, q2] })
const click = (t: string) => fireEvent.click(screen.getByText(t))

describe('مراجعة الوحدة: تصحيح فوري', () => {
  it('يظهر التصحيح والتعليق والشرح عند الإجابة، ولا انتقال قبل الإجابة', () => {
    render(<ExamRunner exam={mk('u9-review')} onFinish={() => {}} onExit={() => {}} onRetry={() => {}} />)
    expect((screen.getByText(/السؤال التالي/) as HTMLButtonElement).disabled).toBe(true)
    click('خطأ١')
    expect(screen.getByText(/سبب الخطأ الأول/)).toBeTruthy()
    expect(screen.getByText(/الإجابة الصحيحة: صح١/)).toBeTruthy()
    expect(screen.getByText('شرح أول')).toBeTruthy()
    expect((screen.getByText(/السؤال التالي/) as HTMLButtonElement).disabled).toBe(false)
  })
  it('النهاية: نجاح ٧٠٪ فأكثر، أخطاء مجمّعة، وإعادة بلا شروط', () => {
    const onFinish = vi.fn()
    const onRetry = vi.fn()
    render(<ExamRunner exam={mk('u9-review')} onFinish={onFinish} onExit={() => {}} onRetry={onRetry} />)
    click('صح١')
    fireEvent.click(screen.getByText(/السؤال التالي/))
    click('خطأ٢')
    fireEvent.click(screen.getByText(/شوفي نتيجتك/))
    expect(onFinish).toHaveBeenCalledWith(1, 2)
    expect(screen.getByText(/لسه ما وصلتِ لحد النجاح/)).toBeTruthy()
    expect(screen.getByText('راجعي أخطاءك (١)')).toBeTruthy()
    expect(screen.queryByText(/🔒/)).toBeNull()
    fireEvent.click(screen.getByText(/أعيدي الاختبار/))
    expect(onRetry).toHaveBeenCalled()
    expect(screen.queryByText(/شهادة/)).toBeNull()
  })
})

describe('منتصف/نهاية الفصل: صارم', () => {
  it('لا تصحيح ولا تلميح أثناء الاختبار', () => {
    render(<ExamRunner exam={mk('midterm-9')} onFinish={() => {}} onExit={() => {}} />)
    click('خطأ١')
    expect(screen.queryByText(/سبب الخطأ/)).toBeNull()
    expect(screen.queryByText('شرح أول')).toBeNull()
    expect(screen.queryByRole('status')).toBeNull()
  })
  it('رسوب: قفل ٢٤ ساعة وبلا زر إعادة ولا شهادة', () => {
    render(<ExamRunner exam={mk('midterm-9')} onFinish={() => {}} onExit={() => {}} onRetry={() => {}} />)
    click('خطأ١')
    fireEvent.click(screen.getByText(/التالي/))
    click('خطأ٢')
    fireEvent.click(screen.getByText('إنهاء الاختبار'))
    fireEvent.click(screen.getByText('نعم، سلّمي'))
    expect(screen.getByText(/بعد ٢٤ ساعة/)).toBeTruthy()
    expect(screen.queryByText(/أعيدي الاختبار/)).toBeNull()
    expect(screen.queryByText(/شهادة/)).toBeNull()
    expect(screen.getByText('راجعي أخطاءك (٢)')).toBeTruthy()
  })
  it('نجاح (٦٠٪+): نموذج الاسم والشهادة؛ والزر معطّل حتى كتابة اسم', () => {
    render(<ExamRunner exam={mk('final-9')} onFinish={() => {}} onExit={() => {}} />)
    click('صح١')
    fireEvent.click(screen.getByText(/التالي/))
    click('صح٢')
    fireEvent.click(screen.getByText('إنهاء الاختبار'))
    fireEvent.click(screen.getByText('نعم، سلّمي'))
    const btn = screen.getByText(/اطبعي الشهادة/) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
    fireEvent.change(screen.getByPlaceholderText('اسم الطالبة'), { target: { value: 'سلمى' } })
    expect(btn.disabled).toBe(false)
  })
})

describe('الرئيسية: الشهادة والقفل', () => {
  const home = (p = emptyProgress()) => render(<Home progress={p} ui={emptyUi()} onToggle={() => {}} go={() => {}} />)
  it('لا خيار شهادة قبل النجاح ولا بعد الرسوب', () => {
    home()
    expect(screen.queryByText(/شهادة الشكر/)).toBeNull()
    cleanup()
    home(recordExam(emptyProgress(), 'midterm-1', 2, 20))
    expect(screen.queryByText(/شهادة الشكر/)).toBeNull()
  })
  it('بعد الرسوب يُقفل الاختبار على الرئيسية', () => {
    home(recordExam(emptyProgress(), 'midterm-1', 2, 20, Date.now()))
    expect(screen.getByText(/مقفل — تقدرين تعيدينه بعد/)).toBeTruthy()
  })
  it('بعد النجاح يظهر زر الشهادة ويفتح نموذج الاسم', () => {
    home(recordExam(emptyProgress(), 'midterm-1', 18, 20))
    fireEvent.click(screen.getByText(/شهادة الشكر والتقدير/))
    expect(screen.getByPlaceholderText('اسم الطالبة')).toBeTruthy()
  })
})
