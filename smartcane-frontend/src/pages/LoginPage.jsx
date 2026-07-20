import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Radar from '../components/Radar'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setErreur('')
    setChargement(true)
    try {
      await login(email, motDePasse)
      navigate('/dashboard')
    } catch (err) {
      setErreur(err.response?.data?.message || 'Connexion impossible')
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
          Chaque signal compte. Suivez la position, les alertes et l'état de la canne en un seul endroit.
        </p>
      </div>
      <div className="auth-shell__form-wrap">
        <div className="auth-card">
          <h1>Connexion</h1>
          <p className="auth-card__sub">Accédez à votre tableau de bord SmartCane.</p>

          {erreur && <div className="error-text">{erreur}</div>}

          <form onSubmit={onSubmit}>
            <div className="field">
              <label>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="toi@exemple.com" />
            </div>
            <div className="field">
              <label>Mot de passe</label>
              <input type="password" required value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} placeholder="••••••••" />
            </div>
            <button className="btn btn--primary btn--block" disabled={chargement}>
              {chargement ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <div className="auth-card__foot">
            <Link to="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
          </div>
          <div className="auth-card__foot">
            Pas de compte ? <Link to="/inscription">Créer un compte</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
