import { Routes, Route, Navigate } from 'react-router-dom'
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

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reclamer" element={<ReclamerCanne />} />

      <Route element={<Layout />}>
        <Route path="/dashboard"     element={<Dashboard />} />
        <Route path="/carte"         element={<CarteGPS />} />
        <Route path="/historique"    element={<Historique />} />
        <Route path="/alertes"       element={<Alertes />} />
        <Route path="/proches"       element={<Proches />} />
        <Route path="/geofences"     element={<Geofences />} />
        <Route path="/profil"        element={<Profil />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/admin"         element={<Admin />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
