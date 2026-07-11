const rateLimit = require('express-rate-limit')

// Bloque après 10 tentatives de connexion en 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
})

// Limite générale : 100 requêtes par minute par IP
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { message: 'Trop de requêtes. Ralentissez.' },
  standardHeaders: true,
  legacyHeaders: false
})

// Limite pour forgot-password : 5 tentatives par heure
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: 'Trop de demandes de réinitialisation. Réessayez dans 1 heure.' }
})

module.exports = { loginLimiter, globalLimiter, forgotPasswordLimiter }
