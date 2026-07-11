const express  = require('express')
const router   = express.Router()
const auth     = require('../middlewares/authMiddleware')
const iotAuth  = require('../middlewares/iotAuth')
const validate = require('../middlewares/validate')
const { validateAlerte } = require('../middlewares/validators')
const { getAlertes, creerAlerte, traiterAlerte } = require('../controllers/alerteController')

router.get('/',     auth, getAlertes)
router.post('/',    iotAuth, validateAlerte, validate, creerAlerte) // IoT seulement
router.put('/:id',  auth, traiterAlerte)
module.exports = router
