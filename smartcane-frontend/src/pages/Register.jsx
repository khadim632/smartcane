import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { AlertBanner, Spinner } from '../components/ui'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm]   = useState({ nom:'', prenom:'', email:'', mot_de_passe:'', role:'proche' })
  const [erreur, setErreur] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault(); setErreur(''); setLoading(true)
    try { await api.post('/auth/register', form); navigate('/login?registered=1') }
    catch (err) { setErreur(err.response?.data?.message || "Erreur lors de l'inscription") }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-forest-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-forest">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" className="w-7 h-7">
              <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7z"/>
              <circle cx="12" cy="9" r="2.5" fill="white" stroke="none"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
          <p className="text-gray-400 text-sm mt-1">Rejoignez SmartCane gratuitement</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Prénom</label>
                <input className="input" placeholder="Awa" value={form.prenom}
                  onChange={e => setForm({...form, prenom:e.target.value})} required />
              </div>
              <div>
                <label className="label">Nom</label>
                <input className="input" placeholder="Diop" value={form.nom}
                  onChange={e => setForm({...form, nom:e.target.value})} required />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="vous@exemple.com" value={form.email}
                onChange={e => setForm({...form, email:e.target.value})} required />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input type="password" className="input" placeholder="Minimum 6 caractères" value={form.mot_de_passe}
                onChange={e => setForm({...form, mot_de_passe:e.target.value})} required />
            </div>
            <div>
              <label className="label">Je suis...</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val:'proche',  label:'Un proche',  icon:'👥', desc:'Je veux suivre quelqu\'un' },
                  { val:'porteur', label:'Un porteur', icon:'🦯', desc:'J\'utilise la canne' },
                ].map(r => (
                  <button type="button" key={r.val} onClick={() => setForm({...form, role:r.val})}
                    className={`p-3 rounded-xl border-2 text-left transition-all duration-150 ${
                      form.role===r.val
                        ? 'border-forest-500 bg-forest-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                    <div className="text-lg mb-1">{r.icon}</div>
                    <p className={`text-sm font-semibold ${form.role===r.val ? 'text-forest-700':'text-gray-700'}`}>{r.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {erreur && <AlertBanner type="error" message={erreur} onClose={() => setErreur('')} />}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? <><Spinner size="sm" color="white" /> Création...</> : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-forest-600 font-semibold hover:text-forest-700">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
