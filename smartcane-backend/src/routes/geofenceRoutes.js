const express  = require('express')
const router   = express.Router()
const auth     = require('../middlewares/authMiddleware')
const validate = require('../middlewares/validate')
const { validateGeofence } = require('../middlewares/validators')
const { listerGeofences, creerGeofence, modifierGeofence, supprimerGeofence } = require('../controllers/geofenceController')

router.get('/',     auth, listerGeofences)
router.post('/',    auth, validateGeofence, validate, creerGeofence)
router.put('/:id',  auth, modifierGeofence)
router.delete('/:id', auth, supprimerGeofence)
module.exports = router
