// ─── Spinner ───────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', color = 'forest' }) {
  const s = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-3', lg: 'w-12 h-12 border-4' }[size]
  const c = color === 'white' ? 'border-white border-t-transparent' : 'border-forest-500 border-t-transparent'
  return <div className={`${s} ${c} rounded-full animate-spin`} />
}

// ─── État vide ──────────────────────────────────────────────────────────────
export function Empty({ icon = '📭', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <p className="font-semibold text-gray-700 text-base mb-1">{title}</p>
      {description && <p className="text-sm text-gray-400 max-w-xs mb-5">{description}</p>}
      {action}
    </div>
  )
}

// ─── Bannière alerte ────────────────────────────────────────────────────────
export function AlertBanner({ type = 'error', message, onClose }) {
  const styles = {
    error:   'bg-red-50 border-red-200 text-red-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    info:    'bg-blue-50 border-blue-200 text-blue-700',
  }
  const icons = { error: '⚠️', success: '✅', warning: '⚡', info: 'ℹ️' }
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm animate-fade-in ${styles[type]}`}>
      <span>{icons[type]}</span>
      <p className="flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">✕</button>
      )}
    </div>
  )
}

// ─── Modal ───────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-large w-full ${widths[size]} animate-slide-up`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon, iconBg, valueColor = 'text-gray-900', sub, trend }) {
  return (
    <div className="card p-5 flex flex-col gap-3 hover:shadow-medium transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${iconBg}`}>{icon}</div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className={`text-2xl font-bold ${valueColor}`}>{value ?? '—'}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Badge batterie ──────────────────────────────────────────────────────────
export function BatteryBar({ level }) {
  const color = level > 50 ? 'bg-emerald-500' : level > 20 ? 'bg-amber-400' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${level}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-600">{level}%</span>
    </div>
  )
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
export function Avatar({ nom, prenom, size = 'md', color = 'amber' }) {
  const sizes = { xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }
  const colors = {
    amber:  'bg-amber-100 text-amber-700',
    forest: 'bg-forest-100 text-forest-700',
    blue:   'bg-blue-100 text-blue-700',
  }
  return (
    <div className={`${sizes[size]} ${colors[color]} rounded-full flex items-center justify-center font-bold flex-shrink-0`}>
      {prenom?.[0]}{nom?.[0]}
    </div>
  )
}

// ─── Toggle switch ────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
        <div className={`w-9 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-forest-500' : 'bg-gray-200'}`} />
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-4' : ''}`} />
      </div>
      {label && <span className="text-sm text-gray-600">{label}</span>}
    </label>
  )
}
