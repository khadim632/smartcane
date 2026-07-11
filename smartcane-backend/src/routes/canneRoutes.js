const express  = require('express')
const router   = express.Router()
const auth     = require('../middlewares/authMiddleware')
const iotAuth  = require('../middlewares/iotAuth')
const role     = require('../middlewares/roleMiddleware')
const { getCanne, majStatutCanne, getQrCode, reclamerCanne, rechercherPorteur } = require('../controllers/canneController')

router.get('/rechercher-porteur', auth, rechercherPorteur)
router.get('/qr/:id',             auth, role('admin'), getQrCode)
router.get('/:id',                auth, getCanne)
router.put('/:id',                iotAuth, majStatutCanne) // IoT seulement
router.post('/reclamer',          auth, role('porteur'), reclamerCanne)
module.exports = router
