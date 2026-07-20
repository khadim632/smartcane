import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api'
import Radar from '../components/Radar'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', mot_de_passe: '', role: 'proche' })
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })) }

  async function onSubmit(e) {
    e.preventDefault()
    setErreur('')
    setChargement(true)
    try {
      await authApi.register(form)
      navigate('/login')
    } catch (err) {
      setErreur(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Inscription impossible')
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-shell__side">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, zIndex: 1 }}>
          <Radar state="ok" size="lg" />
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>SmartCane</strong>
        </div>
        <p className="auth-shell__tagline">
          Un compte "Porteur" reçoit sa canne connectée. Un compte "Proche" suit un porteur avec son accord.
        </p>
      </div>
      <div className="auth-shell__form-wrap">
        <div className="auth-card">
          <h1>Créer un compte</h1>
          <p className="auth-card__sub">Quelques informations pour démarrer.</p>

          {erreur && <div className="error-text">{erreur}</div>}

          <form onSubmit={onSubmit}>
            <div className="field field--row">
              <div className="field" style={{ flex: 1 }}>
                <label>Prénom</label>
                <input required value={form.prenom} onChange={(e) => set('prenom', e.target.value)} />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>Nom</label>
                <input required value={form.nom} onChange={(e) => set('nom', e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div className="field">
              <label>Téléphone</label>
              <input value={form.telephone} onChange={(e) => set('telephone', e.target.value)} />
            </div>
            <div className="field">
              <label>Mot de passe (min. 6 caractères)</label>
              <input type="password" required minLength={6} value={form.mot_de_passe} onChange={(e) => set('mot_de_passe', e.target.value)} />
            </div>
            <div className="field">
              <label>Je suis</label>
              <select value={form.role} onChange={(e) => set('role', e.target.value)}>
                <option value="proche">Un proche qui suit un porteur</option>
                <option value="porteur">Le porteur d'une canne SmartCane</option>
              </select>
            </div>
            <button className="btn btn--primary btn--block" disabled={chargement}>
              {chargement ? 'Création…' : 'Créer mon compte'}
            </button>
          </form>

          <div className="auth-card__foot">
            Déjà inscrit ? <Link to="/login">Se connecter</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
