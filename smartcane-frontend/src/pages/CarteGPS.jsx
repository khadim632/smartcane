import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import api from '../services/api'
import socket from '../services/socket'
import { BatteryBar, Spinner } from '../components/ui'

const icone = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25,41], iconAnchor: [12,41], popupAnchor: [1,-34]
})

function Centrer({ pos }) {
  const map = useMap()
  useEffect(() => { if (pos) map.setView([pos.latitude, pos.longitude], map.getZoom()) }, [pos])
  return null
}

export default function CarteGPS() {
  const [cannes, setCannes]     = useState([])
  const [canneId, setCanneId]   = useState(null)
  const [canne, setCanne]       = useState(null)
  const [position, setPosition] = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get('/users/mes-cannes').then(r => {
      setCannes(r.data)
      if (r.data[0]) setCanneId(r.data[0].id)
    }).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  useEffect(() => {
    if (!canneId) return
    api.get(`/cannes/${canneId}`).then(r=>setCanne(r.data)).catch(()=>{})
    api.get(`/positions/current/${canneId}`).then(r=>setPosition(r.data)).catch(()=>{})
    socket.emit('canne:join', canneId)
    socket.on('position:update', setPosition)
    socket.on('canne:status', setCanne)
    return () => { socket.off('position:update'); socket.off('canne:status') }
  }, [canneId])

  const centre = [14.6937, -17.4441]

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Carte GPS</h1>
          <p className="page-subtitle">Position en temps réel de la canne</p>
        </div>
        {cannes.length > 1 && (
          <select className="input w-auto" value={canneId} onChange={e=>setCanneId(Number(e.target.value))}>
            {cannes.map(c=><option key={c.id} value={c.id}>{c.numero_serie}</option>)}
          </select>
        )}
      </div>

      {/* Infos canne */}
      {canne && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label:'Numéro de série', val:<span className="font-mono text-sm font-semibold">{canne.numero_serie}</span> },
            { label:'Batterie', val:<BatteryBar level={canne.niveau_batterie} /> },
            { label:'Bluetooth', val:
              <span className={`badge ${canne.etat_bluetooth==='connecte'?'badge-green':'badge-red'}`}>
                {canne.etat_bluetooth==='connecte'?'● Connecté':'● Déconnecté'}
              </span>
            },
          ].map(({label,val})=>(
            <div key={label} className="card p-4">
              <p className="text-xs text-gray-400 mb-1.5">{label}</p>
              {val}
            </div>
          ))}
        </div>
      )}

      {/* Carte */}
      <div className="card overflow-hidden" style={{height:'480px'}}>
        {loading ? (
          <div className="h-full flex items-center justify-center"><Spinner size="lg" /></div>
        ) : (
          <MapContainer
            center={position ? [position.latitude, position.longitude] : centre}
            zoom={15} style={{height:'100%', width:'100%'}}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {position && (
              <>
                <Centrer pos={position} />
                <Marker position={[position.latitude, position.longitude]} icon={icone}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold mb-1">📍 Position de la canne</p>
                      <p className="text-gray-600 font-mono text-xs">{position.latitude?.toFixed(6)}, {position.longitude?.toFixed(6)}</p>
                      <p className="text-gray-400 text-xs mt-1">{new Date(position.date_position).toLocaleString('fr-FR')}</p>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}
          </MapContainer>
        )}
      </div>

      {position && (
        <p className="text-xs text-gray-400 text-right">
          Dernière mise à jour : {new Date(position.date_position).toLocaleString('fr-FR')}
        </p>
      )}
    </div>
  )
}
