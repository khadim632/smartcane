import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import { AlertBanner, BatteryBar, Spinner } from '../components/ui'

export default function MaCanne() {
  const [searchParams] = useSearchParams()
  const [cannes, setCannes]         = useState([])
  const [token, setToken]           = useState(searchParams.get('token') || '')
  const [serie, setSerie]           = useState('')
  const [etat, setEtat]             = useState('idle')
  const [message, setMessage]       = useState('')
  const [loading, setLoading]       = useState(true)
  const [onglet, setOnglet]         = useState('mes_cannes')

  useEffect(() => {
    chargerCannes()
    // Si token dans l'URL (scan QR), réclamer automatiquement
    if (searchParams.get('token')) {
      setOnglet('qr')
      reclamerParToken(searchParams.get('token'))
    }
  }, [])

  async function chargerCannes() {
    setLoading(true)
    try {
      const { data } = await api.get('/users/mes-cannes')
      setCannes(data)
    } catch {}
    setLoading(false)
  }

  async function reclamerParToken(t = token) {
    if (!t) return
    setEtat('chargement')
    try {
      const { data } = await api.post('/cannes/reclamer', { token: t })
      setEtat('succes')
      setMessage(data.message)
      chargerCannes()
    } catch (err) {
      setEtat('erreur')
      setMessage(err.response?.data?.message || 'QR code invalide ou expiré')
    }
  }

  async function reclamerParSerie(e) {
    e.preventDefault()
    setEtat('chargement')
    try {
      // Cherche la canne par numéro de série pour obtenir son token
      const { data } = await api.get(`/cannes/rechercher-porteur?critere=${encodeURIComponent(serie)}`)
      setEtat('erreur')
      setMessage('Cette canne est déjà assignée à un autre porteur')
    } catch (err) {
      // Si pas trouvée, c'est qu'elle est disponible - mais on a besoin du token QR
      setEtat('erreur')
      setMessage('Pour lier votre canne, utilisez le QR code fourni dans la boîte ou contactez l\'administrateur')
    }
  }

  const ONGLETS = [
    { id: 'mes_cannes', label: 'Mes cannes' },
    { id: 'qr',         label: 'Scanner QR / Token' },
  ]

  return (
    <div className="space-y-6 animate-slide-up max-w-2xl">
      <div>
        <h1 className="page-title">Ma canne</h1>
        <p className="page-subtitle">Gérez votre canne SmartCane</p>
      </div>

      {/* Mes cannes déjà liées */}
      {loading ? (
        <div className="card p-10 flex justify-center"><Spinner size="lg" /></div>
      ) : cannes.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">
            {cannes.length === 1 ? 'Votre canne' : `Vos ${cannes.length} cannes`}
          </h2>
          {cannes.map(c => (
            <div key={c.id} className="card p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-forest-50 flex items-center justify-center text-3xl flex-shrink-0">
                  🦯
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg font-mono">{c.numero_serie}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Batterie</p>
                      <BatteryBar level={c.niveau_batterie} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Bluetooth</p>
                      <span className={`badge ${c.etat_bluetooth === 'connecte' ? 'badge-green' : 'badge-red'}`}>
                        {c.etat_bluetooth === 'connecte' ? '● Connecté' : '● Déconnecté'}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="badge badge-forest">Liée</span>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Section pour lier une nouvelle canne */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {cannes.length > 0 ? 'Lier une autre canne' : 'Lier votre canne'}
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Deux façons d'associer votre canne SmartCane à votre compte
          </p>
        </div>

        <div className="flex gap-1 mx-6 mt-4 bg-cream-200 rounded-xl p-1 w-fit">
          {ONGLETS.map(o => (
            <button key={o.id} onClick={() => { setOnglet(o.id); setEtat('idle'); setMessage('') }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                onglet === o.id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {o.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Onglet QR / Token */}
          {onglet === 'qr' && (
            <div className="space-y-4">
              <div className="bg-forest-50 border border-forest-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-forest-800 mb-1">📦 Comment ça marche ?</p>
                <ul className="text-xs text-forest-700 space-y-1">
                  <li>1. Scannez le QR code sur la boîte de votre canne avec votre téléphone</li>
                  <li>2. Ou entrez manuellement le token imprimé dans la notice</li>
                  <li>3. La canne sera automatiquement liée à votre compte</li>
                </ul>
              </div>

              {etat === 'succes' && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">✅</div>
                  <p className="font-bold text-gray-900">Canne liée avec succès !</p>
                  <p className="text-sm text-gray-400 mt-1">{message}</p>
                </div>
              )}

              {etat === 'chargement' && (
                <div className="flex flex-col items-center py-4 gap-3">
                  <Spinner size="lg" />
                  <p className="text-sm text-gray-400">Liaison en cours...</p>
                </div>
              )}

              {(etat === 'idle' || etat === 'erreur') && (
                <div className="space-y-3">
                  {etat === 'erreur' && (
                    <AlertBanner type="error" message={message} onClose={() => setEtat('idle')} />
                  )}
                  <div>
                    <label className="label">Token QR de la canne</label>
                    <input className="input font-mono text-sm"
                      placeholder="Collez le token ici (ex: a3f8b2c1d4e5...)"
                      value={token}
                      onChange={e => setToken(e.target.value)} />
                    <p className="text-xs text-gray-400 mt-1">
                      Le token se trouve sur la notice ou la boîte de votre canne SmartCane
                    </p>
                  </div>
                  <button onClick={() => reclamerParToken()} disabled={!token}
                    className="btn-primary w-full py-3">
                    🔗 Lier cette canne à mon compte
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Onglet Mes cannes */}
          {onglet === 'mes_cannes' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-amber-800 mb-2">💡 Deux façons d'obtenir votre canne</p>
                <div className="space-y-2 text-xs text-amber-700">
                  <div className="flex gap-2">
                    <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</span>
                    <p><strong>Achat en ligne</strong> — l'admin vous crée un compte et vous assigne directement une canne. Vérifiez ici si votre canne est déjà liée.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</span>
                    <p><strong>Achat physique</strong> — vous avez reçu une boîte avec un QR code. Cliquez sur "Scanner QR / Token" et entrez le token.</p>
                  </div>
                </div>
              </div>

              {cannes.length === 0 && !loading && (
                <div className="text-center py-6">
                  <p className="text-4xl mb-3">🦯</p>
                  <p className="font-semibold text-gray-700">Aucune canne liée</p>
                  <p className="text-sm text-gray-400 mt-1 mb-4">Vous n'avez pas encore de canne associée à votre compte</p>
                  <button onClick={() => setOnglet('qr')} className="btn-primary">
                    Scanner / Entrer le token QR
                  </button>
                </div>
              )}

              {cannes.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 text-center">Votre canne est déjà liée et visible ci-dessus.</p>
                  <p className="text-xs text-gray-400 text-center mt-1">
                    Pour lier une deuxième canne, allez dans l'onglet "Scanner QR / Token".
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Info contact admin */}
      <div className="card p-4 bg-gray-50 flex items-start gap-3">
        <span className="text-xl">📞</span>
        <div>
          <p className="text-sm font-semibold text-gray-700">Besoin d'aide ?</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Si vous avez acheté votre canne et ne trouvez pas votre token, contactez l'administrateur SmartCane. Il pourra vous générer un nouveau QR code.
          </p>
        </div>
      </div>
    </div>
  )
}
