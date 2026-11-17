import type { Block, GenId, MC, NumQ, WidgetSpec } from './types'

type W = string | [string, string]

/** سؤال اختيار من متعدد. أول خيار صحيح دائماً هنا، والترتيب يُخلَط عند العرض. */
export function mc(id: string, q: string, correct: string, wrongs: W[], explain: string): MC {
  return {
    kind: 'mc', id, q, correct, explain,
    wrongs: wrongs.map((w) => (typeof w === 'string' ? { t: w } : { t: w[0], why: w[1] })),
  }
}

/** سؤال صح/خطأ: نصّ العبارة، وهل هي صحيحة. */
export function tf(id: string, statement: string, isTrue: boolean, explain: string, why?: string): MC {
  return mc(
    id,
    `${statement}\nهل العبارة صحيحة أم خاطئة؟`,
    isTrue ? 'صحيحة' : 'خاطئة',
    [[isTrue ? 'خاطئة' : 'صحيحة', why ?? (isTrue ? 'راجعي العبارة، هي مطابقة لما درسناه.' : 'دقّقي في العبارة، فيها شي مو مظبوط.')]],
    explain,
  )
}

export function num(
  id: string, q: string, answer: number, unit: string, explain: string,
  extra: Partial<Pick<NumQ, 'law' | 'sub' | 'mistakes'>> = {},
): NumQ {
  return { kind: 'num', id, q, answer, unit, explain, ...extra }
}

export const say = (text: string, emoji?: string, title?: string): Block => ({ type: 'say', text, emoji, title })
export const quiz = (question: MC): Block => ({ type: 'quiz', question })
export const practice = (gen: GenId, count = 3, title?: string): Block => ({ type: 'practice', gen, count, title })
export const reveal = (title: string, cards: [string, string][]): Block => ({
  type: 'reveal', title, cards: cards.map(([front, back]) => ({ front, back })),
})
export const widget = (w: WidgetSpec): Block => ({ type: 'widget', widget: w })
export const sort = (
  title: string, prompt: string, categories: string[], items: [string, number, string][],
): Block => widget({
  kind: 'sort', title, prompt, categories,
  items: items.map(([text, cat, hint]) => ({ text, cat, hint })),
})
export const order = (title: string, prompt: string, steps: string[], hint: string): Block =>
  widget({ kind: 'order', title, prompt, steps, hint })
