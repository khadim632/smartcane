import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../api'
import Radar from '../components/Radar'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [email, setEmail] = useState(params.get('email') || '')
  const [token] = useState(params.get('token') || '')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setErreur('')
    setChargement(true)
    try {
      await authApi.resetPassword({ email, token, nouveau_mot_de_passe: motDePasse })
      navigate('/login')
    } catch (err) {
      setErreur(err.response?.data?.message || 'Lien invalide ou expiré')
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
        <p className="auth-shell__tagline">Choisis un nouveau mot de passe pour ton compte.</p>
      </div>
      <div className="auth-shell__form-wrap">
        <div className="auth-card">
          <h1>Nouveau mot de passe</h1>
          {erreur && <div className="error-text">{erreur}</div>}
          <form onSubmit={onSubmit}>
            <div className="field">
              <label>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label>Nouveau mot de passe</label>
              <input type="password" required minLength={6} value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} />
            </div>
            <button className="btn btn--primary btn--block" disabled={chargement}>
              {chargement ? 'Enregistrement…' : 'Réinitialiser'}
            </button>
          </form>
          <div className="auth-card__foot">
            <Link to="/login">Retour à la connexion</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
