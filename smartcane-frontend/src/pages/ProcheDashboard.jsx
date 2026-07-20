import { useEffect, useState, useCallback } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import Radar from '../components/Radar'
import MapView from '../components/MapView'
import ProfilPanel from '../components/ProfilPanel'
import { suiviApi, positionApi, alerteApi, notifApi } from '../api'
import { useSocket } from '../context/SocketContext'
import { formatDate, alerteBadgeClass, alerteLabel } from '../utils/format'

const TITRES = { porteurs: 'Personnes suivies', notifications: 'Notifications', profil: 'Mon profil' }

export default function ProcheDashboard() {
  const [onglet, setOnglet] = useState('porteurs')
  return (
    <div className="shell">
      <Sidebar onglet={onglet} setOnglet={setOnglet} />
      <div>
        <Topbar titre={TITRES[onglet]} />
        <div className="content">
          {onglet === 'porteurs' && <Porteurs />}
          {onglet === 'notifications' && <Notifications />}
          {onglet === 'profil' && <ProfilPanel />}
        </div>
      </div>
    </div>
  )
}

function Porteurs() {
  const [suivis, setSuivis] = useState([])
  const [selection, setSelection] = useState(null)

  const charger = useCallback(() => suiviApi.liste().then(({ data }) => setSuivis(data)), [])
  useEffect(() => { charger() }, [charger])

  async function repondre(id, statut) {
    await suiviApi.modifier(id, { statut })
    charger()
  }

  const enAttente = suivis.filter((s) => s.statut === 'en_attente')
  const acceptes = suivis.filter((s) => s.statut === 'accepte')

  return (
    <>
      {enAttente.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3>Invitations en attente</h3>
          {enAttente.map((s) => (
            <div className="alert-row" key={s.id}>
              <div className="alert-row__body">
                <div className="alert-row__msg">{s.porteur?.prenom} {s.porteur?.nom}</div>
                <div className="alert-row__meta">{s.porteur?.email}</div>
              </div>
              <button className="btn btn--signal btn--sm" onClick={() => repondre(s.id, 'accepte')}>Accepter</button>
              <button className="btn btn--ghost btn--sm" onClick={() => repondre(s.id, 'refuse')}>Refuser</button>
            </div>
          ))}
        </div>
      )}

      {acceptes.length === 0 ? (
        <div className="empty card"><h4>Aucun porteur suivi pour l'instant</h4><p>Demande au porteur de t'inviter avec ton email depuis son tableau de bord.</p></div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: selection ? '260px 1fr' : '1fr', gap: 20 }}>
          <div className="card" style={{ height: 'fit-content' }}>
            <h3>Porteurs suivis</h3>
            <div className="stack">
              {acceptes.map((s) => {
                const canne = s.porteur?.cannes?.[0]
                return (
                  <button
                    key={s.id}
                    className={`sidebar__link ${selection?.id === s.id ? 'active' : ''}`}
                    style={{ color: selection?.id === s.id ? undefined : 'var(--ink)', border: '1px solid var(--line)' }}
                    onClick={() => setSelection(s)}
                  >
                    <Radar state={canne?.etat_bluetooth === 'connecte' ? 'ok' : 'offline'} />
                    {s.porteur?.prenom} {s.porteur?.nom}
                  </button>
                )
              })}
            </div>
          </div>
          {selection && <DetailPorteur suivi={selection} />}
        </div>
      )}
    </>
  )
}

function DetailPorteur({ suivi }) {
  const canne = suivi.porteur?.cannes?.[0]
  const [position, setPosition] = useState(null)
  const [alertes, setAlertes] = useState([])
  const socket = useSocket()

  useEffect(() => {
    if (!canne) return
    if (suivi.voir_position) positionApi.actuelle(canne.id).then(({ data }) => setPosition(data)).catch(() => {})
    if (suivi.recevoir_alertes) alerteApi.liste({ canneId: canne.id, limit: 10 }).then(({ data }) => setAlertes(data.alertes)).catch(() => {})
  }, [canne?.id])

  useEffect(() => {
    if (!canne || !socket) return
    socket.rejoindreCanne(canne.id)
    const offPos = socket.onEvent('position:update', (p) => setPosition(p))
    const offAlerte = socket.onEvent('alerte:new', (a) => setAlertes((prev) => [a, ...prev].slice(0, 10)))
    return () => { offPos?.(); offAlerte?.(); socket.quitterCanne(canne.id) }
  }, [canne?.id, socket])

  if (!canne) {
    return <div className="empty card"><h4>Aucune canne associée à ce porteur</h4></div>
  }

  return (
    <div className="stack">
      <div className="grid grid--3">
        <div className="card">
          <div className="card__label">Batterie</div>
          <div className="card__value">{canne.niveau_batterie}%</div>
        </div>
        <div className="card">
          <div className="card__label">Bluetooth</div>
          <div className="card__value" style={{ fontSize: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Radar state={canne.etat_bluetooth === 'connecte' ? 'ok' : 'offline'} />
            {canne.etat_bluetooth === 'connecte' ? 'Connecté' : 'Déconnecté'}
          </div>
        </div>
        <div className="card">
          <div className="card__label">Dernière mise à jour</div>
          <div className="card__value" style={{ fontSize: 16 }}>{position ? formatDate(position.date_position) : '—'}</div>
        </div>
      </div>

      {suivi.voir_position && (
        <div className="card">
          <h3>Position</h3>
          <MapView position={position ? [position.latitude, position.longitude] : null} height={300} />
        </div>
      )}

      {suivi.recevoir_alertes && (
        <div className="card">
          <h3>Alertes récentes</h3>
          {alertes.length === 0 ? (
            <div className="empty"><h4>Aucune alerte récente</h4></div>
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
      )}
    </div>
  )
}

function Notifications() {
  const [notifs, setNotifs] = useState([])
  const charger = useCallback(() => notifApi.liste({ limit: 50 }).then(({ data }) => setNotifs(data.notifications)), [])
  useEffect(() => { charger() }, [charger])

  async function lire(id) { await notifApi.marquerLue(id); charger() }
  async function toutLire() { await notifApi.marquerToutesLues(); charger() }

  return (
    <div className="card">
      <div className="row-between">
        <h3 style={{ marginBottom: 0 }}>Notifications</h3>
        <button className="btn btn--ghost btn--sm" onClick={toutLire}>Tout marquer comme lu</button>
      </div>
      {notifs.length === 0 ? (
        <div className="empty"><h4>Aucune notification</h4></div>
      ) : (
        notifs.map((n) => (
          <div className="alert-row" key={n.id} style={{ opacity: n.lu ? 0.55 : 1 }}>
            <div className="alert-row__body">
              <div className="alert-row__msg">{n.titre}</div>
              <div className="alert-row__meta">{n.message} · {formatDate(n.date_creation)}</div>
            </div>
            {!n.lu && <button className="btn btn--ghost btn--sm" onClick={() => lire(n.id)}>Marquer lue</button>}
          </div>
        ))
      )}
    </div>
  )
}
