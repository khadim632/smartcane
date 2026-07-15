import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import socket from '../services/socket'

const TYPE_LABEL = { sos:'SOS', chute:'Chute détectée', immobilite:'Immobilité', batterie_faible:'Batterie faible', deconnexion_bluetooth:'Bluetooth déconnecté' }
const TYPE_ICON  = { sos:'🆘', chute:'⚠️', immobilite:'🔒', batterie_faible:'🪫', deconnexion_bluetooth:'📵' }
const TYPE_BG    = { sos:'bg-red-50 border-l-4 border-red-400', chute:'bg-red-50 border-l-4 border-red-400', immobilite:'bg-amber-50 border-l-4 border-amber-400', batterie_faible:'bg-amber-50 border-l-4 border-amber-300', deconnexion_bluetooth:'bg-blue-50 border-l-4 border-blue-300' }
const URGENCE    = (t) => ['sos','chute'].includes(t)?{cls:'badge-urgent',txt:'Urgent'}:['immobilite','batterie_faible'].includes(t)?{cls:'badge-moyen',txt:'Moyen'}:{cls:'badge-faible',txt:'Faible'}

function tempsEcoule(date) {
  const m = Math.floor((Date.now()-new Date(date))/60000)
  if(m<1) return 'À l\'instant'; if(m<60) return `${m} min`
  return `${Math.floor(m/60)}h`
}

export default function Dashboard() {
  const { utilisateur } = useAuth()
  const [canne, setCanne]       = useState(null)
  const [alertes, setAlertes]   = useState([])
  const [position, setPosition] = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/users/mes-cannes').then(r => r.data[0] && setCanne(r.data[0])).catch(()=>{}),
      api.get('/alertes?statut=active&limit=5').then(r => setAlertes(r.data.alertes||[])).catch(()=>{}),
    ]).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!canne) return
    api.get(`/positions/current/${canne.id}`).then(r => setPosition(r.data)).catch(()=>{})
    socket.emit('canne:join', canne.id)
    socket.on('position:update', setPosition)
    socket.on('canne:status', setCanne)
    socket.on('alerte:new', a => setAlertes(p => [a,...p.slice(0,4)]))
    return () => { socket.off('position:update'); socket.off('canne:status'); socket.off('alerte:new') }
  }, [canne?.id])

  const heure = new Date().getHours()
  const salut = heure<12?'Bonjour':heure<18?'Bon après-midi':'Bonsoir'

  return (
    <div className="space-y-4 animate-fade-in">

      {/* En-tête */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">{salut}, {utilisateur?.prenom} 👋</h1>
        <p className="text-gray-400 text-sm mt-0.5">Voici l'état de votre SmartCane</p>
      </div>

      {/* 4 cartes statut — 2x2 sur mobile, 4 colonnes sur desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'État canne',
            value: canne ? (canne.etat_bluetooth==='connecte'?'Connectée':'Déconnectée') : 'Non assignée',
            icon: '🫀',
            bg: canne?.etat_bluetooth==='connecte'?'bg-emerald-50':'bg-red-50',
            color: canne?.etat_bluetooth==='connecte'?'text-emerald-600':'text-red-500'
          },
          {
            label: 'Batterie',
            value: canne?`${canne.niveau_batterie}%`:'—',
            icon: '🔋',
            bg: 'bg-amber-50',
            color: (canne?.niveau_batterie||0)>=50?'text-amber-600':'text-red-500'
          },
          {
            label: 'Alertes',
            value: alertes.length,
            icon: '🔔',
            bg: alertes.length>0?'bg-red-50':'bg-gray-50',
            color: alertes.length>0?'text-red-600':'text-gray-400'
          },
          {
            label: 'Position',
            value: position?'Connue':'Inconnue',
            icon: '📍',
            bg: 'bg-forest-50',
            color: position?'text-forest-600':'text-gray-400'
          }
        ].map(c => (
          <div key={c.label} className="card p-4 flex flex-col gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${c.bg}`}>{c.icon}</div>
            <div>
              <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
              <p className="text-xs text-gray-400">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Actions rapides — grille 2x2 sur mobile */}
      <div className="card p-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Actions rapides</h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon:'📍', label:'Voir la carte',      to:'/carte',        bg:'bg-forest-50',  col:'text-forest-700' },
            { icon:'🔔', label:'Voir les alertes',   to:'/alertes',      bg:'bg-red-50',     col:'text-red-600' },
            { icon:'🕐', label:'Historique GPS',     to:'/historique',   bg:'bg-amber-50',   col:'text-amber-700' },
            { icon:'👥', label:'Mes proches',        to:'/proches',      bg:'bg-blue-50',    col:'text-blue-700' },
          ].map(a => (
            <Link key={a.to} to={a.to}
              className="flex items-center gap-3 p-3 rounded-xl bg-cream-50 hover:bg-cream-100 transition-colors active:scale-95">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${a.bg} flex-shrink-0`}>{a.icon}</div>
              <span className={`text-sm font-medium ${a.col}`}>{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Position GPS */}
      {position && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-soft"/>
              Position en temps réel
            </h2>
            <Link to="/carte" className="text-xs text-forest-600 font-medium">Carte →</Link>
          </div>
          <div className="bg-cream-50 rounded-xl p-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Latitude</span>
              <span className="font-mono text-gray-800 text-xs">{position.latitude?.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Longitude</span>
              <span className="font-mono text-gray-800 text-xs">{position.longitude?.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Mis à jour</span>
              <span className="text-gray-600 text-xs">{tempsEcoule(position.date_position)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Alertes récentes */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Alertes récentes</h2>
          <Link to="/alertes" className="text-xs text-forest-600 font-medium">Voir tout →</Link>
        </div>
        {alertes.length===0 ? (
          <div className="p-6 text-center text-gray-300 text-sm">✅ Aucune alerte active</div>
        ) : (
          <div>
            {alertes.slice(0,3).map(a => {
              const u=URGENCE(a.type)
              return (
                <div key={a.id} className={`flex items-center gap-3 px-4 py-3 ${TYPE_BG[a.type]||''}`}>
                  <span className="text-xl">{TYPE_ICON[a.type]||'🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{TYPE_LABEL[a.type]||a.type}</p>
                    <p className="text-xs text-gray-400">{tempsEcoule(a.date_alerte)}</p>
                  </div>
                  <span className={`${u.cls} flex-shrink-0`}>{u.txt}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
