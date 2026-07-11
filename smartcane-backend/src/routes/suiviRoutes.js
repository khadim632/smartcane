const express  = require('express')
const router   = express.Router()
const auth     = require('../middlewares/authMiddleware')
const validate = require('../middlewares/validate')
const { validateInvitationProche } = require('../middlewares/validators')
const { listerSuivis, inviterProche, modifierSuivi, supprimerSuivi } = require('../controllers/suiviController')

router.get('/',     auth, listerSuivis)
router.post('/',    auth, validateInvitationProche, validate, inviterProche)
router.put('/:id',  auth, modifierSuivi)
router.delete('/:id', auth, supprimerSuivi)
module.exports = router
