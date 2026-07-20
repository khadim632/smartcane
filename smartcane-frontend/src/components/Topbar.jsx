import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import Radar from './Radar'
import { initiales } from '../utils/format'

export default function Topbar({ titre }) {
  const { utilisateur } = useAuth()
  const socket = useSocket()

  return (
    <header className="topbar">
      <h2>{titre}</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div className="topbar__status">
          <Radar state={socket?.connecte ? 'ok' : 'offline'} />
          {socket?.connecte ? 'Temps réel connecté' : 'Connexion en cours…'}
        </div>
        <div className="topbar__user">
          <span className="topbar__avatar">{initiales(utilisateur)}</span>
          <span>{utilisateur?.prenom} {utilisateur?.nom}</span>
        </div>
      </div>
    </header>
  )
}
