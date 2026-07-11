import { useEffect, useState } from 'react'
import api from '../services/api'
import { Empty, Spinner } from '../components/ui'

export default function Notifications() {
  const [notifs, setNotifs]   = useState([])
  const [meta, setMeta]       = useState({ total:0, non_lues:0 })
  const [loading, setLoading] = useState(true)

  async function charger() {
    setLoading(true)
    try { const {data}=await api.get('/notifications?limit=30'); setNotifs(data.notifications||[]); setMeta(data) } catch {}
    setLoading(false)
  }
  useEffect(()=>{ charger() },[])

  async function marquerLue(id) {
    try { await api.put(`/notifications/${id}/lire`); charger() } catch {}
  }
  async function toutLire() {
    try { await api.put('/notifications/lire-tout'); charger() } catch {}
  }

  return (
    <div className="space-y-5 animate-slide-up max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{meta.non_lues} non lue{meta.non_lues>1?'s':''}</p>
        </div>
        {meta.non_lues>0 && <button onClick={toutLire} className="btn-secondary btn-sm">Tout marquer comme lu</button>}
      </div>

      {loading ? (
        <div className="card p-12 flex justify-center"><Spinner size="lg"/></div>
      ) : notifs.length===0 ? (
        <div className="card"><Empty icon="🔔" title="Aucune notification" description="Vous serez notifié ici lors d'alertes ou d'événements importants."/></div>
      ) : (
        <div className="card overflow-hidden divide-y divide-gray-50">
          {notifs.map(n=>(
            <div key={n.id} className={`flex items-start gap-4 px-5 py-4 transition-colors ${!n.lu?'bg-forest-50/50':''}`}>
              <div className={`w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0 ${!n.lu?'bg-forest-500':'bg-transparent'}`}/>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.lu?'font-semibold text-gray-900':'text-gray-600'}`}>{n.titre||'Notification'}</p>
                <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-300 mt-1">{new Date(n.date_creation).toLocaleString('fr-FR')}</p>
              </div>
              {!n.lu && (
                <button onClick={()=>marquerLue(n.id)} className="btn-ghost btn-sm flex-shrink-0 text-xs">Marquer lu</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
