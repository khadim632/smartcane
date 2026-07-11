import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Spinner } from '../ui'
import Sidebar from './Sidebar'

const PAGE_TITLES = {
  '/dashboard':     'Tableau de bord',
  '/carte':         'Carte GPS',
  '/historique':    'Historique GPS',
  '/alertes':       'Alertes',
  '/proches':       'Proches',
  '/geofences':     'Géofencing',
  '/profil':        'Mon profil',
  '/notifications': 'Notifications',
  '/admin':         'Administration',
}

export default function Layout() {
  const { utilisateur, chargement } = useAuth()
  const location = useLocation()
  const titre = PAGE_TITLES[location.pathname] || 'SmartCane'

  if (chargement) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Spinner size="lg" />
          <p className="text-sm text-gray-400 font-medium">Chargement de SmartCane...</p>
        </div>
      </div>
    )
  }

  if (!utilisateur) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-screen bg-cream-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-8 py-4 flex items-center justify-between shadow-soft">
          <div>
            <h1 className="text-[15px] font-semibold text-gray-900">{titre}</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Cloche */}
            <button className="relative w-9 h-9 rounded-xl hover:bg-cream-200 flex items-center justify-center transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-gray-500">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            {/* Séparateur */}
            <div className="w-px h-6 bg-gray-200" />

            {/* Utilisateur */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center text-white font-bold text-xs shadow-amber">
                {utilisateur?.prenom?.[0]}{utilisateur?.nom?.[0]}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 leading-tight">{utilisateur?.prenom} {utilisateur?.nom}</p>
                <p className="text-[10px] text-gray-400 capitalize leading-tight">{utilisateur?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu */}
        <main className="flex-1 overflow-auto p-8">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
