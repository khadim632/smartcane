export function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export const ALERTE_INFO = {
  sos:                    { label: 'SOS',                niveau: 'critical' },
  chute:                  { label: 'Chute détectée',     niveau: 'critical' },
  obstacle:               { label: 'Obstacle',           niveau: 'critical' },
  eau:                    { label: 'Présence d\'eau',    niveau: 'critical' },
  immobilite:             { label: 'Sortie de zone',     niveau: 'warning' },
  batterie_faible:        { label: 'Batterie faible',    niveau: 'warning' },
  deconnexion_bluetooth:  { label: 'Bluetooth déconnecté', niveau: 'warning' }
}

export function alerteBadgeClass(type) {
  const niveau = ALERTE_INFO[type]?.niveau || 'muted'
  return `badge badge--${niveau}`
}

export function alerteLabel(type) {
  return ALERTE_INFO[type]?.label || type
}

export function initiales(utilisateur) {
  if (!utilisateur) return '?'
  return `${utilisateur.prenom?.[0] || ''}${utilisateur.nom?.[0] || ''}`.toUpperCase()
}

export const ROLE_LABEL = { porteur: 'Porteur', proche: 'Proche', admin: 'Administrateur' }
