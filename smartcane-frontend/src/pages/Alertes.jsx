import { useEffect, useState } from 'react'
import api from '../services/api'
import socket from '../services/socket'
import { Empty, Spinner } from '../components/ui'

const TYPE_LABEL = { sos:'SOS', chute:'Chute détectée', immobilite:'Immobilité', batterie_faible:'Batterie faible', deconnexion_bluetooth:'Bluetooth déconnecté' }
const TYPE_ICON  = { sos:'🆘', chute:'⚠️', immobilite:'🔒', batterie_faible:'🪫', deconnexion_bluetooth:'📵' }
const TYPE_BG    = { sos:'bg-red-50', chute:'bg-red-50', immobilite:'bg-amber-50', batterie_faible:'bg-amber-50', deconnexion_bluetooth:'bg-blue-50' }
const TYPE_RING  = { sos:'ring-red-200', chute:'ring-red-200', immobilite:'ring-amber-200', batterie_faible:'ring-amber-200', deconnexion_bluetooth:'ring-blue-200' }
const URGENCE    = (t) => ['sos','chute'].includes(t)?{cls:'badge-urgent',txt:'Urgent'}:['immobilite','batterie_faible'].includes(t)?{cls:'badge-moyen',txt:'Moyen'}:{cls:'badge-faible',txt:'Faible'}

function tempsEcoule(date) {
  const m = Math.floor((Date.now()-new Date(date))/60000)
  if (m<1) return 'À l\'instant'; if (m<60) return `${m} min`
  const h=Math.floor(m/60); return `${h}h${m%60>0?m%60+'min':''}`
}

export default function Alertes() {
  const [alertes, setAlertes]     = useState([])
  const [filtre, setFiltre]       = useState('active')
  const [loading, setLoading]     = useState(true)
  const [total, setTotal]         = useState(0)

  async function charger() {
    setLoading(true)
    try {
      const {data} = await api.get(`/alertes?statut=${filtre}&limit=20`)
      setAlertes(data.alertes||[])
      setTotal(data.total||0)
    } catch {}
    setLoading(false)
  }

  useEffect(()=>{charger()},[filtre])
  useEffect(()=>{
    socket.on('alerte:new', a=>{ if(filtre==='active') setAlertes(p=>[a,...p]); setTotal(t=>t+1) })
    return ()=>socket.off('alerte:new')
  },[filtre])

  async function traiter(id) {
    try { await api.put(`/alertes/${id}`,{statut:'traitee'}); setAlertes(p=>p.filter(a=>a.id!==id)); setTotal(t=>t-1) } catch {}
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Alertes</h1>
          <p className="page-subtitle">Incidents détectés par la canne</p>
        </div>
        <div className="flex bg-cream-200 rounded-xl p-1 gap-1">
          {[{id:'active',label:'Actives'},{id:'traitee',label:'Traitées'}].map(f=>(
            <button key={f.id} onClick={()=>setFiltre(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filtre===f.id?'bg-white shadow text-gray-900':'text-gray-500 hover:text-gray-700'}`}>
              {f.label} {filtre===f.id && <span className="ml-1 text-xs text-gray-400">({total})</span>}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card p-16 flex items-center justify-center"><Spinner size="lg" /></div>
      ) : alertes.length===0 ? (
        <div className="card">
          <Empty icon={filtre==='active'?'✅':'📋'}
            title={filtre==='active'?'Aucune alerte active':'Aucune alerte traitée'}
            description={filtre==='active'?'Tout semble normal. Vous serez notifié en cas de problème.':'Les alertes traitées apparaîtront ici.'} />
        </div>
      ) : (
        <div className="space-y-3">
          {alertes.map(a=>{
            const u=URGENCE(a.type)
            return (
              <div key={a.id} className={`card overflow-hidden flex`}>
                <div className={`w-1.5 flex-shrink-0 ${['sos','chute'].includes(a.type)?'bg-red-400':['immobilite','batterie_faible'].includes(a.type)?'bg-amber-400':'bg-blue-400'}`}/>
                <div className="flex items-center gap-4 px-5 py-4 flex-1">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ring-2 ${TYPE_BG[a.type]||'bg-gray-50'} ${TYPE_RING[a.type]||'ring-gray-200'}`}>
                    {TYPE_ICON[a.type]||'🔔'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-gray-900">{TYPE_LABEL[a.type]||a.type}</p>
                      <span className={u.cls}>{u.txt}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Il y a {tempsEcoule(a.date_alerte)}
                      {a.latitude?` · 📍 ${a.latitude.toFixed(4)}, ${a.longitude.toFixed(4)}`:''}
                    </p>
                    {a.message&&<p className="text-xs text-gray-400 mt-1 italic">"{a.message}"</p>}
                  </div>
                  {filtre==='active' && (
                    <button onClick={()=>traiter(a.id)} className="btn-secondary btn-sm flex-shrink-0">
                      ✓ Traiter
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
