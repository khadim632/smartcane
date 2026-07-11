const { Suivi, Utilisateur } = require('../models');

async function listerSuivis(req, res, next) {
  try {
    const { id, role } = req.utilisateur;
    const where = role === 'porteur' ? { porteur_id: id } : { proche_id: id };

    const suivis = await Suivi.findAll({
      where,
      include: [
        { model: Utilisateur, as: 'porteur', attributes: ['id', 'nom', 'prenom', 'email'] },
        { model: Utilisateur, as: 'proche', attributes: ['id', 'nom', 'prenom', 'email'] }
      ]
    });

    return res.json(suivis);
  } catch (err) {
    next(err);
  }
}

async function inviterProche(req, res, next) {
  try {
    const { proche_email } = req.body;

    const proche = await Utilisateur.findOne({ where: { email: proche_email } });
    if (!proche) return res.status(404).json({ message: 'Aucun compte avec cet email' });

    const suivi = await Suivi.create({
      porteur_id: req.utilisateur.id,
      proche_id: proche.id
    });

    return res.status(201).json(suivi);
  } catch (err) {
    next(err);
  }
}

// Permet d'accepter/refuser l'invitation, ou de modifier les permissions
async function modifierSuivi(req, res, next) {
  try {
    const suivi = await Suivi.findByPk(req.params.id);
    if (!suivi) return res.status(404).json({ message: 'Suivi introuvable' });

    const { statut, voir_position, voir_historique, recevoir_alertes } = req.body;
    if (statut !== undefined) suivi.statut = statut;
    if (voir_position !== undefined) suivi.voir_position = voir_position;
    if (voir_historique !== undefined) suivi.voir_historique = voir_historique;
    if (recevoir_alertes !== undefined) suivi.recevoir_alertes = recevoir_alertes;

    await suivi.save();
    return res.json(suivi);
  } catch (err) {
    next(err);
  }
}

async function supprimerSuivi(req, res, next) {
  try {
    await Suivi.destroy({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listerSuivis, inviterProche, modifierSuivi, supprimerSuivi };
