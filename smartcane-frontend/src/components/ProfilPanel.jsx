import { useState } from 'react'
import { userApi } from '../api'
import { useAuth } from '../context/AuthContext'

export default function ProfilPanel() {
  const { utilisateur, updateUtilisateur } = useAuth()
  const [form, setForm] = useState({ nom: utilisateur?.nom || '', prenom: utilisateur?.prenom || '', telephone: '' })
  const [motDePasse, setMotDePasse] = useState({ ancien: '', nouveau: '' })
  const [message, setMessage] = useState('')

  async function enregistrer(e) {
    e.preventDefault()
    const { data } = await userApi.modifierProfil(form)
    updateUtilisateur(data)
    setMessage('Profil mis à jour')
  }

  async function changerMdp(e) {
    e.preventDefault()
    setMessage('')
    try {
      await userApi.changerMotDePasse({ ancien_mot_de_passe: motDePasse.ancien, nouveau_mot_de_passe: motDePasse.nouveau })
      setMotDePasse({ ancien: '', nouveau: '' })
      setMessage('Mot de passe modifié')
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur')
    }
  }

  return (
    <div className="grid grid--2">
      <div className="card">
        <h3>Informations personnelles</h3>
        {message && <div className="notice-text">{message}</div>}
        <form onSubmit={enregistrer}>
          <div className="field"><label>Prénom</label><input value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} /></div>
          <div className="field"><label>Nom</label><input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} /></div>
          <div className="field"><label>Téléphone</label><input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} /></div>
          <button className="btn btn--primary">Enregistrer</button>
        </form>
      </div>
      <div className="card">
        <h3>Changer de mot de passe</h3>
        <form onSubmit={changerMdp}>
          <div className="field"><label>Ancien mot de passe</label><input type="password" value={motDePasse.ancien} onChange={(e) => setMotDePasse({ ...motDePasse, ancien: e.target.value })} /></div>
          <div className="field"><label>Nouveau mot de passe</label><input type="password" minLength={6} value={motDePasse.nouveau} onChange={(e) => setMotDePasse({ ...motDePasse, nouveau: e.target.value })} /></div>
          <button className="btn btn--primary">Modifier</button>
        </form>
      </div>
    </div>
  )
}
