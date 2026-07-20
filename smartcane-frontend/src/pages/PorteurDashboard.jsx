import { useEffect, useState, useCallback } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import Radar from '../components/Radar'
import MapView from '../components/MapView'
import { userApi, positionApi, alerteApi, geofenceApi, suiviApi } from '../api'
import { useSocket } from '../context/SocketContext'
import { formatDate, alerteBadgeClass, alerteLabel } from '../utils/format'
import ProfilPanel from '../components/ProfilPanel'

const TITRES = {
  apercu: 'Aperçu', position: 'Position & trajet', alertes: 'Alertes',
  zones: 'Zones de sécurité', proches: 'Mes proches', profil: 'Mon profil'
}

export default function PorteurDashboard() {
  const [onglet, setOnglet] = useState('apercu')
  const [canne, setCanne] = useState(null)
  const [chargement, setChargement] = useState(true)
  const socket = useSocket()

  useEffect(() => {
    userApi.getMesCannes().then(({ data }) => setCanne(data?.[0] || null)).finally(() => setChargement(false))
  }, [])

  useEffect(() => {
    if (!canne || !socket) return
    socket.rejoindreCanne(canne.id)
    const offStatus = socket.onEvent('canne:status', (c) => setCanne((prev) => ({ ...prev, ...c })))
    return () => { offStatus?.(); socket.quitterCanne(canne.id) }
  }, [canne?.id, socket])

  return (
    <div className="shell">
      <Sidebar onglet={onglet} setOnglet={setOnglet} />
      <div>
        <Topbar titre={TITRES[onglet]} />
        <div className="content">
          {chargement ? (
            <p>Chargement…</p>
          ) : !canne ? (
            <div className="empty card">
              <h4>Aucune canne associée</h4>
              <p>Ta canne ne t'a pas encore été assignée. Scanne le QR code fourni avec ton appareil, ou contacte un administrateur.</p>
            </div>
          ) : (
            <>
              {onglet === 'apercu' && <Apercu canne={canne} />}
              {onglet === 'position' && <Position canne={canne} />}
              {onglet === 'alertes' && <Alertes canne={canne} />}
              {onglet === 'zones' && <Zones canne={canne} />}
              {onglet === 'proches' && <Proches />}
              {onglet === 'profil' && <ProfilPanel />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Apercu({ canne }) {
  const [position, setPosition] = useState(null)
  const [alertes, setAlertes] = useState([])
  const socket = useSocket()

  useEffect(() => {
    positionApi.actuelle(canne.id).then(({ data }) => setPosition(data)).catch(() => {})
    alerteApi.liste({ canneId: canne.id, limit: 5 }).then(({ data }) => setAlertes(data.alertes)).catch(() => {})
  }, [canne.id])

  useEffect(() => {
    if (!socket) return
    const offPos = socket.onEvent('position:update', (p) => setPosition(p))
    const offAlerte = socket.onEvent('alerte:new', (a) => setAlertes((prev) => [a, ...prev].slice(0, 5)))
    return () => { offPos?.(); offAlerte?.() }
  }, [socket])

  return (
    <>
      <div className="grid grid--3" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card__label">Batterie de la canne</div>
          <div className="card__value">{canne.niveau_batterie}%</div>
          <div className="card__sub">{canne.numero_serie}</div>
        </div>
        <div className="card">
          <div className="card__label">Bluetooth</div>
          <div className="card__value" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18 }}>
            <Radar state={canne.etat_bluetooth === 'connecte' ? 'ok' : 'offline'} />
            {canne.etat_bluetooth === 'connecte' ? 'Connecté' : 'Déconnecté'}
          </div>
        </div>
        <div className="card">
          <div className="card__label">Dernière position</div>
          <div className="card__value mono" style={{ fontSize: 16 }}>
            {position ? `${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}` : '—'}
          </div>
          <div className="card__sub">{position ? formatDate(position.date_position) : 'Aucune position reçue'}</div>
        </div>
      </div>

      <div className="grid grid--2">
        <div className="card">
          <h3>Position en direct</h3>
          <MapView position={position ? [position.latitude, position.longitude] : null} height={280} />
        </div>
        <div className="card">
          <h3>Dernières alertes</h3>
          {alertes.length === 0 ? (
            <div className="empty"><h4>Aucune alerte récente</h4><p>Tout va bien de ce côté.</p></div>
          ) : (
            alertes.map((a) => (
              <div className="alert-row" key={a.id}>
                <span className={alerteBadgeClass(a.type)}>{alerteLabel(a.type)}</span>
                <div className="alert-row__body">
                  <div className="alert-row__msg">{a.message || alerteLabel(a.type)}</div>
                  <div className="alert-row__meta">{formatDate(a.date_alerte)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

function Position({ canne }) {
  const [position, setPosition] = useState(null)
  const [trace, setTrace] = useState([])
  const socket = useSocket()

  useEffect(() => {
    positionApi.actuelle(canne.id).then(({ data }) => setPosition(data)).catch(() => {})
    positionApi.historique(canne.id, { limit: 100 }).then(({ data }) => {
      setTrace(data.positions.map((p) => [p.latitude, p.longitude]).reverse())
    }).catch(() => {})
  }, [canne.id])

  useEffect(() => {
    if (!socket) return
    return socket.onEvent('position:update', (p) => {
      setPosition(p)
      setTrace((prev) => [...prev, [p.latitude, p.longitude]])
    })
  }, [socket])

  return (
    <div className="card">
      <h3>Trajet des 100 dernières positions</h3>
      <MapView position={position ? [position.latitude, position.longitude] : null} trace={trace} height={420} />
    </div>
  )
}

function Alertes({ canne }) {
  const [alertes, setAlertes] = useState([])
  const [filtre, setFiltre] = useState('')
  const socket = useSocket()

  const charger = useCallback(() => {
    alerteApi.liste({ canneId: canne.id, statut: filtre || undefined, limit: 50 })
      .then(({ data }) => setAlertes(data.alertes))
  }, [canne.id, filtre])

  useEffect(() => { charger() }, [charger])
  useEffect(() => {
    if (!socket) return
    return socket.onEvent('alerte:new', () => charger())
  }, [socket, charger])

  async function traiter(id) {
    await alerteApi.traiter(id)
    charger()
  }

  return (
    <div className="card">
      <div className="row-between">
        <h3 style={{ marginBottom: 0 }}>Historique des alertes</h3>
        <select value={filtre} onChange={(e) => setFiltre(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)' }}>
          <option value="">Toutes</option>
          <option value="active">Actives</option>
          <option value="traitee">Traitées</option>
        </select>
      </div>
      {alertes.length === 0 ? (
        <div className="empty"><h4>Aucune alerte</h4></div>
      ) : (
        alertes.map((a) => (
          <div className="alert-row" key={a.id}>
            <span className={alerteBadgeClass(a.type)}>{alerteLabel(a.type)}</span>
            <div className="alert-row__body">
              <div className="alert-row__msg">{a.message || alerteLabel(a.type)}</div>
              <div className="alert-row__meta">{formatDate(a.date_alerte)} · {a.statut}</div>
            </div>
            {a.statut === 'active' && (
              <button className="btn btn--ghost btn--sm" onClick={() => traiter(a.id)}>Marquer traitée</button>
            )}
          </div>
        ))
      )}
    </div>
  )
}

function Zones() {
  const [zones, setZones] = useState([])
  const [form, setForm] = useState({ nom: '', latitude_centre: '', longitude_centre: '', rayon_metres: 200 })
  const [erreur, setErreur] = useState('')

  const charger = useCallback(() => geofenceApi.liste().then(({ data }) => setZones(data)), [])
  useEffect(() => { charger() }, [charger])

  async function creer(e) {
    e.preventDefault()
    setErreur('')
    try {
      await geofenceApi.creer({
        nom: form.nom,
        latitude_centre: parseFloat(form.latitude_centre),
        longitude_centre: parseFloat(form.longitude_centre),
        rayon_metres: parseInt(form.rayon_metres, 10)
      })
      setForm({ nom: '', latitude_centre: '', longitude_centre: '', rayon_metres: 200 })
      charger()
    } catch (err) {
      setErreur(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Erreur')
    }
  }

  async function toggler(zone) {
    await geofenceApi.modifier(zone.id, { actif: !zone.actif })
    charger()
  }
  async function supprimer(id) {
    await geofenceApi.supprimer(id)
    charger()
  }

  return (
    <div className="grid grid--2">
      <div className="card">
        <h3>Zones existantes</h3>
        <MapView geofences={zones} height={260} />
        {zones.length === 0 ? (
          <div className="empty"><h4>Aucune zone définie</h4></div>
        ) : (
          <div className="stack" style={{ marginTop: 16 }}>
            {zones.map((z) => (
              <div className="alert-row" key={z.id}>
                <div className="alert-row__body">
                  <div className="alert-row__msg">{z.nom}</div>
                  <div className="alert-row__meta">Rayon {z.rayon_metres} m · {z.actif ? 'Active' : 'Inactive'}</div>
                </div>
                <button className="btn btn--ghost btn--sm" onClick={() => toggler(z)}>{z.actif ? 'Désactiver' : 'Activer'}</button>
                <button className="btn btn--danger btn--sm" onClick={() => supprimer(z.id)}>Supprimer</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="card">
        <h3>Créer une zone de sécurité</h3>
        {erreur && <div className="error-text">{erreur}</div>}
        <form onSubmit={creer}>
          <div className="field">
            <label>Nom de la zone</label>
            <input required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Domicile" />
          </div>
          <div className="field field--row">
            <div className="field" style={{ flex: 1 }}>
              <label>Latitude</label>
              <input required type="number" step="any" value={form.latitude_centre} onChange={(e) => setForm({ ...form, latitude_centre: e.target.value })} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Longitude</label>
              <input required type="number" step="any" value={form.longitude_centre} onChange={(e) => setForm({ ...form, longitude_centre: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label>Rayon (mètres)</label>
            <input required type="number" min={50} max={50000} value={form.rayon_metres} onChange={(e) => setForm({ ...form, rayon_metres: e.target.value })} />
          </div>
          <button className="btn btn--primary btn--block">Créer la zone</button>
        </form>
      </div>
    </div>
  )
}

function Proches() {
  const [suivis, setSuivis] = useState([])
  const [email, setEmail] = useState('')
  const [erreur, setErreur] = useState('')

  const charger = useCallback(() => suiviApi.liste().then(({ data }) => setSuivis(data)), [])
  useEffect(() => { charger() }, [charger])

  async function inviter(e) {
    e.preventDefault()
    setErreur('')
    try {
      await suiviApi.inviter(email)
      setEmail('')
      charger()
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur')
    }
  }

  async function maj(id, data) { await suiviApi.modifier(id, data); charger() }
  async function retirer(id) { await suiviApi.supprimer(id); charger() }

  return (
    <div className="grid grid--2">
      <div className="card">
        <h3>Proches liés à mon compte</h3>
        {suivis.length === 0 ? (
          <div className="empty"><h4>Aucun proche invité</h4></div>
        ) : (
          <table>
            <thead><tr><th>Proche</th><th>Statut</th><th>Alertes</th><th></th></tr></thead>
            <tbody>
              {suivis.map((s) => (
                <tr key={s.id}>
                  <td>{s.proche?.prenom} {s.proche?.nom}<br /><span className="mono" style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{s.proche?.email}</span></td>
                  <td><span className="badge badge--muted">{s.statut}</span></td>
                  <td>
                    <input type="checkbox" checked={s.recevoir_alertes} onChange={(e) => maj(s.id, { recevoir_alertes: e.target.checked })} />
                  </td>
                  <td><button className="btn btn--danger btn--sm" onClick={() => retirer(s.id)}>Retirer</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="card">
        <h3>Inviter un proche</h3>
        {erreur && <div className="error-text">{erreur}</div>}
        <form onSubmit={inviter}>
          <div className="field">
            <label>Email du proche</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="proche@exemple.com" />
          </div>
          <button className="btn btn--primary btn--block">Envoyer l'invitation</button>
        </form>
      </div>
    </div>
  )
}


