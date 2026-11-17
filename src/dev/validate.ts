import { checkContent } from './contentCheck'
import { EXAMS } from '../content/exams'
import { LESSONS } from '../content/registry'

const errors = checkContent()
console.log(`الدروس: ${LESSONS.length}`)
for (const e of EXAMS) console.log(`${e.id}: ${e.questions.length} سؤالاً`)
if (errors.length) {
  console.error(`\n❌ ${errors.length} مشكلة:`)
  for (const e of errors) console.error(' -', e)
  process.exit(1)
}
console.log('✅ المحتوى سليم')
