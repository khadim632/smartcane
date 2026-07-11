const { Position, Canne, Geofence, Alerte, Suivi, Notification } = require('../models')
const { Op } = require('sequelize')

async function getPositionActuelle(req, res, next) {
  try {
    const position = await Position.findOne({
      where: { canne_id: req.params.canneId },
      order: [['date_position', 'DESC']]
    })
    if (!position) return res.status(404).json({ message: 'Aucune position enregistrée' })
    return res.json(position)
  } catch (err) { next(err) }
}

async function getHistorique(req, res, next) {
  try {
    const { debut, fin, page = 1, limit = 50 } = req.query
    const where = { canne_id: req.params.canneId }

    if (debut && fin) {
      where.date_position = { [Op.between]: [new Date(debut), new Date(fin)] }
    }

    const offset = (parseInt(page) - 1) * parseInt(limit)

    const { count, rows } = await Position.findAndCountAll({
      where,
      order: [['date_position', 'DESC']],
      limit: Math.min(parseInt(limit), 200), // max 200 par page
      offset
    })

    return res.json({
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / parseInt(limit)),
      positions: rows
    })
  } catch (err) { next(err) }
}

// Appelé par la canne (IoT) — protégé par iotAuth dans les routes
async function creerPosition(req, res, next) {
  try {
    const { canne_id, latitude, longitude, altitude } = req.body

    const canne = await Canne.findByPk(canne_id)
    if (!canne) return res.status(404).json({ message: 'Canne introuvable' })

    const position = await Position.create({ canne_id, latitude, longitude, altitude })

    // Diffusion temps réel aux proches connectés
    req.app.get('io').to(`canne_${canne_id}`).emit('position:update', position)

    // ---- Vérification géofencing ----
    if (canne.porteur_id) {
      await verifierGeofencing(canne, latitude, longitude, req.app.get('io'))
    }

    return res.status(201).json(position)
  } catch (err) { next(err) }
}

// Calcule la distance en mètres entre deux coordonnées GPS (formule Haversine)
function distanceMetres(lat1, lon1, lat2, lon2) {
  const R = 6371000 // rayon terre en mètres
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

async function verifierGeofencing(canne, latitude, longitude, io) {
  try {
    // Récupère toutes les géofences actives du porteur
    const geofences = await Geofence.findAll({
      where: { porteur_id: canne.porteur_id, actif: true }
    })

    for (const zone of geofences) {
      const distance = distanceMetres(
        latitude, longitude,
        zone.latitude_centre, zone.longitude_centre
      )

      // La canne est sortie de la zone
      if (distance > zone.rayon_metres) {
        // Évite les doublons : pas d'alerte si une alerte "immobilite" active existe déjà
        // pour cette canne dans les 5 dernières minutes
        const alerteRecente = await Alerte.findOne({
          where: {
            canne_id: canne.id,
            type: 'immobilite',
            statut: 'active',
            date_alerte: { [Op.gte]: new Date(Date.now() - 5 * 60 * 1000) }
          }
        })

        // Vérifie aussi qu'on n'a pas déjà envoyé une alerte géofence récente
        const alerteGeoRecente = await Alerte.findOne({
          where: {
            canne_id: canne.id,
            message: { [Op.like]: `%${zone.nom}%` },
            statut: 'active',
            date_alerte: { [Op.gte]: new Date(Date.now() - 10 * 60 * 1000) }
          }
        })

        if (!alerteRecente && !alerteGeoRecente) {
          const alerte = await Alerte.create({
            canne_id: canne.id,
            type: 'immobilite',
            message: `La canne a quitté la zone "${zone.nom}" (à ${Math.round(distance)}m du centre)`,
            latitude,
            longitude
          })

          // Notifie les proches qui ont accepté de recevoir les alertes
          const suivis = await Suivi.findAll({
            where: { porteur_id: canne.porteur_id, statut: 'accepte', recevoir_alertes: true }
          })

          await Promise.all(
            suivis.map(s => Notification.create({
              utilisateur_id: s.proche_id,
              alerte_id: alerte.id,
              titre: `⚠️ Sortie de zone — ${zone.nom}`,
              message: `La canne a quitté la zone "${zone.nom}"`
            }))
          )

          io.to(`canne_${canne.id}`).emit('alerte:new', alerte)
        }
      }
    }
  } catch (err) {
    console.error('Erreur vérification géofencing:', err.message)
  }
}

module.exports = { getPositionActuelle, getHistorique, creerPosition }
