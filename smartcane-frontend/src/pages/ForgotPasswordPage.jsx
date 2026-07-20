import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../api'
import Radar from '../components/Radar'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [envoye, setEnvoye] = useState(false)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setChargement(true)
    setErreur('')
    try {
      await authApi.forgotPassword(email)
      setEnvoye(true)
    } catch (err) {
      setErreur(err.response?.data?.message || 'Une erreur est survenue')
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
        <p className="auth-shell__tagline">Un lien de réinitialisation valable 30 minutes te sera envoyé par email.</p>
      </div>
      <div className="auth-shell__form-wrap">
        <div className="auth-card">
          <h1>Mot de passe oublié</h1>
          <p className="auth-card__sub">Indique ton email pour recevoir un lien de réinitialisation.</p>

          {erreur && <div className="error-text">{erreur}</div>}
          {envoye ? (
            <div className="notice-text">Si ce compte existe, un email de réinitialisation a été envoyé.</div>
          ) : (
            <form onSubmit={onSubmit}>
              <div className="field">
                <label>Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <button className="btn btn--primary btn--block" disabled={chargement}>
                {chargement ? 'Envoi…' : 'Envoyer le lien'}
              </button>
            </form>
          )}

          <div className="auth-card__foot">
            <Link to="/login">Retour à la connexion</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
