import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AlertBanner, Spinner } from '../components/ui'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', mot_de_passe: '' })
  const [erreur, setErreur] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErreur('')
    setLoading(true)
    try {
      await login(form.email, form.mot_de_passe)
      navigate('/dashboard')
    } catch (err) {
      setErreur(err.response?.data?.message || 'Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Panneau gauche — Illustration */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col"
        style={{ background: 'linear-gradient(150deg, #f0f7f4 0%, #dcede6 40%, #bcddd0 100%)' }}>

        {/* Éléments décoratifs */}
        <div className="absolute top-12 right-16 w-24 h-24 rounded-full bg-amber-300/60 blur-md" />
        <div className="absolute top-14 right-18 w-16 h-16 rounded-full bg-amber-400/80" />

        {/* Collines */}
        <svg viewBox="0 0 400 220" className="absolute bottom-0 left-0 w-full" preserveAspectRatio="none">
          <ellipse cx="120" cy="250" rx="180" ry="120" fill="#2d6a4f" opacity="0.5"/>
          <ellipse cx="320" cy="250" rx="160" ry="110" fill="#265a43" opacity="0.6"/>
          <ellipse cx="210" cy="270" rx="250" ry="105" fill="#214a38" opacity="0.45"/>
        </svg>
        {/* Arbres */}
        <svg viewBox="0 0 400 220" className="absolute bottom-0 left-0 w-full">
          <rect x="60"  y="170" width="9"  height="50" fill="#1a3a2d"/>
          <ellipse cx="64"  cy="162" rx="22" ry="28" fill="#2d6a4f"/>
          <rect x="310" y="165" width="10" height="55" fill="#1a3a2d"/>
          <ellipse cx="315" cy="156" rx="25" ry="32" fill="#265a43"/>
          <rect x="185" y="178" width="7"  height="42" fill="#1a3a2d"/>
          <ellipse cx="188" cy="172" rx="18" ry="22" fill="#2d6a4f" opacity="0.9"/>
        </svg>

        {/* Contenu texte */}
        <div className="relative z-10 flex flex-col h-full px-12 pt-16">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-11 h-11 rounded-2xl bg-forest-600 shadow-forest flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" className="w-6 h-6">
                <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7z"/>
                <circle cx="12" cy="9" r="2.5" fill="white" stroke="none"/>
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-800">SmartCane</span>
          </div>

          <div className="flex-1">
            <h2 className="text-4xl font-bold text-gray-800 leading-snug mb-4">
              La sécurité,<br />notre priorité 🌿
            </h2>
            <p className="text-gray-600 text-base leading-relaxed max-w-sm">
              Suivez vos proches en temps réel, recevez des alertes instantanées et restez connectés où qu'ils soient.
            </p>

            <div className="mt-10 space-y-4">
              {[
                { icon: '📍', title: 'GPS temps réel', desc: 'Position mise à jour en continu' },
                { icon: '🔔', title: 'Alertes instantanées', desc: 'SOS, chute, sortie de zone...' },
                { icon: '👥', title: 'Multi-proches', desc: 'Partagez le suivi avec votre famille' },
              ].map(f => (
                <div key={f.title} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center text-lg flex-shrink-0">{f.icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{f.title}</p>
                    <p className="text-xs text-gray-500">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Panneau droit — Formulaire */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-[380px]">

          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-forest-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" className="w-5 h-5">
                <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <span className="font-bold text-gray-900">SmartCane</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Bienvenue 👋</h1>
            <p className="text-gray-400 text-sm mt-1">Connectez-vous pour accéder à votre espace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Adresse email</label>
              <input type="email" className="input" placeholder="vous@exemple.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required autoFocus />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="label mb-0">Mot de passe</label>
                <Link to="/forgot-password" className="text-xs text-forest-600 hover:text-forest-700 font-medium">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} className="input pr-10" placeholder="••••••••"
                  value={form.mot_de_passe} onChange={e => setForm({ ...form, mot_de_passe: e.target.value })} required />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-sm">
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {erreur && <AlertBanner type="error" message={erreur} onClose={() => setErreur('')} />}

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 text-[15px] mt-2">
              {loading ? <><Spinner size="sm" color="white" /> Connexion...</> : 'Se connecter'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400">Nouveau sur SmartCane ?</span>
            </div>
          </div>

          <Link to="/register"
            className="btn-secondary w-full py-3 text-[15px] text-center block">
            Créer un compte
          </Link>

          <p className="text-center text-xs text-gray-300 mt-8">
            © 2024 SmartCane — Canne connectée intelligente
          </p>
        </div>
      </div>
    </div>
  )
}
