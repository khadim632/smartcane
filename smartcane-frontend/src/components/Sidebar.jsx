import { useAuth } from '../context/AuthContext'
import { ROLE_LABEL } from '../utils/format'

const NAV = {
  porteur: [
    { key: 'apercu', label: 'Aperçu' },
    { key: 'position', label: 'Position & trajet' },
    { key: 'alertes', label: 'Alertes' },
    { key: 'zones', label: 'Zones de sécurité' },
    { key: 'proches', label: 'Mes proches' },
    { key: 'profil', label: 'Profil' }
  ],
  proche: [
    { key: 'porteurs', label: 'Personnes suivies' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'profil', label: 'Profil' }
  ],
  admin: [
    { key: 'stats', label: 'Vue d\'ensemble' },
    { key: 'utilisateurs', label: 'Utilisateurs' },
    { key: 'cannes', label: 'Parc de cannes' },
    { key: 'creer-porteur', label: 'Créer un porteur' }
  ]
}

export default function Sidebar({ onglet, setOnglet }) {
  const { utilisateur, logout } = useAuth()
  const items = NAV[utilisateur?.role] || []

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar__brand">
          <span className="sidebar__brand-mark">SC</span>
          SmartCane
        </div>
        <div className="sidebar__role" style={{ marginTop: 6 }}>{ROLE_LABEL[utilisateur?.role]}</div>
      </div>

      <nav>
        {items.map((item) => (
          <button
            key={item.key}
            className={`sidebar__link ${onglet === item.key ? 'active' : ''}`}
            onClick={() => setOnglet(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar__footer">
        <button className="sidebar__logout" onClick={logout}>Se déconnecter</button>
      </div>
    </aside>
  )
}
