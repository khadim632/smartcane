export default function Radar({ state = 'ok', size = 'sm' }) {
  // state: 'ok' | 'offline' | 'critical'
  const cls = ['radar', size === 'lg' ? 'radar--lg' : '', state === 'offline' ? 'radar--offline' : '', state === 'critical' ? 'radar--critical' : '']
    .filter(Boolean).join(' ')
  return (
    <span className={cls} aria-hidden="true">
      <span className="radar__ring" />
      <span className="radar__ring" />
      <span className="radar__dot" />
    </span>
  )
}
