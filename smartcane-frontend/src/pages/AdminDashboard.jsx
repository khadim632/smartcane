import { useEffect, useState, useCallback } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { adminApi } from '../api'
import { formatDate } from '../utils/format'

const TITRES = { stats: "Vue d'ensemble", utilisateurs: 'Utilisateurs', cannes: 'Parc de cannes', 'creer-porteur': 'Créer un porteur' }

export default function AdminDashboard() {
  const [onglet, setOnglet] = useState('stats')
  return (
    <div className="shell">
      <Sidebar onglet={onglet} setOnglet={setOnglet} />
      <div>
        <Topbar titre={TITRES[onglet]} />
        <div className="content">
          {onglet === 'stats' && <Stats />}
          {onglet === 'utilisateurs' && <Utilisateurs />}
          {onglet === 'cannes' && <Cannes />}
          {onglet === 'creer-porteur' && <CreerPorteur />}
        </div>
      </div>
    </div>
  )
}

function Stats() {
  const [stats, setStats] = useState(null)
  useEffect(() => { adminApi.stats().then(({ data }) => setStats(data)) }, [])
  if (!stats) return <p>Chargement…</p>

  const cartes = [
    { label: 'Comptes au total', value: stats.total },
    { label: 'Porteurs', value: stats.porteurs },
    { label: 'Proches', value: stats.proches },
    { label: 'Cannes au total', value: stats.totalCannes },
    { label: 'Cannes disponibles', value: stats.dispo },
    { label: 'Cannes assignées', value: stats.vendues },
    { label: 'Alertes actives', value: stats.alertesActives }
  ]

  return (
    <div className="grid grid--3">
      {cartes.map((c) => (
        <div className="card" key={c.label}>
          <div className="card__label">{c.label}</div>
          <div className="card__value">{c.value}</div>
        </div>
      ))}
    </div>
  )
}

function Utilisateurs() {
  const [users, setUsers] = useState([])
  const [role, setRole] = useState('')
  const [edition, setEdition] = useState(null) // utilisateur en cours d'édition

  const charger = useCallback(() => adminApi.users(role || undefined).then(({ data }) => setUsers(data)), [role])
  useEffect(() => { charger() }, [charger])

  async function supprimer(id) {
    if (!confirm('Supprimer ce compte définitivement ?')) return
    await adminApi.supprimerUser(id); charger()
  }

  return (
    <div className="card">
      <div className="row-between">
        <h3 style={{ marginBottom: 0 }}>Comptes</h3>
        <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)' }}>
          <option value="">Tous les rôles</option>
          <option value="porteur">Porteurs</option>
          <option value="proche">Proches</option>
          <option value="admin">Admins</option>
        </select>
      </div>
      <table>
        <thead><tr><th>Nom</th><th>Email</th><th>Téléphone</th><th>Rôle</th><th>Inscrit le</th><th></th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.prenom} {u.nom}</td>
              <td className="mono">{u.email}</td>
              <td>{u.telephone || '—'}</td>
              <td><span className="badge badge--muted">{u.role}</span></td>
              <td>{formatDate(u.date_creation)}</td>
              <td style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn--ghost btn--sm" onClick={() => setEdition(u)}>Modifier</button>
                <button className="btn btn--danger btn--sm" onClick={() => supprimer(u.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {edition && (
        <ModifierUtilisateurModal
          utilisateur={edition}
          onClose={() => setEdition(null)}
          onSaved={() => { setEdition(null); charger() }}
        />
      )}
    </div>
  )
}

function ModifierUtilisateurModal({ utilisateur, onClose, onSaved }) {
  const [form, setForm] = useState({
    nom: utilisateur.nom || '',
    prenom: utilisateur.prenom || '',
    telephone: utilisateur.telephone || '',
    role: utilisateur.role
  })
  const [etape, setEtape] = useState('edition') // 'edition' | 'confirmation'
  const [enregistrement, setEnregistrement] = useState(false)
  const [erreur, setErreur] = useState('')

  const CHAMPS = [
    { cle: 'prenom', label: 'Prénom' },
    { cle: 'nom', label: 'Nom' },
    { cle: 'telephone', label: 'Téléphone' },
    { cle: 'role', label: 'Rôle' }
  ]
  const ROLE_LABEL_LOCAL = { porteur: 'Porteur', proche: 'Proche', admin: 'Administrateur' }

  const changements = CHAMPS.filter((c) => (form[c.cle] || '') !== (utilisateur[c.cle] || ''))

  function passerEnConfirmation(e) {
    e.preventDefault()
    if (changements.length === 0) { onClose(); return }
    setEtape('confirmation')
  }

  async function confirmer() {
    setEnregistrement(true)
    setErreur('')
    try {
      await adminApi.modifierUser(utilisateur.id, form)
      onSaved()
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de l\'enregistrement')
      setEnregistrement(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {etape === 'edition' ? (
          <>
            <h3>Modifier {utilisateur.prenom} {utilisateur.nom}</h3>
            <p className="modal__sub">{utilisateur.email}</p>
            <form onSubmit={passerEnConfirmation}>
              <div className="field field--row">
                <div className="field" style={{ flex: 1 }}>
                  <label>Prénom</label>
                  <input value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label>Nom</label>
                  <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                </div>
              </div>
              <div className="field">
                <label>Téléphone</label>
                <input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
              </div>
              <div className="field">
                <label>Rôle</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="porteur">Porteur</option>
                  <option value="proche">Proche</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              <div className="modal__actions">
                <button type="button" className="btn btn--ghost" onClick={onClose}>Annuler</button>
                <button type="submit" className="btn btn--primary">Continuer</button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h3>Confirmer les modifications</h3>
            <p className="modal__sub">Vérifie les changements avant de les enregistrer.</p>

            {erreur && <div className="error-text">{erreur}</div>}

            <ul className="diff-list">
              {changements.map((c) => (
                <li key={c.cle}>
                  <span className="diff-label">{c.label}</span>
                  <span className="diff-old">{(c.cle === 'role' ? ROLE_LABEL_LOCAL[utilisateur[c.cle]] : utilisateur[c.cle]) || '(vide)'}</span>
                  →{' '}
                  <span className="diff-new">{(c.cle === 'role' ? ROLE_LABEL_LOCAL[form[c.cle]] : form[c.cle]) || '(vide)'}</span>
                </li>
              ))}
            </ul>

            <div className="modal__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setEtape('edition')} disabled={enregistrement}>
                Revenir en arrière
              </button>
              <button type="button" className="btn btn--primary" onClick={confirmer} disabled={enregistrement}>
                {enregistrement ? 'Enregistrement…' : 'Confirmer et enregistrer'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Cannes() {
  const [cannes, setCannes] = useState([])
  const [statut, setStatut] = useState('')
  const [numeroSerie, setNumeroSerie] = useState('')
  const [qr, setQr] = useState(null)
  const [erreur, setErreur] = useState('')

  const charger = useCallback(() => adminApi.cannes(statut || undefined).then(({ data }) => setCannes(data)), [statut])
  useEffect(() => { charger() }, [charger])

  async function creer(e) {
    e.preventDefault()
    setErreur('')
    try {
      await adminApi.creerCanne({ numero_serie: numeroSerie })
      setNumeroSerie('')
      charger()
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur')
    }
  }

  async function voirQr(id) {
    const { data } = await adminApi.qrCanne(id)
    setQr(data)
  }

  async function supprimer(id) {
    if (!confirm('Supprimer cette canne ?')) return
    await adminApi.supprimerCanne(id); charger()
  }

  return (
    <div className="stack">
      <div className="card">
        <div className="row-between">
          <h3 style={{ marginBottom: 0 }}>Cannes enregistrées</h3>
          <select value={statut} onChange={(e) => setStatut(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)' }}>
            <option value="">Toutes</option>
            <option value="disponible">Disponibles</option>
            <option value="vendue">Assignées</option>
          </select>
        </div>
        <table>
          <thead><tr><th>Numéro de série</th><th>Porteur</th><th>Batterie</th><th>Bluetooth</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            {cannes.map((c) => (
              <tr key={c.id}>
                <td className="mono">{c.numero_serie}</td>
                <td>{c.porteur ? `${c.porteur.prenom} ${c.porteur.nom}` : '—'}</td>
                <td>{c.niveau_batterie}%</td>
                <td>{c.etat_bluetooth}</td>
                <td><span className="badge badge--muted">{c.statut}</span></td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn--ghost btn--sm" onClick={() => voirQr(c.id)}>QR</button>
                  <button className="btn btn--danger btn--sm" onClick={() => supprimer(c.id)}>Suppr.</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ maxWidth: 420 }}>
        <h3>Enregistrer une nouvelle canne</h3>
        {erreur && <div className="error-text">{erreur}</div>}
        <form onSubmit={creer}>
          <div className="field">
            <label>Numéro de série</label>
            <input required value={numeroSerie} onChange={(e) => setNumeroSerie(e.target.value)} placeholder="SC-2026-0001" />
          </div>
          <button className="btn btn--primary btn--block">Enregistrer</button>
        </form>
      </div>

      {qr && (
        <div className="card" style={{ maxWidth: 320 }}>
          <div className="row-between">
            <h3 style={{ marginBottom: 0 }}>QR — {qr.numero_serie}</h3>
            <button className="btn btn--ghost btn--sm" onClick={() => setQr(null)}>Fermer</button>
          </div>
          <img src={qr.qrCode} alt={`QR ${qr.numero_serie}`} style={{ width: '100%', borderRadius: 8 }} />
        </div>
      )}
    </div>
  )
}

function CreerPorteur() {
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', mot_de_passe: '', canne_id: '' })
  const [cannesDispo, setCannesDispo] = useState([])
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')

  useEffect(() => { adminApi.cannes('disponible').then(({ data }) => setCannesDispo(data)) }, [])

  async function onSubmit(e) {
    e.preventDefault()
    setErreur(''); setMessage('')
    try {
      const { data } = await adminApi.creerPorteur({ ...form, canne_id: form.canne_id || undefined })
      setMessage(`Compte créé pour ${data.porteur.prenom} ${data.porteur.nom}${data.canne ? ` — canne ${data.canne.numero_serie} assignée` : ''}`)
      setForm({ nom: '', prenom: '', email: '', telephone: '', mot_de_passe: '', canne_id: '' })
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur')
    }
  }

  return (
    <div className="card" style={{ maxWidth: 460 }}>
      <h3>Créer un compte porteur</h3>
      {erreur && <div className="error-text">{erreur}</div>}
      {message && <div className="notice-text">{message}</div>}
      <form onSubmit={onSubmit}>
        <div className="field field--row">
          <div className="field" style={{ flex: 1 }}><label>Prénom</label><input required value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} /></div>
          <div className="field" style={{ flex: 1 }}><label>Nom</label><input required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} /></div>
        </div>
        <div className="field"><label>Email</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div className="field"><label>Téléphone</label><input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} /></div>
        <div className="field"><label>Mot de passe temporaire</label><input type="password" required minLength={6} value={form.mot_de_passe} onChange={(e) => setForm({ ...form, mot_de_passe: e.target.value })} /></div>
        <div className="field">
          <label>Canne à assigner (optionnel)</label>
          <select value={form.canne_id} onChange={(e) => setForm({ ...form, canne_id: e.target.value })}>
            <option value="">Aucune pour l'instant</option>
            {cannesDispo.map((c) => <option key={c.id} value={c.id}>{c.numero_serie}</option>)}
          </select>
        </div>
        <button className="btn btn--primary btn--block">Créer le compte</button>
      </form>
    </div>
  )
}
