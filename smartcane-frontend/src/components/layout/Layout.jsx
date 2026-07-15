import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Spinner } from '../ui'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

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
  '/ma-canne':      'Ma canne',
}

const PAGES_PORTEUR = ['/ma-canne', '/profil']
const PAGES_PROCHE  = ['/dashboard', '/carte', '/historique', '/alertes', '/proches', '/geofences', '/notifications', '/profil']
const PAGES_ADMIN   = [...PAGES_PROCHE, '/admin', '/ma-canne']

export default function Layout() {
  const { utilisateur, chargement } = useAuth()
  const location = useLocation()
  const titre = PAGE_TITLES[location.pathname] || 'SmartCane'

  if (chargement) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Spinner size="lg" />
          <p className="text-sm text-gray-400 font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!utilisateur) return <Navigate to="/login" replace />

  const pagesAutorisees = utilisateur.role === 'admin'
    ? PAGES_ADMIN
    : utilisateur.role === 'porteur'
    ? PAGES_PORTEUR
    : PAGES_PROCHE

  if (!pagesAutorisees.includes(location.pathname)) {
    return <Navigate to={utilisateur.role === 'porteur' ? '/ma-canne' : '/dashboard'} replace />
  }

  return (
    <div className="flex min-h-screen bg-cream-100">
      {/* Sidebar desktop uniquement */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-soft">
          <div className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4">
            {/* Logo mobile */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-8 h-8 rounded-xl bg-forest-600 flex items-center justify-center shadow-forest">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" className="w-4 h-4">
                  <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7z"/>
                  <circle cx="12" cy="9" r="2.5" fill="white" stroke="none"/>
                </svg>
              </div>
              <span className="font-bold text-gray-900 text-sm">SmartCane</span>
            </div>
            {/* Titre desktop */}
            <div className="hidden md:block">
              <h1 className="text-[15px] font-semibold text-gray-900">{titre}</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
              </p>
            </div>
            {/* Titre centré mobile */}
            <div className="md:hidden absolute left-1/2 -translate-x-1/2">
              <h1 className="text-base font-semibold text-gray-900">{titre}</h1>
            </div>
            {/* Avatar */}
            <div className="flex items-center gap-2">
              <button className="relative w-9 h-9 rounded-xl hover:bg-cream-200 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-gray-500">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
              <div className="w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center text-white font-bold text-xs shadow-amber">
                {utilisateur?.prenom?.[0]}{utilisateur?.nom?.[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Contenu — pb-24 sur mobile pour la bottom nav */}
        <main className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Navigation bas mobile */}
      <BottomNav />
    </div>
  )
}
