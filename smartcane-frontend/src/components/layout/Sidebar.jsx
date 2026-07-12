import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Avatar } from '../ui'

// Menu PROCHE — surveille le porteur
const MENU_PROCHE = [
  { to: '/dashboard',     label: 'Tableau de bord', icon: <IconDashboard /> },
  { to: '/carte',         label: 'Carte GPS',        icon: <IconMap /> },
  { to: '/historique',    label: 'Historique',       icon: <IconHistory /> },
  { to: '/alertes',       label: 'Alertes',          icon: <IconBell />, badge: true },
  { to: '/proches',       label: 'Proches',          icon: <IconUsers /> },
  { to: '/geofences',     label: 'Géofencing',       icon: <IconZone /> },
  { to: '/notifications', label: 'Notifications',    icon: <IconNotif />, badge: true },
  { to: '/profil',        label: 'Mon profil',       icon: <IconUser /> },
]

// Menu PORTEUR — juste lier sa canne et son profil
const MENU_PORTEUR = [
  { to: '/ma-canne',  label: 'Ma canne',    icon: <IconCanne /> },
  { to: '/profil',    label: 'Mon profil',  icon: <IconUser /> },
]

// Menu ADMIN — tout
const MENU_ADMIN = [
  { to: '/dashboard',     label: 'Tableau de bord', icon: <IconDashboard /> },
  { to: '/carte',         label: 'Carte GPS',        icon: <IconMap /> },
  { to: '/historique',    label: 'Historique',       icon: <IconHistory /> },
  { to: '/alertes',       label: 'Alertes',          icon: <IconBell />, badge: true },
  { to: '/proches',       label: 'Proches',          icon: <IconUsers /> },
  { to: '/geofences',     label: 'Géofencing',       icon: <IconZone /> },
  { to: '/notifications', label: 'Notifications',    icon: <IconNotif />, badge: true },
  { to: '/profil',        label: 'Mon profil',       icon: <IconUser /> },
  { to: '/admin',         label: 'Administration',   icon: <IconAdmin /> },
]

function NavItem({ to, label, icon, hasBadge }) {
  return (
    <NavLink to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
          isActive
            ? 'bg-forest-600 text-white shadow-forest'
            : 'text-gray-500 hover:bg-cream-200 hover:text-gray-800'
        }`
      }>
      {({ isActive }) => (
        <>
          <span className={`transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`}>
            {icon}
          </span>
          <span className="flex-1">{label}</span>
          {hasBadge && (
            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-amber-300' : 'bg-amber-400'}`} />
          )}
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  const { utilisateur, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  // Choisir le bon menu selon le rôle
  const menu = utilisateur?.role === 'admin'
    ? MENU_ADMIN
    : utilisateur?.role === 'porteur'
    ? MENU_PORTEUR
    : MENU_PROCHE

  return (
    <aside className="w-[240px] min-h-screen bg-white border-r border-gray-100 flex flex-col shadow-soft">

      {/* Logo */}
      <div className="px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-forest-600 flex items-center justify-center shadow-forest">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" className="w-5 h-5">
              <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7z" />
              <circle cx="12" cy="9" r="2.5" fill="white" stroke="none" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-[15px] leading-tight">SmartCane</p>
            <p className="text-[10px] text-gray-400 leading-tight capitalize">{utilisateur?.role || 'Utilisateur'}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 mx-4 my-0" />

      {/* Navigation selon le rôle */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">

        {/* Badge rôle porteur */}
        {utilisateur?.role === 'porteur' && (
          <div className="mx-1 mb-3 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-xs font-semibold text-amber-700">👤 Espace porteur</p>
            <p className="text-[10px] text-amber-600 mt-0.5">Liez votre canne pour commencer</p>
          </div>
        )}

        {menu.map(({ to, label, icon, badge }) => (
          <NavItem key={to} to={to} label={label} icon={icon} hasBadge={badge} />
        ))}
      </nav>

      {/* Illustration nature */}
      <div className="mx-3 mb-3">
        <div className="relative rounded-2xl overflow-hidden h-[100px]"
          style={{ background: 'linear-gradient(160deg, #f0f7f4 0%, #dcede6 100%)' }}>
          <div className="absolute top-3 right-5 w-8 h-8 rounded-full bg-amber-300 opacity-80 blur-[1px]" />
          <div className="absolute top-3.5 right-5.5 w-7 h-7 rounded-full bg-amber-400" />
          <svg viewBox="0 0 220 80" className="absolute bottom-0 left-0 w-full" preserveAspectRatio="none">
            <ellipse cx="55"  cy="90" rx="90"  ry="55" fill="#2d6a4f" opacity="0.55"/>
            <ellipse cx="175" cy="90" rx="80"  ry="50" fill="#265a43" opacity="0.65"/>
            <ellipse cx="110" cy="98" rx="130" ry="48" fill="#214a38" opacity="0.50"/>
          </svg>
          <svg viewBox="0 0 220 80" className="absolute bottom-0 left-0 w-full">
            <rect x="28"  y="48" width="5"  height="25" fill="#1a3a2d"/>
            <ellipse cx="30"  cy="44" rx="11" ry="14" fill="#2d6a4f"/>
            <rect x="168" y="44" width="6"  height="28" fill="#1a3a2d"/>
            <ellipse cx="171" cy="40" rx="13" ry="16" fill="#265a43"/>
          </svg>
          <div className="absolute bottom-2 left-3">
            <p className="text-[9px] font-semibold text-white/80">La sécurité, notre priorité 🌿</p>
          </div>
        </div>
      </div>

      {/* Utilisateur + déconnexion */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-cream-100 transition-colors">
          <div className="w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center text-white font-bold text-xs shadow-amber flex-shrink-0">
            {utilisateur?.prenom?.[0]}{utilisateur?.nom?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
              {utilisateur?.prenom} {utilisateur?.nom}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              <p className="text-[10px] text-gray-400 capitalize">{utilisateur?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors"
            title="Déconnexion">
            <IconLogout />
          </button>
        </div>
      </div>
    </aside>
  )
}

// ─── Icônes SVG ──────────────────────────────────────────────────────────────
function I({ children }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">{children}</svg>
}
function IconDashboard() { return <I><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></I> }
function IconMap()       { return <I><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></I> }
function IconHistory()   { return <I><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></I> }
function IconBell()      { return <I><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></I> }
function IconUsers()     { return <I><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></I> }
function IconZone()      { return <I><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></I> }
function IconUser()      { return <I><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></I> }
function IconNotif()     { return <I><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></I> }
function IconAdmin()     { return <I><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></I> }
function IconCanne()     { return <I><path d="M12 2v20M8 6l4-4 4 4M8 18l4 4 4-4"/></I> }
function IconLogout()    { return <I><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></I> }
