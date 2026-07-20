const { body, query, param } = require('express-validator')

// ---- Auth ----
const validateRegister = [
  body('nom').trim().notEmpty().withMessage('Le nom est obligatoire'),
  body('prenom').trim().notEmpty().withMessage('Le prénom est obligatoire'),
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('mot_de_passe').isLength({ min: 6 }).withMessage('Mot de passe minimum 6 caractères'),
  body('role').optional().isIn(['porteur','proche']).withMessage('Rôle invalide')
]

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('mot_de_passe').notEmpty().withMessage('Mot de passe obligatoire')
]

const validateForgotPassword = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide')
]

const validateResetPassword = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('token').notEmpty().withMessage('Token obligatoire'),
  body('nouveau_mot_de_passe').isLength({ min: 6 }).withMessage('Nouveau mot de passe minimum 6 caractères')
]

const validateChangePassword = [
  body('ancien_mot_de_passe').notEmpty().withMessage('Ancien mot de passe obligatoire'),
  body('nouveau_mot_de_passe').isLength({ min: 6 }).withMessage('Nouveau mot de passe minimum 6 caractères')
]

// ---- Positions ----
const validatePosition = [
  body('canne_id').isInt({ min: 1 }).withMessage('canne_id invalide'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude invalide (doit être entre -90 et 90)'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude invalide (doit être entre -180 et 180)'),
  body('altitude').optional().isFloat().withMessage('Altitude invalide')
]

// ---- Alertes ----
const validateAlerte = [
  body('canne_id').isInt({ min: 1 }).withMessage('canne_id invalide'),
  body('type').isIn(['sos','chute','immobilite','batterie_faible','deconnexion_bluetooth','obstacle','eau'])
    .withMessage('Type d\'alerte invalide'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitude invalide'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitude invalide')
]

// ---- Géofences ----
const validateGeofence = [
  body('nom').trim().notEmpty().withMessage('Le nom est obligatoire'),
  body('latitude_centre').isFloat({ min: -90, max: 90 }).withMessage('Latitude invalide'),
  body('longitude_centre').isFloat({ min: -180, max: 180 }).withMessage('Longitude invalide'),
  body('rayon_metres').optional().isInt({ min: 50, max: 50000 }).withMessage('Rayon entre 50m et 50km')
]

// ---- Suivis ----
const validateInvitationProche = [
  body('proche_email').isEmail().normalizeEmail().withMessage('Email du proche invalide')
]

// ---- Admin : créer porteur ----
const validateCreerPorteur = [
  body('nom').trim().notEmpty().withMessage('Nom obligatoire'),
  body('prenom').trim().notEmpty().withMessage('Prénom obligatoire'),
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('mot_de_passe').isLength({ min: 6 }).withMessage('Mot de passe minimum 6 caractères'),
  body('canne_id').optional().isInt({ min: 1 }).withMessage('canne_id invalide')
]

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validatePosition,
  validateAlerte,
  validateGeofence,
  validateInvitationProche,
  validateCreerPorteur
}
