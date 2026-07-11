import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import socket from '../services/socket'
import { StatCard, BatteryBar, Empty, Spinner } from '../components/ui'

const TYPE_LABEL = { sos:'SOS', chute:'Chute détectée', immobilite:'Immobilité', batterie_faible:'Batterie faible', deconnexion_bluetooth:'Bluetooth déconnecté' }
const TYPE_ICON  = { sos:'🆘', chute:'⚠️', immobilite:'🔒', batterie_faible:'🪫', deconnexion_bluetooth:'📵' }
const TYPE_BG    = { sos:'bg-red-50 border-l-4 border-red-400', chute:'bg-red-50 border-l-4 border-red-400', immobilite:'bg-amber-50 border-l-4 border-amber-400', batterie_faible:'bg-amber-50 border-l-4 border-amber-300', deconnexion_bluetooth:'bg-blue-50 border-l-4 border-blue-300' }
const URGENCE    = (t) => ['sos','chute'].includes(t) ? {cls:'badge-urgent',txt:'Urgent'} : ['immobilite','batterie_faible'].includes(t) ? {cls:'badge-moyen',txt:'Moyen'} : {cls:'badge-faible',txt:'Faible'}

function tempsEcoule(date) {
  const diff = Date.now() - new Date(date)
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'À l\'instant'
  if (min < 60) return `Il y a ${min} min`
  const h = Math.floor(min / 60)
  return `Il y a ${h}h`
}

export default function Dashboard() {
  const { utilisateur } = useAuth()
  const [canne, setCanne]         = useState(null)
  const [alertes, setAlertes]     = useState([])
  const [position, setPosition]   = useState(null)
  const [notifs, setNotifs]       = useState({ non_lues: 0 })
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/users/mes-cannes').then(r => r.data[0] && setCanne(r.data[0])).catch(()=>{}),
      api.get('/alertes?statut=active&limit=5').then(r => setAlertes(r.data.alertes || [])).catch(()=>{}),
      api.get('/notifications?non_lues=true&limit=1').then(r => setNotifs(r.data)).catch(()=>{}),
    ]).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!canne) return
    api.get(`/positions/current/${canne.id}`).then(r => setPosition(r.data)).catch(() => {})
    socket.emit('canne:join', canne.id)
    socket.on('position:update', setPosition)
    socket.on('canne:status', setCanne)
    socket.on('alerte:new', a => setAlertes(p => [a, ...p.slice(0,4)]))
    return () => { socket.off('position:update'); socket.off('canne:status'); socket.off('alerte:new') }
  }, [canne?.id])

  const heure = new Date().getHours()
  const salut = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir'

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Spinner size="lg" />
    </div>
  )

  return (
    <div className="space-y-7 animate-slide-up">

      {/* En-tête */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{salut}, {utilisateur?.prenom} 👋</h1>
          <p className="text-gray-400 text-sm mt-1">Voici ce qui se passe avec votre SmartCane.</p>
        </div>
        {notifs.non_lues > 0 && (
          <Link to="/notifications"
            className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 font-medium hover:bg-amber-100 transition-colors">
            <span className="w-5 h-5 bg-amber-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{notifs.non_lues}</span>
            nouvelle{notifs.non_lues > 1 ? 's' : ''} notification{notifs.non_lues > 1 ? 's' : ''}
          </Link>
        )}
      </div>

      {/* 4 cartes statut */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="État de la canne"
          value={canne ? (canne.etat_bluetooth === 'connecte' ? 'Connectée' : 'Déconnectée') : 'Non assignée'}
          icon="🫀"
          iconBg={canne?.etat_bluetooth === 'connecte' ? 'bg-emerald-50' : 'bg-red-50'}
          valueColor={canne?.etat_bluetooth === 'connecte' ? 'text-emerald-600' : 'text-red-500'}
          sub={canne?.numero_serie || '—'}
        />
        <StatCard
          label="Niveau batterie"
          value={canne ? `${canne.niveau_batterie}%` : '—'}
          icon="🔋"
          iconBg="bg-amber-50"
          valueColor={canne?.niveau_batterie >= 50 ? 'text-amber-600' : 'text-red-500'}
          sub={canne?.niveau_batterie >= 50 ? 'Charge suffisante' : 'Charge faible'}
        />
        <StatCard
          label="Alertes actives"
          value={alertes.length}
          icon="🔔"
          iconBg={alertes.length > 0 ? 'bg-red-50' : 'bg-gray-50'}
          valueColor={alertes.length > 0 ? 'text-red-600' : 'text-gray-400'}
          sub={alertes.length > 0 ? 'Action requise' : 'Tout va bien'}
        />
        <StatCard
          label="Dernière position"
          value={position ? 'Connue' : 'Inconnue'}
          icon="📍"
          iconBg="bg-forest-50"
          valueColor={position ? 'text-forest-600' : 'text-gray-400'}
          sub={position ? tempsEcoule(position.date_position) : '—'}
        />
      </div>

      {/* Ligne 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Position GPS */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-soft" />
              <h2 className="font-semibold text-gray-800 text-sm">Localisation en temps réel</h2>
            </div>
            <Link to="/carte" className="text-xs text-forest-600 font-medium hover:text-forest-700 flex items-center gap-1">
              Voir la carte →
            </Link>
          </div>
          <div className="relative bg-gradient-to-br from-cream-100 to-cream-200" style={{height:'200px'}}>
            {position ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-forest-100 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-forest-200 flex items-center justify-center">
                      <span className="text-2xl">📍</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-forest-300/40 animate-ping" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-800 text-sm">Position enregistrée</p>
                  <p className="text-xs font-mono text-gray-500 mt-1">
                    {position.latitude?.toFixed(5)}, {position.longitude?.toFixed(5)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{tempsEcoule(position.date_position)}</p>
                </div>
                <Link to="/carte" className="btn-primary btn-sm">Ouvrir la carte</Link>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Empty icon="🗺️" title="Aucune position disponible"
                  description="La canne n'a pas encore envoyé sa position."
                  action={<Link to="/carte" className="btn-secondary btn-sm">Voir la carte</Link>} />
              </div>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 text-sm mb-4">Actions rapides</h2>
          <div className="space-y-2">
            {[
              { icon:'📞', label:"Appeler un proche",      bg:'bg-forest-50',  col:'text-forest-700', to:'/proches' },
              { icon:'👥', label:"Gérer les proches",      bg:'bg-amber-50',   col:'text-amber-700',  to:'/proches' },
              { icon:'🕐', label:"Voir l'historique",      bg:'bg-cream-200',  col:'text-gray-700',   to:'/historique' },
              { icon:'📐', label:"Configurer une zone",    bg:'bg-blue-50',    col:'text-blue-700',   to:'/geofences' },
              { icon:'⚙️', label:"Paramètres du profil",  bg:'bg-gray-50',    col:'text-gray-600',   to:'/profil' },
            ].map(a => (
              <Link key={a.to+a.label} to={a.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-cream-100 transition-colors group">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${a.bg} flex-shrink-0`}>{a.icon}</div>
                <span className={`text-sm font-medium ${a.col}`}>{a.label}</span>
                <span className="ml-auto text-gray-300 group-hover:text-gray-400 transition-colors">›</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Alertes récentes */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 text-sm">Alertes récentes</h2>
          <Link to="/alertes" className="text-xs text-forest-600 font-medium hover:text-forest-700">Voir tout →</Link>
        </div>
        {alertes.length === 0 ? (
          <Empty icon="✅" title="Aucune alerte active" description="Tout semble normal pour le moment." />
        ) : (
          <div>
            {alertes.map(a => {
              const u = URGENCE(a.type)
              return (
                <div key={a.id} className={`flex items-center gap-4 px-6 py-4 ${TYPE_BG[a.type] || ''}`}>
                  <div className="w-9 h-9 rounded-xl bg-white/80 flex items-center justify-center text-lg flex-shrink-0 shadow-soft">
                    {TYPE_ICON[a.type] || '🔔'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{TYPE_LABEL[a.type] || a.type}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {tempsEcoule(a.date_alerte)}
                      {a.latitude ? ` · 📍 ${a.latitude.toFixed(3)}, ${a.longitude.toFixed(3)}` : ''}
                    </p>
                  </div>
                  <span className={u.cls}>{u.txt}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
