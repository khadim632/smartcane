const { Notification, Alerte } = require('../models')

async function getMesNotifications(req, res, next) {
  try {
    const { page = 1, limit = 20, non_lues } = req.query
    const where = { utilisateur_id: req.utilisateur.id }
    if (non_lues === 'true') where.lu = false

    const offset = (parseInt(page) - 1) * parseInt(limit)

    const { count, rows } = await Notification.findAndCountAll({
      where,
      include: [{ model: Alerte, as: 'alerte', attributes: ['type', 'date_alerte'] }],
      order: [['date_creation', 'DESC']],
      limit: Math.min(parseInt(limit), 50),
      offset
    })

    return res.json({
      total: count,
      non_lues: await Notification.count({ where: { utilisateur_id: req.utilisateur.id, lu: false } }),
      page: parseInt(page),
      pages: Math.ceil(count / parseInt(limit)),
      notifications: rows
    })
  } catch (err) { next(err) }
}

async function marquerLue(req, res, next) {
  try {
    const notif = await Notification.findOne({
      where: { id: req.params.id, utilisateur_id: req.utilisateur.id }
    })
    if (!notif) return res.status(404).json({ message: 'Notification introuvable' })
    notif.lu = true
    await notif.save()
    return res.json(notif)
  } catch (err) { next(err) }
}

async function marquerToutesLues(req, res, next) {
  try {
    await Notification.update(
      { lu: true },
      { where: { utilisateur_id: req.utilisateur.id, lu: false } }
    )
    return res.json({ message: 'Toutes les notifications marquées comme lues' })
  } catch (err) { next(err) }
}

module.exports = { getMesNotifications, marquerLue, marquerToutesLues }
