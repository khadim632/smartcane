import { useEffect, useState } from 'react'
import api from '../services/api'
import { Avatar, Toggle, Empty, AlertBanner, Spinner, Modal } from '../components/ui'

const S_BADGE = { en_attente:'badge-amber', accepte:'badge-green', refuse:'badge-red' }
const S_LABEL = { en_attente:'En attente', accepte:'Accepté', refuse:'Refusé' }

export default function Proches() {
  const [onglet, setOnglet] = useState('liste')
  const [suivis, setSuivis] = useState([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail]   = useState('')
  const [critere, setCritere] = useState('')
  const [porteurTrouve, setPorteurTrouve] = useState(null)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')
  const [envoi, setEnvoi]   = useState(false)

  async function charger() {
    setLoading(true)
    try { const {data}=await api.get('/suivis'); setSuivis(data) } catch {}
    setLoading(false)
  }
  useEffect(()=>{ charger() },[])

  async function inviter(e) {
    e.preventDefault(); setErreur(''); setSucces(''); setEnvoi(true)
    try { await api.post('/suivis',{proche_email:email}); setEmail(''); setSucces('Invitation envoyée !'); charger() }
    catch(err){ setErreur(err.response?.data?.message||'Erreur') }
    setEnvoi(false)
  }

  async function rechercher(e) {
    e.preventDefault(); setErreur(''); setPorteurTrouve(null); setEnvoi(true)
    try { const {data}=await api.get(`/cannes/rechercher-porteur?critere=${encodeURIComponent(critere)}`); setPorteurTrouve(data) }
    catch(err){ setErreur(err.response?.data?.message||'Aucun porteur trouvé') }
    setEnvoi(false)
  }

  async function inviterTrouve() {
    try {
      await api.post('/suivis',{proche_email:porteurTrouve.porteur.email})
      setSucces(`Invitation envoyée à ${porteurTrouve.porteur.prenom} !`)
      setPorteurTrouve(null); setCritere(''); charger()
    } catch(err){ setErreur(err.response?.data?.message||'Erreur') }
  }

  async function modifierStatut(id,statut){ try{ await api.put(`/suivis/${id}`,{statut}); charger() }catch{} }
  async function modifierPerm(id,champ,val){ try{ await api.put(`/suivis/${id}`,{[champ]:val}); charger() }catch{} }
  async function supprimer(id){ if(!confirm('Supprimer ce lien ?'))return; try{ await api.delete(`/suivis/${id}`); charger() }catch{} }

  const ONGLETS=[{id:'liste',label:`Mes liens (${suivis.length})`},{id:'inviter',label:'Inviter'},{id:'rechercher',label:'Rechercher'}]

  return (
    <div className="space-y-5 animate-slide-up">
      <div><h1 className="page-title">Proches</h1><p className="page-subtitle">Gérez qui peut suivre la canne</p></div>

      <div className="flex gap-1 bg-cream-200 rounded-xl p-1 w-fit">
        {ONGLETS.map(o=>(
          <button key={o.id} onClick={()=>{setOnglet(o.id);setErreur('');setSucces('')}}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${onglet===o.id?'bg-white shadow text-gray-900':'text-gray-500 hover:text-gray-700'}`}>
            {o.label}
          </button>
        ))}
      </div>

      {onglet==='liste' && (
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center"><Spinner size="lg"/></div>
          ) : suivis.length===0 ? (
            <Empty icon="👥" title="Aucun lien" description="Invitez un proche pour partager le suivi de la canne."
              action={<button onClick={()=>setOnglet('inviter')} className="btn-primary btn-sm">Inviter un proche</button>}/>
          ) : (
            <div className="divide-y divide-gray-50">
              {suivis.map(s=>{
                const p=s.proche||s.porteur
                return (
                  <div key={s.id} className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar nom={p?.nom} prenom={p?.prenom} size="md"/>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{p?.prenom} {p?.nom}</p>
                          <p className="text-xs text-gray-400">{p?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={S_BADGE[s.statut]}>{S_LABEL[s.statut]}</span>
                        {s.statut==='en_attente' && <button onClick={()=>modifierStatut(s.id,'accepte')} className="btn-secondary btn-sm">Accepter</button>}
                        <button onClick={()=>supprimer(s.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors">✕</button>
                      </div>
                    </div>
                    {s.statut==='accepte' && (
                      <div className="flex gap-6 pl-[52px] mt-2">
                        {[{c:'voir_position',l:'Voir position'},{c:'voir_historique',l:'Voir historique'},{c:'recevoir_alertes',l:'Recevoir alertes'}].map(({c,l})=>(
                          <Toggle key={c} checked={s[c]} onChange={v=>modifierPerm(s.id,c,v)} label={l}/>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {onglet==='inviter' && (
        <div className="card p-6 max-w-lg space-y-4">
          <div><h2 className="font-semibold text-gray-900">Inviter par email</h2><p className="text-sm text-gray-400 mt-0.5">Le proche doit déjà avoir un compte SmartCane.</p></div>
          <form onSubmit={inviter} className="space-y-3">
            <div><label className="label">Email du proche</label>
              <input type="email" className="input" placeholder="proche@exemple.com" value={email} onChange={e=>setEmail(e.target.value)} required/>
            </div>
            {erreur && <AlertBanner type="error" message={erreur} onClose={()=>setErreur('')}/>}
            {succes && <AlertBanner type="success" message={succes} onClose={()=>setSucces('')}/>}
            <button type="submit" disabled={envoi} className="btn-primary">{envoi?<Spinner size="sm" color="white"/>:null} Envoyer l'invitation</button>
          </form>
        </div>
      )}

      {onglet==='rechercher' && (
        <div className="space-y-4 max-w-lg">
          <div className="card p-6 space-y-4">
            <div><h2 className="font-semibold text-gray-900">Rechercher un porteur</h2><p className="text-sm text-gray-400 mt-0.5">Par numéro de série, email ou téléphone.</p></div>
            <form onSubmit={rechercher} className="space-y-3">
              <div><label className="label">Critère de recherche</label>
                <input className="input" placeholder="SC-2024-001 · email@exemple.com · +221 77..." value={critere} onChange={e=>setCritere(e.target.value)} required/>
              </div>
              {erreur && <AlertBanner type="error" message={erreur} onClose={()=>setErreur('')}/>}
              {succes && <AlertBanner type="success" message={succes} onClose={()=>setSucces('')}/>}
              <button type="submit" disabled={envoi} className="btn-primary">{envoi?'Recherche...':'🔍 Rechercher'}</button>
            </form>
          </div>
          {porteurTrouve && (
            <div className="card p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar nom={porteurTrouve.porteur.nom} prenom={porteurTrouve.porteur.prenom} size="md" color="forest"/>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{porteurTrouve.porteur.prenom} {porteurTrouve.porteur.nom}</p>
                  <p className="text-xs text-gray-400">{porteurTrouve.porteur.email}</p>
                  <span className="badge badge-gray text-[10px] mt-1">via {porteurTrouve.via==='numero_serie'?'numéro de série':porteurTrouve.via}</span>
                </div>
              </div>
              <button onClick={inviterTrouve} className="btn-primary btn-sm">Suivre</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
