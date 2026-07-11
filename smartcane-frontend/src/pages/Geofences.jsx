import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Circle, Marker } from 'react-leaflet'
import api from '../services/api'
import { Toggle, Empty, AlertBanner, Spinner } from '../components/ui'

export default function Geofences() {
  const [geofences, setGeofences] = useState([])
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState({ nom:'', latitude_centre:'', longitude_centre:'', rayon_metres:200 })
  const [erreur, setErreur]       = useState('')
  const [loading, setLoading]     = useState(true)

  async function charger() {
    setLoading(true)
    try { const {data}=await api.get('/geofences'); setGeofences(data) } catch {}
    setLoading(false)
  }
  useEffect(()=>{ charger() },[])

  async function creer(e) {
    e.preventDefault(); setErreur('')
    try { await api.post('/geofences',form); setForm({nom:'',latitude_centre:'',longitude_centre:'',rayon_metres:200}); setShowForm(false); charger() }
    catch(err){ setErreur(err.response?.data?.message||'Erreur') }
  }
  async function basculer(id,actif){ try{ await api.put(`/geofences/${id}`,{actif:!actif}); charger() }catch{} }
  async function supprimer(id){ if(!confirm('Supprimer ?'))return; try{ await api.delete(`/geofences/${id}`); charger() }catch{} }

  const centre = [14.6937,-17.4441]

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Géofencing</h1><p className="page-subtitle">Zones de sécurité — alerte si la canne en sort</p></div>
        <button onClick={()=>setShowForm(!showForm)} className="btn-primary">{showForm?'✕ Annuler':'+ Nouvelle zone'}</button>
      </div>

      {showForm && (
        <div className="card p-6 border-2 border-forest-100 space-y-4">
          <h3 className="font-semibold text-gray-900">Définir une nouvelle zone</h3>
          <form onSubmit={creer} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className="label">Nom de la zone</label>
              <input className="input" placeholder="Ex : Maison, École..." value={form.nom} onChange={e=>setForm({...form,nom:e.target.value})} required/>
            </div>
            <div><label className="label">Latitude</label>
              <input type="number" step="any" className="input" placeholder="14.6937" value={form.latitude_centre} onChange={e=>setForm({...form,latitude_centre:e.target.value})} required/>
            </div>
            <div><label className="label">Longitude</label>
              <input type="number" step="any" className="input" placeholder="-17.4441" value={form.longitude_centre} onChange={e=>setForm({...form,longitude_centre:e.target.value})} required/>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Rayon : <strong>{form.rayon_metres}m</strong></label>
              <input type="range" min="50" max="2000" step="50" value={form.rayon_metres}
                onChange={e=>setForm({...form,rayon_metres:parseInt(e.target.value)})} className="w-full accent-forest-600"/>
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>50m</span><span>2000m</span></div>
            </div>
            {erreur && <div className="sm:col-span-2"><AlertBanner type="error" message={erreur} onClose={()=>setErreur('')}/></div>}
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">✓ Créer la zone</button>
              <button type="button" className="btn-secondary" onClick={()=>setShowForm(false)}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden" style={{height:'340px'}}>
        <MapContainer center={centre} zoom={13} style={{height:'100%',width:'100%'}}>
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
          {geofences.filter(g=>g.actif).map(g=>(
            <Circle key={g.id} center={[g.latitude_centre,g.longitude_centre]} radius={g.rayon_metres}
              pathOptions={{color:'#2d6a4f',fillColor:'#3a8a73',fillOpacity:0.15,weight:2}}>
              <Marker position={[g.latitude_centre,g.longitude_centre]}/>
            </Circle>
          ))}
        </MapContainer>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Zones configurées ({geofences.length})</h2>
        </div>
        {loading ? <div className="p-10 flex justify-center"><Spinner size="lg"/></div>
        : geofences.length===0 ? <Empty icon="📐" title="Aucune zone" description="Créez une zone pour être alerté si la canne en sort."/>
        : (
          <div className="divide-y divide-gray-50">
            {geofences.map(g=>(
              <div key={g.id} className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${g.actif?'bg-forest-50':'bg-gray-50'}`}>
                    <span className="text-lg">📐</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{g.nom}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Rayon {g.rayon_metres}m · {parseFloat(g.latitude_centre).toFixed(4)}, {parseFloat(g.longitude_centre).toFixed(4)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Toggle checked={g.actif} onChange={()=>basculer(g.id,g.actif)}/>
                  <button onClick={()=>supprimer(g.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors text-sm">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
