import { Fragment } from 'react'
import { display } from '../lib/arabicText'

/** عرض نص عربي: أرقام عربية، فقرات، وخط عريض بين ** **. */
export function Inline({ text }: { text: string }) {
  const parts = display(text).split('**')
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <strong key={i}>{p}</strong>
        ) : (
          <Fragment key={i}>
            {p.split('\n').map((line, j, arr) => (
              <Fragment key={j}>
                {line}
                {j < arr.length - 1 && <br />}
              </Fragment>
            ))}
          </Fragment>
        ),
      )}
    </>
  )
}

export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split('\n\n').map((para, i) => (
        <p key={i}>
          <Inline text={para} />
        </p>
      ))}
    </>
  )
}
