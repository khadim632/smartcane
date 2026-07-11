import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Avatar, BatteryBar, AlertBanner, Spinner, Empty, Modal, StatCard } from '../components/ui'

export default function Admin() {
  const { utilisateur } = useAuth()
  const [onglet, setOnglet] = useState('stats')
  if(utilisateur?.role!=='admin') return <Navigate to="/dashboard" replace/>

  const ONGLETS=[{id:'stats',icon:'📊',label:'Statistiques'},{id:'cannes',icon:'🦯',label:'Cannes'},{id:'porteurs',icon:'🧑',label:'Créer porteur'},{id:'users',icon:'👥',label:'Utilisateurs'}]

  return (
    <div className="space-y-5 animate-slide-up">
      <div><h1 className="page-title">Administration</h1><p className="page-subtitle">Gestion globale de la plateforme SmartCane</p></div>
      <div className="flex gap-1 bg-cream-200 rounded-xl p-1 w-fit">
        {ONGLETS.map(o=>(
          <button key={o.id} onClick={()=>setOnglet(o.id)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${onglet===o.id?'bg-white shadow text-gray-900':'text-gray-500 hover:text-gray-700'}`}>
            <span>{o.icon}</span>{o.label}
          </button>
        ))}
      </div>
      {onglet==='stats'    && <TabStats/>}
      {onglet==='cannes'   && <TabCannes/>}
      {onglet==='porteurs' && <TabPorteurs/>}
      {onglet==='users'    && <TabUsers/>}
    </div>
  )
}

function TabStats() {
  const [stats,setStats]=useState(null)
  useEffect(()=>{ api.get('/admin/stats').then(r=>setStats(r.data)).catch(()=>{}) },[])
  if(!stats) return <div className="card p-12 flex justify-center"><Spinner size="lg"/></div>
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard label="Utilisateurs total"  value={stats.total}          icon="👥" iconBg="bg-forest-50"  valueColor="text-forest-700"/>
      <StatCard label="Porteurs"            value={stats.porteurs}        icon="🧑" iconBg="bg-amber-50"   valueColor="text-amber-600"/>
      <StatCard label="Proches"             value={stats.proches}         icon="👨‍👩‍👧" iconBg="bg-cream-200"  valueColor="text-gray-700"/>
      <StatCard label="Cannes disponibles"  value={stats.dispo}           icon="🦯" iconBg="bg-emerald-50" valueColor="text-emerald-700"/>
      <StatCard label="Cannes vendues"      value={stats.vendues}         icon="✅" iconBg="bg-forest-50"  valueColor="text-forest-700"/>
      <StatCard label="Alertes actives"     value={stats.alertesActives}  icon="🔔" iconBg="bg-red-50"     valueColor="text-red-600"/>
    </div>
  )
}

function TabCannes() {
  const [cannes,setCannes]     = useState([])
  const [filtre,setFiltre]     = useState('tout')
  const [porteurs,setPorteurs] = useState([])
  const [loading,setLoading]   = useState(true)
  const [showForm,setShowForm] = useState(false)
  const [form,setForm]         = useState({numero_serie:'',porteur_id:''})
  const [erreur,setErreur]     = useState('')
  const [qrModal,setQrModal]   = useState(null)
  const [editModal,setEditModal] = useState(null)
  const [formEdit,setFormEdit] = useState({numero_serie:'',porteur_id:''})

  async function charger() {
    setLoading(true)
    const url=filtre==='tout'?'/admin/cannes':`/admin/cannes?statut=${filtre}`
    try{ const {data}=await api.get(url); setCannes(data) }catch{}
    try{ const {data}=await api.get('/admin/users?role=porteur'); setPorteurs(data) }catch{}
    setLoading(false)
  }
  useEffect(()=>{ charger() },[filtre])

  async function creer(e) {
    e.preventDefault(); setErreur('')
    try{ await api.post('/admin/cannes',{numero_serie:form.numero_serie,porteur_id:form.porteur_id||null}); setForm({numero_serie:'',porteur_id:''}); setShowForm(false); charger() }
    catch(err){ setErreur(err.response?.data?.message||'Erreur') }
  }
  async function afficherQr(id){ try{ const {data}=await api.get(`/admin/cannes/qr/${id}`); setQrModal(data) }catch{} }
  async function sauvegarderEdit(e) {
    e.preventDefault()
    try{ await api.put(`/admin/cannes/${editModal.id}`,{...formEdit,porteur_id:formEdit.porteur_id||null}); setEditModal(null); charger() }catch{}
  }
  async function supprimer(id){ if(!confirm('Supprimer ?'))return; await api.delete(`/admin/cannes/${id}`); charger() }

  const counts={tout:cannes.length,disponible:cannes.filter(c=>c.statut==='disponible').length,vendue:cannes.filter(c=>c.statut==='vendue').length}

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-cream-200 rounded-xl p-1">
          {[{id:'tout',l:'Toutes'},{id:'disponible',l:'Disponibles'},{id:'vendue',l:'Vendues'}].map(f=>(
            <button key={f.id} onClick={()=>setFiltre(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filtre===f.id?'bg-white shadow text-gray-900':'text-gray-500 hover:text-gray-700'}`}>
              {f.l} ({counts[f.id]||0})
            </button>
          ))}
        </div>
        <button onClick={()=>{setShowForm(!showForm);setErreur('')}} className="btn-primary btn-sm">{showForm?'✕ Annuler':'+ Nouvelle canne'}</button>
      </div>

      {showForm && (
        <div className="card p-5 border-2 border-forest-100">
          <h3 className="font-semibold text-gray-900 mb-4">Enregistrer une nouvelle canne</h3>
          <form onSubmit={creer} className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Numéro de série *</label>
              <input className="input" placeholder="SC-2024-001" value={form.numero_serie} onChange={e=>setForm({...form,numero_serie:e.target.value})} required/>
              <p className="text-xs text-gray-400 mt-1">Un QR code est généré automatiquement.</p>
            </div>
            <div><label className="label">Porteur <span className="text-gray-400">(optionnel)</span></label>
              <select className="input" value={form.porteur_id} onChange={e=>setForm({...form,porteur_id:e.target.value})}>
                <option value="">— Non assignée (disponible) —</option>
                {porteurs.map(p=><option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
              </select>
            </div>
            {erreur && <div className="sm:col-span-2"><AlertBanner type="error" message={erreur} onClose={()=>setErreur('')}/></div>}
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">✓ Enregistrer</button>
              <button type="button" className="btn-secondary" onClick={()=>setShowForm(false)}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? <div className="p-10 flex justify-center"><Spinner size="lg"/></div>
        : cannes.length===0 ? <Empty icon="🦯" title="Aucune canne" description="Créez une canne pour commencer."/>
        : (
          <table className="w-full text-sm">
            <thead className="bg-cream-50 border-b border-gray-100">
              <tr>{['Numéro de série','Statut','Porteur','Batterie','Bluetooth','Actions'].map(h=><th key={h} className="table-header">{h}</th>)}</tr>
            </thead>
            <tbody>
              {cannes.map(c=>(
                <tr key={c.id} className="table-row">
                  <td className="table-cell"><span className="font-mono font-semibold text-gray-900">{c.numero_serie}</span></td>
                  <td className="table-cell"><span className={c.statut==='disponible'?'badge-green':'badge-forest'}>{c.statut==='disponible'?'Disponible':'Vendue'}</span></td>
                  <td className="table-cell">
                    {c.porteur ? (
                      <div className="flex items-center gap-2">
                        <Avatar nom={c.porteur.nom} prenom={c.porteur.prenom} size="xs"/>
                        <div><p className="font-medium text-gray-800 text-xs">{c.porteur.prenom} {c.porteur.nom}</p><p className="text-gray-400 text-xs">{c.porteur.email}</p></div>
                      </div>
                    ) : <span className="text-gray-300 text-xs italic">Non assignée</span>}
                  </td>
                  <td className="table-cell"><BatteryBar level={c.niveau_batterie}/></td>
                  <td className="table-cell"><span className={c.etat_bluetooth==='connecte'?'badge-green':'badge-red'}>{c.etat_bluetooth==='connecte'?'Connecté':'Déconnecté'}</span></td>
                  <td className="table-cell">
                    <div className="flex gap-3">
                      <button onClick={()=>afficherQr(c.id)} className="text-xs text-forest-600 hover:text-forest-800 font-medium">QR</button>
                      <button onClick={()=>{setEditModal(c);setFormEdit({numero_serie:c.numero_serie,porteur_id:c.porteur_id||''})}} className="text-xs text-gray-500 hover:text-gray-700 font-medium">Modifier</button>
                      <button onClick={()=>supprimer(c.id)} className="text-xs text-red-400 hover:text-red-600 font-medium">Suppr.</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={!!qrModal} onClose={()=>setQrModal(null)} title={`QR Code — ${qrModal?.numero_serie}`} size="sm">
        <div className="text-center space-y-4">
          <img src={qrModal?.qrCode} alt="QR" className="mx-auto w-52 h-52 rounded-2xl"/>
          <p className="text-xs text-gray-400">Le porteur scanne ce code pour lier la canne à son compte.</p>
          <a href={qrModal?.qrCode} download={`qr-${qrModal?.numero_serie}.png`} className="btn-primary inline-flex">⬇ Télécharger</a>
        </div>
      </Modal>

      <Modal open={!!editModal} onClose={()=>setEditModal(null)} title="Modifier la canne">
        <form onSubmit={sauvegarderEdit} className="space-y-4">
          <div><label className="label">Numéro de série</label><input className="input" value={formEdit.numero_serie} onChange={e=>setFormEdit({...formEdit,numero_serie:e.target.value})} required/></div>
          <div><label className="label">Porteur <span className="text-gray-400">(optionnel)</span></label>
            <select className="input" value={formEdit.porteur_id} onChange={e=>setFormEdit({...formEdit,porteur_id:e.target.value})}>
              <option value="">— Aucun (remettre disponible) —</option>
              {porteurs.map(p=><option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2"><button type="submit" className="btn-primary flex-1">Sauvegarder</button><button type="button" className="btn-secondary" onClick={()=>setEditModal(null)}>Annuler</button></div>
        </form>
      </Modal>
    </div>
  )
}

function TabPorteurs() {
  const [cannesDispo,setCannesDispo] = useState([])
  const [form,setForm] = useState({nom:'',prenom:'',email:'',mot_de_passe:'',telephone:'',canne_id:''})
  const [erreur,setErreur] = useState('')
  const [succes,setSucces] = useState('')
  const [loading,setLoading] = useState(false)

  useEffect(()=>{ api.get('/admin/cannes?statut=disponible').then(r=>setCannesDispo(r.data)).catch(()=>{}) },[])

  async function creerPorteur(e) {
    e.preventDefault(); setErreur(''); setSucces(''); setLoading(true)
    try {
      const {data}=await api.post('/admin/porteurs',{...form,canne_id:form.canne_id||null})
      setSucces(`✅ Compte créé pour ${data.porteur.prenom} ${data.porteur.nom}${data.canne?` · Canne ${data.canne.numero_serie} assignée`:''}`)
      setForm({nom:'',prenom:'',email:'',mot_de_passe:'',telephone:'',canne_id:''})
    } catch(err){ setErreur(err.response?.data?.message||'Erreur') }
    setLoading(false)
  }

  return (
    <div className="space-y-5 max-w-xl">
      <div className="card p-6 space-y-5">
        <div><h2 className="font-semibold text-gray-900">Créer un compte porteur</h2><p className="text-sm text-gray-400 mt-0.5">L'admin crée le compte et assigne directement une canne disponible.</p></div>
        <form onSubmit={creerPorteur} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Prénom *</label><input className="input" value={form.prenom} onChange={e=>setForm({...form,prenom:e.target.value})} required/></div>
            <div><label className="label">Nom *</label><input className="input" value={form.nom} onChange={e=>setForm({...form,nom:e.target.value})} required/></div>
          </div>
          <div><label className="label">Email *</label><input type="email" className="input" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></div>
          <div><label className="label">Téléphone</label><input className="input" placeholder="+221 77 000 00 00" value={form.telephone} onChange={e=>setForm({...form,telephone:e.target.value})}/></div>
          <div><label className="label">Mot de passe temporaire *</label><input type="password" className="input" value={form.mot_de_passe} onChange={e=>setForm({...form,mot_de_passe:e.target.value})} required/></div>
          <div>
            <label className="label">Assigner une canne disponible <span className="text-gray-400">(optionnel)</span></label>
            <select className="input" value={form.canne_id} onChange={e=>setForm({...form,canne_id:e.target.value})}>
              <option value="">— Aucune pour l'instant —</option>
              {cannesDispo.map(c=><option key={c.id} value={c.id}>🦯 {c.numero_serie}</option>)}
            </select>
            {cannesDispo.length===0 && <p className="text-xs text-amber-500 mt-1">Aucune canne disponible — créez-en une dans l'onglet Cannes.</p>}
          </div>
          {erreur && <AlertBanner type="error"   message={erreur} onClose={()=>setErreur('')}/>}
          {succes && <AlertBanner type="success" message={succes} onClose={()=>setSucces('')}/>}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading?<Spinner size="sm" color="white"/>:null} Créer le compte porteur</button>
        </form>
      </div>

      <div className="card p-5 bg-cream-50">
        <p className="text-sm font-semibold text-gray-800 mb-3">💡 Deux façons d'associer une canne</p>
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex gap-2"><span className="w-5 h-5 bg-forest-100 text-forest-700 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0">1</span><p><strong className="text-gray-700">Admin crée le compte</strong> — ici, en assignant la canne directement</p></div>
          <div className="flex gap-2"><span className="w-5 h-5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0">2</span><p><strong className="text-gray-700">Porteur s'inscrit seul</strong> — puis scanne le QR code de sa canne sur /reclamer</p></div>
        </div>
      </div>
    </div>
  )
}

function TabUsers() {
  const [users,setUsers]   = useState([])
  const [loading,setLoading] = useState(true)

  async function charger(){ setLoading(true); try{ const {data}=await api.get('/admin/users'); setUsers(data) }catch{}; setLoading(false) }
  useEffect(()=>{ charger() },[])
  async function changerRole(id,role){ await api.put(`/admin/users/${id}`,{role}); charger() }
  async function supprimer(id){ if(!confirm('Supprimer ?'))return; await api.delete(`/admin/users/${id}`); charger() }

  return (
    <div className="card overflow-hidden">
      {loading ? <div className="p-10 flex justify-center"><Spinner size="lg"/></div>
      : users.length===0 ? <Empty icon="👥" title="Aucun utilisateur"/>
      : (
        <table className="w-full text-sm">
          <thead className="bg-cream-50 border-b border-gray-100">
            <tr>{['Utilisateur','Email','Téléphone','Rôle','Depuis','Actions'].map(h=><th key={h} className="table-header">{h}</th>)}</tr>
          </thead>
          <tbody>
            {users.map(u=>(
              <tr key={u.id} className="table-row">
                <td className="table-cell"><div className="flex items-center gap-3"><Avatar nom={u.nom} prenom={u.prenom} size="sm"/><span className="font-medium text-gray-900">{u.prenom} {u.nom}</span></div></td>
                <td className="table-cell text-gray-500">{u.email}</td>
                <td className="table-cell text-gray-400">{u.telephone||'—'}</td>
                <td className="table-cell">
                  <select value={u.role} onChange={e=>changerRole(u.id,e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-forest-400">
                    <option value="porteur">Porteur</option>
                    <option value="proche">Proche</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="table-cell text-xs text-gray-400">{new Date(u.date_creation).toLocaleDateString('fr-FR')}</td>
                <td className="table-cell"><button onClick={()=>supprimer(u.id)} className="text-xs text-red-400 hover:text-red-600 font-medium">Suppr.</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
