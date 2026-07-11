const { validationResult } = require('express-validator')

// Middleware qui vérifie les résultats de express-validator
function validate(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      erreurs: errors.array().map(e => ({ champ: e.path, message: e.msg }))
    })
  }
  next()
}

module.exports = validate
