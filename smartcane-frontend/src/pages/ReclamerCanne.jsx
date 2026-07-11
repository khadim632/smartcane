import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { AlertBanner, Spinner } from '../components/ui'

export default function ReclamerCanne() {
  const { utilisateur } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [token, setToken]   = useState(searchParams.get('token')||'')
  const [etat, setEtat]     = useState('idle')
  const [message, setMessage] = useState('')
  const [canne, setCanne]   = useState(null)

  useEffect(()=>{
    if(searchParams.get('token') && utilisateur) reclamer(searchParams.get('token'))
  },[utilisateur])

  async function reclamer(t=token) {
    if(!t) return
    setEtat('chargement')
    try {
      const {data}=await api.post('/cannes/reclamer',{token:t})
      setCanne(data.canne); setEtat('succes'); setMessage(data.message)
    } catch(err){ setEtat('erreur'); setMessage(err.response?.data?.message||'QR invalide ou expiré') }
  }

  if(!utilisateur) return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center p-4">
      <div className="card p-8 max-w-sm w-full text-center space-y-4">
        <div className="text-5xl">🔒</div>
        <h2 className="font-bold text-gray-900">Connexion requise</h2>
        <p className="text-gray-400 text-sm">Connectez-vous pour lier cette canne à votre compte.</p>
        <Link to="/login" className="btn-primary w-full block text-center">Se connecter</Link>
        <Link to="/register" className="btn-secondary w-full block text-center">Créer un compte</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center">
          <div className="w-16 h-16 bg-forest-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-forest text-3xl">🦯</div>
          <h1 className="text-2xl font-bold text-gray-900">Lier ma canne</h1>
          <p className="text-gray-400 text-sm mt-1">Associez votre SmartCane à votre compte</p>
        </div>

        {etat==='chargement' && <div className="card p-10 flex flex-col items-center gap-3"><Spinner size="lg"/><p className="text-gray-400 text-sm">Liaison en cours...</p></div>}

        {etat==='succes' && canne && (
          <div className="card p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-3xl">✅</div>
            <div><h2 className="font-bold text-gray-900 text-lg">Canne liée !</h2><p className="text-gray-400 text-sm mt-1">{message}</p></div>
            <div className="bg-cream-100 rounded-xl p-4 text-sm space-y-2 text-left">
              <div className="flex justify-between"><span className="text-gray-500">Numéro</span><span className="font-mono font-semibold">{canne.numero_serie}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Batterie</span><span>{canne.niveau_batterie}%</span></div>
            </div>
            <button onClick={()=>navigate('/dashboard')} className="btn-primary w-full py-3">Aller au tableau de bord</button>
          </div>
        )}

        {(etat==='idle'||etat==='erreur') && (
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Entrer le token manuellement</h2>
            {etat==='erreur' && <AlertBanner type="error" message={message} onClose={()=>setEtat('idle')}/>}
            <div><label className="label">Token QR</label>
              <input className="input font-mono text-sm" placeholder="Collez le token de la boîte..." value={token} onChange={e=>setToken(e.target.value)}/>
            </div>
            <button onClick={()=>reclamer()} disabled={!token} className="btn-primary w-full py-3">Lier cette canne</button>
          </div>
        )}
      </div>
    </div>
  )
}
