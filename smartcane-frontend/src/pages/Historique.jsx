import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet'
import api from '../services/api'
import { Spinner, Empty } from '../components/ui'

export default function Historique() {
  const [cannes, setCannes]       = useState([])
  const [canneId, setCanneId]     = useState(null)
  const [positions, setPositions] = useState([])
  const [filtres, setFiltres]     = useState({ debut:'', fin:'' })
  const [loading, setLoading]     = useState(false)
  const [meta, setMeta]           = useState({ total:0 })

  useEffect(()=>{
    api.get('/users/mes-cannes').then(r=>{ setCannes(r.data); if(r.data[0]) setCanneId(r.data[0].id) }).catch(()=>{})
  },[])

  useEffect(()=>{ if(canneId) charger() },[canneId])

  async function charger() {
    if(!canneId) return
    setLoading(true)
    try {
      const p = new URLSearchParams({ limit:100 })
      if(filtres.debut) p.append('debut', filtres.debut)
      if(filtres.fin)   p.append('fin',   filtres.fin)
      const {data} = await api.get(`/positions/history/${canneId}?${p}`)
      setPositions(data.positions||[])
      setMeta({ total: data.total||0 })
    } catch {} finally { setLoading(false) }
  }

  const lignes  = positions.map(p=>[p.latitude, p.longitude])
  const centre  = positions.length>0 ? [positions[0].latitude, positions[0].longitude] : [14.6937,-17.4441]

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Historique GPS</h1><p className="page-subtitle">{meta.total} position{meta.total>1?'s':''} enregistrée{meta.total>1?'s':''}</p></div>
        {cannes.length>1 && (
          <select className="input w-auto" value={canneId||''} onChange={e=>setCanneId(Number(e.target.value))}>
            {cannes.map(c=><option key={c.id} value={c.id}>{c.numero_serie}</option>)}
          </select>
        )}
      </div>

      {/* Filtres */}
      <div className="card p-5 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="label">Début</label>
          <input type="datetime-local" className="input" value={filtres.debut} onChange={e=>setFiltres({...filtres,debut:e.target.value})}/>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="label">Fin</label>
          <input type="datetime-local" className="input" value={filtres.fin} onChange={e=>setFiltres({...filtres,fin:e.target.value})}/>
        </div>
        <button onClick={charger} className="btn-primary">Filtrer</button>
        <button onClick={()=>{ setFiltres({debut:'',fin:''}); setTimeout(charger,50) }} className="btn-secondary">Réinitialiser</button>
      </div>

      {/* Carte */}
      <div className="card overflow-hidden" style={{height:'360px'}}>
        {loading ? (
          <div className="h-full flex items-center justify-center"><Spinner size="lg"/></div>
        ) : (
          <MapContainer center={centre} zoom={14} style={{height:'100%',width:'100%'}}>
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            {lignes.length>1 && <Polyline positions={lignes} color="#2d6a4f" weight={3} opacity={0.8}/>}
            {positions.length>0 && <Marker position={[positions[0].latitude, positions[0].longitude]}/>}
          </MapContainer>
        )}
      </div>

      {/* Tableau */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Détail des positions</h2>
        </div>
        {positions.length===0 ? (
          <Empty icon="🗺️" title="Aucune position" description="Aucune position pour cette période."/>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-50 border-b border-gray-100">
                <tr>{['Date & heure','Latitude','Longitude','Altitude'].map(h=><th key={h} className="table-header">{h}</th>)}</tr>
              </thead>
              <tbody>
                {positions.map(p=>(
                  <tr key={p.id} className="table-row">
                    <td className="table-cell text-gray-600">{new Date(p.date_position).toLocaleString('fr-FR')}</td>
                    <td className="table-cell font-mono text-gray-800">{p.latitude?.toFixed(6)}</td>
                    <td className="table-cell font-mono text-gray-800">{p.longitude?.toFixed(6)}</td>
                    <td className="table-cell text-gray-500">{p.altitude?`${p.altitude}m`:'—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
