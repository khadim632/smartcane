import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Avatar, AlertBanner, Spinner } from '../components/ui'

const ROLE_LABEL = { porteur:'Porteur de canne', proche:'Proche', admin:'Administrateur' }
const ROLE_BADGE = { porteur:'badge-forest', proche:'badge-blue', admin:'badge-red' }

export default function Profil() {
  const { utilisateur, setUtilisateur } = useAuth()
  const [form, setForm]   = useState({ nom:utilisateur?.nom||'', prenom:utilisateur?.prenom||'', telephone:utilisateur?.telephone||'' })
  const [pwdForm, setPwdForm] = useState({ ancien:'', nouveau:'' })
  const [onglet, setOnglet]   = useState('infos')
  const [succes, setSucces]   = useState('')
  const [erreur, setErreur]   = useState('')
  const [loading, setLoading] = useState(false)

  async function sauvegarder(e) {
    e.preventDefault(); setSucces(''); setErreur(''); setLoading(true)
    try {
      const {data} = await api.put('/users/me', form)
      setUtilisateur(data); setSucces('Profil mis à jour avec succès')
    } catch(err){ setErreur(err.response?.data?.message||'Erreur') }
    setLoading(false)
  }

  async function changerMdp(e) {
    e.preventDefault(); setSucces(''); setErreur(''); setLoading(true)
    try {
      await api.put('/users/change-password',{ ancien_mot_de_passe:pwdForm.ancien, nouveau_mot_de_passe:pwdForm.nouveau })
      setSucces('Mot de passe modifié'); setPwdForm({ancien:'',nouveau:''})
    } catch(err){ setErreur(err.response?.data?.message||'Erreur') }
    setLoading(false)
  }

  return (
    <div className="space-y-5 animate-slide-up max-w-2xl">
      <div><h1 className="page-title">Mon profil</h1><p className="page-subtitle">Gérez vos informations personnelles</p></div>

      {/* Carte identité */}
      <div className="card p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-400 flex items-center justify-center text-white font-bold text-2xl shadow-amber">
          {utilisateur?.prenom?.[0]}{utilisateur?.nom?.[0]}
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold text-gray-900">{utilisateur?.prenom} {utilisateur?.nom}</p>
          <p className="text-sm text-gray-400">{utilisateur?.email}</p>
          <span className={`${ROLE_BADGE[utilisateur?.role]||'badge-gray'} mt-2 inline-flex`}>{ROLE_LABEL[utilisateur?.role]||utilisateur?.role}</span>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-cream-200 rounded-xl p-1 w-fit">
        {[{id:'infos',label:'Informations'},{id:'securite',label:'Mot de passe'}].map(o=>(
          <button key={o.id} onClick={()=>{setOnglet(o.id);setSucces('');setErreur('')}}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${onglet===o.id?'bg-white shadow text-gray-900':'text-gray-500 hover:text-gray-700'}`}>
            {o.label}
          </button>
        ))}
      </div>

      {onglet==='infos' && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Modifier mes informations</h2>
          <form onSubmit={sauvegarder} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Prénom</label><input className="input" value={form.prenom} onChange={e=>setForm({...form,prenom:e.target.value})} required/></div>
              <div><label className="label">Nom</label><input className="input" value={form.nom} onChange={e=>setForm({...form,nom:e.target.value})} required/></div>
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input bg-cream-100 text-gray-400 cursor-not-allowed" value={utilisateur?.email} disabled/>
              <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié ici.</p>
            </div>
            <div><label className="label">Téléphone</label><input className="input" placeholder="+221 77 000 00 00" value={form.telephone} onChange={e=>setForm({...form,telephone:e.target.value})}/></div>
            {succes && <AlertBanner type="success" message={succes} onClose={()=>setSucces('')}/>}
            {erreur && <AlertBanner type="error"   message={erreur} onClose={()=>setErreur('')}/>}
            <button type="submit" disabled={loading} className="btn-primary">{loading?<Spinner size="sm" color="white"/>:null} Sauvegarder</button>
          </form>
        </div>
      )}

      {onglet==='securite' && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Changer le mot de passe</h2>
          <form onSubmit={changerMdp} className="space-y-4">
            <div><label className="label">Mot de passe actuel</label><input type="password" className="input" value={pwdForm.ancien} onChange={e=>setPwdForm({...pwdForm,ancien:e.target.value})} required/></div>
            <div><label className="label">Nouveau mot de passe</label><input type="password" className="input" placeholder="Minimum 6 caractères" value={pwdForm.nouveau} onChange={e=>setPwdForm({...pwdForm,nouveau:e.target.value})} required/></div>
            {succes && <AlertBanner type="success" message={succes} onClose={()=>setSucces('')}/>}
            {erreur && <AlertBanner type="error"   message={erreur} onClose={()=>setErreur('')}/>}
            <button type="submit" disabled={loading} className="btn-primary">{loading?<Spinner size="sm" color="white"/>:null} Modifier le mot de passe</button>
          </form>
        </div>
      )}
    </div>
  )
}
