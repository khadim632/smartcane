const bcrypt = require('bcrypt')
const { Utilisateur, Canne } = require('../models')

async function getProfil(req, res, next) {
  try {
    const u = await Utilisateur.findByPk(req.utilisateur.id, {
      attributes: { exclude: ['mot_de_passe','reset_password_token','reset_password_expire'] }
    })
    return res.json(u)
  } catch (err) { next(err) }
}

async function modifierProfil(req, res, next) {
  try {
    const { nom, prenom, telephone, avatar_url } = req.body
    await Utilisateur.update(
      { nom, prenom, telephone, avatar_url },
      { where: { id: req.utilisateur.id } }
    )
    const u = await Utilisateur.findByPk(req.utilisateur.id, {
      attributes: { exclude: ['mot_de_passe','reset_password_token','reset_password_expire'] }
    })
    return res.json(u)
  } catch (err) { next(err) }
}

// Porteur voit ses propres cannes
async function getMesCannes(req, res, next) {
  try {
    const cannes = await Canne.findAll({
      where: { porteur_id: req.utilisateur.id },
      order: [['date_creation', 'DESC']]
    })
    return res.json(cannes)
  } catch (err) { next(err) }
}

// Changer le mot de passe quand on est connecté
async function changerMotDePasse(req, res, next) {
  try {
    const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body

    const u = await Utilisateur.findByPk(req.utilisateur.id)
    const valide = await bcrypt.compare(ancien_mot_de_passe, u.mot_de_passe)
    if (!valide) {
      return res.status(401).json({ message: 'Ancien mot de passe incorrect' })
    }

    u.mot_de_passe = await bcrypt.hash(nouveau_mot_de_passe, 10)
    await u.save()

    return res.json({ message: 'Mot de passe modifié avec succès' })
  } catch (err) { next(err) }
}

module.exports = { getProfil, modifierProfil, getMesCannes, changerMotDePasse }
