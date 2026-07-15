import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function I({ children }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      {children}
    </svg>
  )
}
const IconHome    = () => <I><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></I>
const IconMap     = () => <I><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></I>
const IconBell    = () => <I><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></I>
const IconUsers   = () => <I><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></I>
const IconUser    = () => <I><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></I>
const IconAdmin   = () => <I><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></I>
const IconCanne   = () => <I><line x1="12" y1="2" x2="12" y2="22"/><path d="M8 6l4-4 4 4"/><path d="M8 18l4 4 4-4"/></I>
const IconHistory = () => <I><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></I>

const TABS_PROCHE = [
  { to: '/dashboard',  label: 'Accueil',     Icon: IconHome },
  { to: '/carte',      label: 'Carte',       Icon: IconMap },
  { to: '/alertes',    label: 'Alertes',     Icon: IconBell },
  { to: '/proches',    label: 'Proches',     Icon: IconUsers },
  { to: '/profil',     label: 'Profil',      Icon: IconUser },
]

const TABS_PORTEUR = [
  { to: '/ma-canne',   label: 'Ma canne',    Icon: IconCanne },
  { to: '/profil',     label: 'Profil',      Icon: IconUser },
]

const TABS_ADMIN = [
  { to: '/dashboard',  label: 'Accueil',     Icon: IconHome },
  { to: '/carte',      label: 'Carte',       Icon: IconMap },
  { to: '/alertes',    label: 'Alertes',     Icon: IconBell },
  { to: '/admin',      label: 'Admin',       Icon: IconAdmin },
  { to: '/profil',     label: 'Profil',      Icon: IconUser },
]

export default function BottomNav() {
  const { utilisateur } = useAuth()

  const tabs = utilisateur?.role === 'admin'
    ? TABS_ADMIN
    : utilisateur?.role === 'porteur'
    ? TABS_PORTEUR
    : TABS_PROCHE

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-large md:hidden">
      <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
        {tabs.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                isActive ? 'text-forest-600' : 'text-gray-400 hover:text-gray-600'
              }`
            }>
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-forest-50' : ''}`}>
                  <Icon />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-forest-700' : 'text-gray-400'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
