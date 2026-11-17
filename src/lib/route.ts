export type Route =
  | { name: 'home' }
  | { name: 'lesson'; id: string }
  | { name: 'exam'; id: string }
  | { name: 'lab' }
  | { name: 'experiment'; id: string }
  | { name: 'settings' }

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (parts[0] === 'lesson' && parts[1]) return { name: 'lesson', id: parts[1] }
  if (parts[0] === 'exam' && parts[1]) return { name: 'exam', id: parts[1] }
  if (parts[0] === 'lab' && parts[1]) return { name: 'experiment', id: parts[1] }
  if (parts[0] === 'lab') return { name: 'lab' }
  if (parts[0] === 'settings') return { name: 'settings' }
  return { name: 'home' }
}
