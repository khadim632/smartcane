const express  = require('express')
const router   = express.Router()
const auth     = require('../middlewares/authMiddleware')
const validate = require('../middlewares/validate')
const { validateChangePassword } = require('../middlewares/validators')
const { getProfil, modifierProfil, getMesCannes, changerMotDePasse } = require('../controllers/userController')

router.get('/me',              auth, getProfil)
router.put('/me',              auth, modifierProfil)
router.get('/mes-cannes',      auth, getMesCannes)
router.put('/change-password', auth, validateChangePassword, validate, changerMotDePasse)

module.exports = router
