const bcrypt = require('bcrypt')
const { Utilisateur, Canne, Alerte, QrToken } = require('../models')
const QRCode = require('qrcode')
const crypto = require('crypto')
const { getPublicAppUrl } = require('../utils/urls')

// ===== STATS =====
async function getStats(req, res, next) {
  try {
    const [total, porteurs, proches, totalCannes, dispo, vendues, alertesActives] = await Promise.all([
      Utilisateur.count(),
      Utilisateur.count({ where: { role: 'porteur' } }),
      Utilisateur.count({ where: { role: 'proche' } }),
      Canne.count(),
      Canne.count({ where: { statut: 'disponible' } }),
      Canne.count({ where: { statut: 'vendue' } }),
      Alerte.count({ where: { statut: 'active' } })
    ])
    return res.json({ total, porteurs, proches, totalCannes, dispo, vendues, alertesActives })
  } catch (err) { next(err) }
}

// ===== UTILISATEURS =====
async function listerUtilisateurs(req, res, next) {
  try {
    const { role } = req.query
    const where = role ? { role } : {}
    const users = await Utilisateur.findAll({
      where,
      attributes: { exclude: ['mot_de_passe','reset_password_token','reset_password_expire'] },
      order: [['date_creation','DESC']]
    })
    return res.json(users)
  } catch (err) { next(err) }
}

async function getUtilisateur(req, res, next) {
  try {
    const u = await Utilisateur.findByPk(req.params.id, {
      attributes: { exclude: ['mot_de_passe','reset_password_token','reset_password_expire'] }
    })
    if (!u) return res.status(404).json({ message: 'Utilisateur introuvable' })
    return res.json(u)
  } catch (err) { next(err) }
}

async function modifierUtilisateur(req, res, next) {
  try {
    const u = await Utilisateur.findByPk(req.params.id)
    if (!u) return res.status(404).json({ message: 'Utilisateur introuvable' })
    const { nom, prenom, telephone, role } = req.body
    if (nom       !== undefined) u.nom = nom
    if (prenom    !== undefined) u.prenom = prenom
    if (telephone !== undefined) u.telephone = telephone
    if (role      !== undefined) u.role = role
    await u.save()
    const { mot_de_passe, reset_password_token, reset_password_expire, ...pub } = u.toJSON()
    return res.json(pub)
  } catch (err) { next(err) }
}

async function supprimerUtilisateur(req, res, next) {
  try {
    if (parseInt(req.params.id) === req.utilisateur.id)
      return res.status(400).json({ message: 'Tu ne peux pas supprimer ton propre compte' })
    const ok = await Utilisateur.destroy({ where: { id: req.params.id } })
    if (!ok) return res.status(404).json({ message: 'Utilisateur introuvable' })
    return res.status(204).send()
  } catch (err) { next(err) }
}

// ===== ADMIN CRÉE UN COMPTE PORTEUR + ASSIGNE UNE CANNE =====
async function creerPorteurEtAssigner(req, res, next) {
  try {
    const { nom, prenom, email, mot_de_passe, telephone, canne_id } = req.body
    if (!nom || !prenom || !email || !mot_de_passe)
      return res.status(400).json({ message: 'Champs obligatoires manquants' })

    // Crée le compte porteur
    const hash = await bcrypt.hash(mot_de_passe, 10)
    const porteur = await Utilisateur.create({ nom, prenom, email, telephone, mot_de_passe: hash, role: 'porteur' })

    // Si une canne est choisie, on l'assigne
    let canne = null
    if (canne_id) {
      canne = await Canne.findByPk(canne_id)
      if (!canne) return res.status(404).json({ message: 'Canne introuvable' })
      if (canne.statut === 'vendue')
        return res.status(409).json({ message: 'Cette canne est déjà assignée' })
      canne.porteur_id = porteur.id
      canne.statut = 'vendue'
      await canne.save()
    }

    return res.status(201).json({
      message: 'Compte porteur créé avec succès',
      porteur: { id: porteur.id, nom: porteur.nom, prenom: porteur.prenom, email: porteur.email },
      canne: canne ? { id: canne.id, numero_serie: canne.numero_serie } : null
    })
  } catch (err) { next(err) }
}

// ===== CANNES =====
async function listerCannes(req, res, next) {
  try {
    const { statut } = req.query  // ?statut=disponible ou ?statut=vendue
    const where = statut ? { statut } : {}
    const cannes = await Canne.findAll({
      where,
      include: [{ model: Utilisateur, as: 'porteur', attributes: ['id','nom','prenom','email','telephone'] }],
      order: [['date_creation','DESC']]
    })
    return res.json(cannes)
  } catch (err) { next(err) }
}

async function creerCanne(req, res, next) {
  try {
    const { numero_serie, porteur_id } = req.body
    if (!numero_serie) return res.status(400).json({ message: 'numero_serie obligatoire' })

    const canne = await Canne.create({
      numero_serie,
      porteur_id: porteur_id || null,
      statut: porteur_id ? 'vendue' : 'disponible'
    })

    // Génère automatiquement un QR token à la création
    const token = crypto.randomBytes(32).toString('hex')
    await QrToken.create({
      canne_id: canne.id,
      token,
      date_expiration: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    })

    return res.status(201).json({ ...canne.toJSON(), qr_token: token })
  } catch (err) { next(err) }
}

async function getQrAdmin(req, res, next) {
  try {
    const canne = await Canne.findByPk(req.params.id)
    if (!canne) return res.status(404).json({ message: 'Canne introuvable' })

    // Cherche un QR token valide, sinon en crée un
    let qrToken = await QrToken.findOne({ where: { canne_id: canne.id, utilise: false } })
    if (!qrToken) {
      const token = crypto.randomBytes(32).toString('hex')
      qrToken = await QrToken.create({
        canne_id: canne.id,
        token,
        date_expiration: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      })
    }

    const url = `${getPublicAppUrl()}/reclamer?token=${qrToken.token}&serie=${canne.numero_serie}`
    const qrDataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: '#3a5c27' } })

    return res.json({ qrCode: qrDataUrl, url, numero_serie: canne.numero_serie })
  } catch (err) { next(err) }
}

async function modifierCanne(req, res, next) {
  try {
    const canne = await Canne.findByPk(req.params.id)
    if (!canne) return res.status(404).json({ message: 'Canne introuvable' })
    const { numero_serie, porteur_id, niveau_batterie, etat_bluetooth, statut } = req.body
    if (numero_serie    !== undefined) canne.numero_serie    = numero_serie
    if (niveau_batterie !== undefined) canne.niveau_batterie = niveau_batterie
    if (etat_bluetooth  !== undefined) canne.etat_bluetooth  = etat_bluetooth
    if (statut          !== undefined) canne.statut          = statut
    if (porteur_id !== undefined) {
      canne.porteur_id = porteur_id || null
      canne.statut = porteur_id ? 'vendue' : 'disponible'
    }
    await canne.save()
    return res.json(canne)
  } catch (err) { next(err) }
}

async function supprimerCanne(req, res, next) {
  try {
    const ok = await Canne.destroy({ where: { id: req.params.id } })
    if (!ok) return res.status(404).json({ message: 'Canne introuvable' })
    return res.status(204).send()
  } catch (err) { next(err) }
}

module.exports = {
  getStats,
  listerUtilisateurs, getUtilisateur, modifierUtilisateur, supprimerUtilisateur,
  creerPorteurEtAssigner,
  listerCannes, creerCanne, getQrAdmin, modifierCanne, supprimerCanne
}
