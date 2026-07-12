import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Login         from './pages/Login'
import Register      from './pages/Register'
import Dashboard     from './pages/Dashboard'
import CarteGPS      from './pages/CarteGPS'
import Historique    from './pages/Historique'
import Alertes       from './pages/Alertes'
import Proches       from './pages/Proches'
import Geofences     from './pages/Geofences'
import Profil        from './pages/Profil'
import Notifications from './pages/Notifications'
import Admin         from './pages/Admin'
import ReclamerCanne from './pages/ReclamerCanne'
import MaCanne       from './pages/MaCanne'

function RedirectParRole() {
  const { utilisateur } = useAuth()
  if (!utilisateur) return <Navigate to="/login" replace />
  if (utilisateur.role === 'porteur') return <Navigate to="/ma-canne" replace />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Pages publiques */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reclamer" element={<ReclamerCanne />} />

      {/* Pages protégées */}
      <Route element={<Layout />}>
        {/* Porteur */}
        <Route path="/ma-canne"      element={<MaCanne />} />

        {/* Proche + Admin */}
        <Route path="/dashboard"     element={<Dashboard />} />
        <Route path="/carte"         element={<CarteGPS />} />
        <Route path="/historique"    element={<Historique />} />
        <Route path="/alertes"       element={<Alertes />} />
        <Route path="/proches"       element={<Proches />} />
        <Route path="/geofences"     element={<Geofences />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* Commun */}
        <Route path="/profil"        element={<Profil />} />

        {/* Admin seulement */}
        <Route path="/admin"         element={<Admin />} />
      </Route>

      {/* Redirection par défaut selon le rôle */}
      <Route path="*" element={<RedirectParRole />} />
    </Routes>
  )
}
