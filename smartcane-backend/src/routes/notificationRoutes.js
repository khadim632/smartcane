const express = require('express')
const router  = express.Router()
const auth    = require('../middlewares/authMiddleware')
const { getMesNotifications, marquerLue, marquerToutesLues } = require('../controllers/notificationController')

router.get('/',           auth, getMesNotifications)
router.put('/lire-tout',  auth, marquerToutesLues)
router.put('/:id/lire',   auth, marquerLue)
module.exports = router
