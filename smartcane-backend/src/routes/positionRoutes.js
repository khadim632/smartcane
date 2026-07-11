const express   = require('express')
const router    = express.Router()
const auth      = require('../middlewares/authMiddleware')
const iotAuth   = require('../middlewares/iotAuth')
const validate  = require('../middlewares/validate')
const { validatePosition } = require('../middlewares/validators')
const { getPositionActuelle, getHistorique, creerPosition } = require('../controllers/positionController')

router.get('/current/:canneId', auth, getPositionActuelle)
router.get('/history/:canneId', auth, getHistorique)
router.post('/', iotAuth, validatePosition, validate, creerPosition) // IoT seulement
module.exports = router
