import type { ReactNode } from 'react'

interface Props {
  title: ReactNode
  open: boolean
  onToggle: () => void
  level: 'semester' | 'unit' | 'chapter'
  badge?: ReactNode
  children: ReactNode
}

export function Collapsible({ title, open, onToggle, level, badge, children }: Props) {
  return (
    <section className={`fold ${level}${open ? ' open' : ''}`}>
      <button type="button" className="fold-head" aria-expanded={open} onClick={onToggle}>
        <span className="chev" aria-hidden="true">
          {open ? '▾' : '◂'}
        </span>
        <span className="fold-title">{title}</span>
        {badge && <span className="fold-badge">{badge}</span>}
      </button>
      {open && <div className="fold-body">{children}</div>}
    </section>
  )
}
