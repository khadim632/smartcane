const { Alerte, Canne, Suivi, Notification } = require('../models')

async function getAlertes(req, res, next) {
  try {
    const { statut, canneId, page = 1, limit = 20 } = req.query
    const where = {}
    if (statut)  where.statut   = statut
    if (canneId) where.canne_id = canneId

    const offset = (parseInt(page) - 1) * parseInt(limit)

    const { count, rows } = await Alerte.findAndCountAll({
      where,
      order: [['date_alerte', 'DESC']],
      limit: Math.min(parseInt(limit), 100),
      offset
    })

    return res.json({
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / parseInt(limit)),
      alertes: rows
    })
  } catch (err) { next(err) }
}

// Appelé par la canne IoT uniquement
async function creerAlerte(req, res, next) {
  try {
    const { canne_id, type, message, latitude, longitude } = req.body

    const canne = await Canne.findByPk(canne_id)
    if (!canne) return res.status(404).json({ message: 'Canne introuvable' })

    const alerte = await Alerte.create({ canne_id, type, message, latitude, longitude })

    // Notifie les proches actifs
    if (canne.porteur_id) {
      const suivis = await Suivi.findAll({
        where: { porteur_id: canne.porteur_id, statut: 'accepte', recevoir_alertes: true }
      })

      await Promise.all(
        suivis.map(s => Notification.create({
          utilisateur_id: s.proche_id,
          alerte_id: alerte.id,
          titre: `Alerte ${type}`,
          message: message || `Une alerte "${type}" a été déclenchée`
        }))
      )
    }

    req.app.get('io').to(`canne_${canne_id}`).emit('alerte:new', alerte)
    return res.status(201).json(alerte)
  } catch (err) { next(err) }
}

async function traiterAlerte(req, res, next) {
  try {
    const alerte = await Alerte.findByPk(req.params.id)
    if (!alerte) return res.status(404).json({ message: 'Alerte introuvable' })
    alerte.statut = 'traitee'
    await alerte.save()
    return res.json(alerte)
  } catch (err) { next(err) }
}

module.exports = { getAlertes, creerAlerte, traiterAlerte }
