export function Stars({ count, max = 3 }: { count: number; max?: number }) {
  return (
    <span className="stars" aria-label={`${count} من ${max} نجوم`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < count ? 'star on' : 'star'} aria-hidden="true">
          {i < count ? '★' : '☆'}
        </span>
      ))}
    </span>
  )
}
