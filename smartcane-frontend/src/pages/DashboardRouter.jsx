import { useAuth } from '../context/AuthContext'
import PorteurDashboard from './PorteurDashboard'
import ProcheDashboard from './ProcheDashboard'
import AdminDashboard from './AdminDashboard'

export default function DashboardRouter() {
  const { utilisateur } = useAuth()
  if (utilisateur?.role === 'porteur') return <PorteurDashboard />
  if (utilisateur?.role === 'admin') return <AdminDashboard />
  return <ProcheDashboard />
}
