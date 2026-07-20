import client from './client'

// ---- Auth ----
export const authApi = {
  login: (email, mot_de_passe) => client.post('/auth/login', { email, mot_de_passe }),
  register: (data) => client.post('/auth/register', data),
  logout: (refreshToken) => client.post('/auth/logout', { refreshToken }),
  forgotPassword: (email) => client.post('/auth/forgot-password', { email }),
  resetPassword: (data) => client.post('/auth/reset-password', data)
}

// ---- Profil ----
export const userApi = {
  getProfil: () => client.get('/users/me'),
  modifierProfil: (data) => client.put('/users/me', data),
  getMesCannes: () => client.get('/users/mes-cannes'),
  changerMotDePasse: (data) => client.put('/users/change-password', data)
}

// ---- Cannes ----
export const canneApi = {
  getCanne: (id) => client.get(`/cannes/${id}`),
  rechercherPorteur: (critere) => client.get('/cannes/rechercher-porteur', { params: { critere } }),
  reclamer: (token) => client.post('/cannes/reclamer', { token })
}

// ---- Positions ----
export const positionApi = {
  actuelle: (canneId) => client.get(`/positions/current/${canneId}`),
  historique: (canneId, params) => client.get(`/positions/history/${canneId}`, { params })
}

// ---- Alertes ----
export const alerteApi = {
  liste: (params) => client.get('/alertes', { params }),
  traiter: (id) => client.put(`/alertes/${id}`)
}

// ---- Suivis (proches) ----
export const suiviApi = {
  liste: () => client.get('/suivis'),
  inviter: (proche_email) => client.post('/suivis', { proche_email }),
  modifier: (id, data) => client.put(`/suivis/${id}`, data),
  supprimer: (id) => client.delete(`/suivis/${id}`)
}

// ---- Géofences ----
export const geofenceApi = {
  liste: () => client.get('/geofences'),
  creer: (data) => client.post('/geofences', data),
  modifier: (id, data) => client.put(`/geofences/${id}`, data),
  supprimer: (id) => client.delete(`/geofences/${id}`)
}

// ---- Notifications ----
export const notifApi = {
  liste: (params) => client.get('/notifications', { params }),
  marquerLue: (id) => client.put(`/notifications/${id}/lire`),
  marquerToutesLues: () => client.put('/notifications/lire-tout')
}

// ---- Admin ----
export const adminApi = {
  stats: () => client.get('/admin/stats'),
  users: (role) => client.get('/admin/users', { params: { role } }),
  user: (id) => client.get(`/admin/users/${id}`),
  modifierUser: (id, data) => client.put(`/admin/users/${id}`, data),
  supprimerUser: (id) => client.delete(`/admin/users/${id}`),
  creerPorteur: (data) => client.post('/admin/porteurs', data),
  cannes: (statut) => client.get('/admin/cannes', { params: { statut } }),
  creerCanne: (data) => client.post('/admin/cannes', data),
  qrCanne: (id) => client.get(`/admin/cannes/qr/${id}`),
  modifierCanne: (id, data) => client.put(`/admin/cannes/${id}`, data),
  supprimerCanne: (id) => client.delete(`/admin/cannes/${id}`)
}
