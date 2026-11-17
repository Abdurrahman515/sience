// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { LessonPlayer } from '../components/LessonPlayer'
import { PracticeBlock } from '../components/PracticeBlock'
import { SortWidget } from '../components/widgets/SortWidget'
import { mc, quiz, say, sort } from '../content/helpers'
import type { Lesson } from '../content/types'

afterEach(cleanup)

const lesson: Lesson = {
  id: 't', unit: 1, chapter: 1, title: 'تجريبي', emoji: '🧪', pages: '١',
  blocks: [
    say('أول جزء'),
    quiz(mc('tq', 'سؤال؟', 'الصحيح', [['خطأ ١', 'تفسير الخطأ الأول'], ['خطأ ٢', 'تفسير الخطأ الثاني']], 'شرح')),
    say('الجزء الأخير'),
  ],
  bank: { r: [], m: [] },
}

describe('LessonPlayer', () => {
  it('يعرض الدرس جزءاً جزءاً ولا يتجاوز السؤال الخاطئ', () => {
    const onFinish = vi.fn()
    render(<LessonPlayer lesson={lesson} onFinish={onFinish} onExit={() => {}} />)
    expect(screen.getByText('أول جزء')).toBeTruthy()
    expect(screen.queryByText('سؤال؟')).toBeNull()

    fireEvent.click(screen.getByText('كمّلي ←'))
    expect(screen.getByText('سؤال؟')).toBeTruthy()
    expect(screen.queryByText('كمّلي ←')).toBeNull()

    fireEvent.click(screen.getByText('خطأ ١'))
    expect(screen.getByText(/تفسير الخطأ الأول/)).toBeTruthy()
    expect(screen.queryByText('كمّلي ←')).toBeNull()
    expect(screen.queryByText('شرح')).toBeNull()

    fireEvent.click(screen.getByText('الصحيح'))
    expect(screen.getByText('شرح')).toBeTruthy()
    fireEvent.click(screen.getByText('كمّلي ←'))
    expect(screen.getByText('الجزء الأخير')).toBeTruthy()
    expect(onFinish).toHaveBeenCalledTimes(1)
    expect(onFinish).toHaveBeenCalledWith(0, 1)
  })

  it('يحسب الإجابة من أول مرة', () => {
    const onFinish = vi.fn()
    render(<LessonPlayer lesson={lesson} onFinish={onFinish} onExit={() => {}} />)
    fireEvent.click(screen.getByText('كمّلي ←'))
    fireEvent.click(screen.getByText('الصحيح'))
    fireEvent.click(screen.getByText('كمّلي ←'))
    expect(onFinish).toHaveBeenCalledWith(1, 1)
  })
})

describe('PracticeBlock', () => {
  it('لا يعطي الحل عند الخطأ ويكتشف الخطأ الشائع ثم يقبل الصحيح', () => {
    const onDone = vi.fn()
    render(<PracticeBlock gen="avgSpeed" count={1} seed={11} onDone={onDone} />)
    const input = screen.getByLabelText('إجابتك') as HTMLInputElement
    fireEvent.change(input, { target: { value: '١' } })
    fireEvent.click(screen.getByText('تحقّقي'))
    expect(screen.getByRole('status').textContent).toContain('جرّبي')
    expect(screen.queryByText('خلصنا ✔')).toBeNull()
    fireEvent.change(input, { target: { value: 'أبج' } })
    fireEvent.click(screen.getByText('تحقّقي'))
    expect(screen.getByRole('status').textContent).toContain('رقماً')
  })
})

describe('SortWidget', () => {
  it('يرفض التصنيف الخاطئ مع تلميح ويقبل الصحيح', () => {
    const b = sort('فرز', 'صنّفي', ['أ', 'ب'], [['عنصر١', 0, 'تلميح١'], ['عنصر٢', 1, 'تلميح٢']])
    if (b.type !== 'widget' || b.widget.kind !== 'sort') throw new Error('x')
    const onDone = vi.fn()
    render(<SortWidget spec={b.widget} onDone={onDone} />)
    fireEvent.click(screen.getByText('عنصر١'))
    fireEvent.click(screen.getAllByText('ب')[0])
    expect(screen.getByText(/تلميح١/)).toBeTruthy()
    fireEvent.click(screen.getAllByText('أ')[0])
    fireEvent.click(screen.getByText('عنصر٢'))
    fireEvent.click(screen.getAllByText('ب')[0])
    expect(onDone).toHaveBeenCalledWith({ items: 2, firstTry: 1 })
  })
})
