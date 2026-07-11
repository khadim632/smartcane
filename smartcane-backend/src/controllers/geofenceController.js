const { Geofence } = require('../models');

async function listerGeofences(req, res, next) {
  try {
    const geofences = await Geofence.findAll({ where: { porteur_id: req.utilisateur.id } });
    return res.json(geofences);
  } catch (err) {
    next(err);
  }
}

async function creerGeofence(req, res, next) {
  try {
    const { nom, latitude_centre, longitude_centre, rayon_metres } = req.body;
    const geofence = await Geofence.create({
      porteur_id: req.utilisateur.id,
      nom,
      latitude_centre,
      longitude_centre,
      rayon_metres
    });
    return res.status(201).json(geofence);
  } catch (err) {
    next(err);
  }
}

async function modifierGeofence(req, res, next) {
  try {
    const geofence = await Geofence.findByPk(req.params.id);
    if (!geofence) return res.status(404).json({ message: 'Geofence introuvable' });

    const { nom, latitude_centre, longitude_centre, rayon_metres, actif } = req.body;
    Object.assign(geofence, {
      nom: nom ?? geofence.nom,
      latitude_centre: latitude_centre ?? geofence.latitude_centre,
      longitude_centre: longitude_centre ?? geofence.longitude_centre,
      rayon_metres: rayon_metres ?? geofence.rayon_metres,
      actif: actif ?? geofence.actif
    });
    await geofence.save();
    return res.json(geofence);
  } catch (err) {
    next(err);
  }
}

async function supprimerGeofence(req, res, next) {
  try {
    await Geofence.destroy({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listerGeofences, creerGeofence, modifierGeofence, supprimerGeofence };
