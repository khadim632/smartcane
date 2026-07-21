const QRCode = require('qrcode')
const crypto = require('crypto')
const { Canne, QrToken, Utilisateur } = require('../models')
const { getPublicAppUrl } = require('../utils/urls')

// ---- Voir une canne (proche/porteur) ----
async function getCanne(req, res, next) {
  try {
    const canne = await Canne.findByPk(req.params.id, {
      include: [{ model: Utilisateur, as: 'porteur', attributes: ['id','nom','prenom','email'] }]
    })
    if (!canne) return res.status(404).json({ message: 'Canne introuvable' })
    return res.json(canne)
  } catch (err) { next(err) }
}

// ---- Mise à jour état par la canne elle-même (objet IoT) ----
async function majStatutCanne(req, res, next) {
  try {
    const { niveau_batterie, etat_bluetooth } = req.body
    const canne = await Canne.findByPk(req.params.id)
    if (!canne) return res.status(404).json({ message: 'Canne introuvable' })
    if (niveau_batterie !== undefined) canne.niveau_batterie = niveau_batterie
    if (etat_bluetooth  !== undefined) canne.etat_bluetooth  = etat_bluetooth
    await canne.save()
    req.app.get('io').to(`canne_${canne.id}`).emit('canne:status', canne)
    return res.json(canne)
  } catch (err) { next(err) }
}

// ---- Générer le QR code d'une canne (admin seulement) ----
async function getQrCode(req, res, next) {
  try {
    const canne = await Canne.findByPk(req.params.id)
    if (!canne) return res.status(404).json({ message: 'Canne introuvable' })

    // Crée un token unique pour ce QR (valable 1 an)
    const token = crypto.randomBytes(32).toString('hex')
    await QrToken.create({
      canne_id: canne.id,
      token,
      date_expiration: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    })

    // Le QR encode une URL que le porteur ouvrira sur son téléphone
    const url = `${getPublicAppUrl()}/reclamer?token=${token}&serie=${canne.numero_serie}`
    const qrDataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 })

    return res.json({
      qrCode: qrDataUrl,
      token,
      url,
      numero_serie: canne.numero_serie
    })
  } catch (err) { next(err) }
}

// ---- Porteur réclame une canne en scannant le QR ----
async function reclamerCanne(req, res, next) {
  try {
    const { token } = req.body
    if (!token) return res.status(400).json({ message: 'Token QR manquant' })

    const qrToken = await QrToken.findOne({ where: { token, utilise: false } })
    if (!qrToken) return res.status(400).json({ message: 'QR code invalide ou déjà utilisé' })

    // Vérifie expiration
    if (qrToken.date_expiration && new Date() > qrToken.date_expiration) {
      return res.status(400).json({ message: 'QR code expiré' })
    }

    const canne = await Canne.findByPk(qrToken.canne_id)
    if (!canne) return res.status(404).json({ message: 'Canne introuvable' })
    if (canne.statut === 'vendue') {
      return res.status(409).json({ message: 'Cette canne est déjà assignée à un porteur' })
    }

    // Assigne la canne au porteur connecté
    canne.porteur_id = req.utilisateur.id
    canne.statut = 'vendue'
    await canne.save()

    // Invalide le QR token (usage unique)
    qrToken.utilise = true
    await qrToken.save()

    return res.json({
      message: 'Canne assignée avec succès !',
      canne: {
        id: canne.id,
        numero_serie: canne.numero_serie,
        niveau_batterie: canne.niveau_batterie,
        etat_bluetooth: canne.etat_bluetooth
      }
    })
  } catch (err) { next(err) }
}

// ---- Proche recherche un porteur par matricule/email/téléphone ----
async function rechercherPorteur(req, res, next) {
  try {
    const { critere } = req.query // peut être un numéro de série, email, ou téléphone
    if (!critere) return res.status(400).json({ message: 'Critère de recherche manquant' })

    const { Op } = require('sequelize')

    // Cherche d'abord si c'est un numéro de série de canne
    const canne = await Canne.findOne({
      where: { numero_serie: critere, statut: 'vendue' },
      include: [{ model: Utilisateur, as: 'porteur', attributes: ['id','nom','prenom','email','telephone'] }]
    })

    if (canne?.porteur) {
      return res.json({ porteur: canne.porteur, via: 'numero_serie' })
    }

    // Sinon cherche par email ou téléphone
    const porteur = await Utilisateur.findOne({
      where: {
        role: 'porteur',
        [Op.or]: [
          { email: critere },
          { telephone: critere }
        ]
      },
      attributes: ['id','nom','prenom','email','telephone']
    })

    if (!porteur) {
      return res.status(404).json({ message: 'Aucun porteur trouvé avec ce critère' })
    }

    return res.json({ porteur, via: critere.includes('@') ? 'email' : 'telephone' })
  } catch (err) { next(err) }
}

module.exports = { getCanne, majStatutCanne, getQrCode, reclamerCanne, rechercherPorteur }
