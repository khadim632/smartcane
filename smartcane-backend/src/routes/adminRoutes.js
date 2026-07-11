const express = require('express')
const router = express.Router()
const auth = require('../middlewares/authMiddleware')
const role = require('../middlewares/roleMiddleware')
const {
  getStats,
  listerUtilisateurs, getUtilisateur, modifierUtilisateur, supprimerUtilisateur,
  creerPorteurEtAssigner,
  listerCannes, creerCanne, getQrAdmin, modifierCanne, supprimerCanne
} = require('../controllers/adminController')

router.use(auth, role('admin'))

// Stats
router.get('/stats', getStats)

// Utilisateurs
router.get('/users',          listerUtilisateurs)
router.get('/users/:id',      getUtilisateur)
router.put('/users/:id',      modifierUtilisateur)
router.delete('/users/:id',   supprimerUtilisateur)
router.post('/porteurs',      creerPorteurEtAssigner)  // créer porteur + assigner canne

// Cannes
router.get('/cannes',         listerCannes)             // ?statut=disponible ou vendue
router.post('/cannes',        creerCanne)
router.get('/cannes/qr/:id',  getQrAdmin)               // QR code d'une canne
router.put('/cannes/:id',     modifierCanne)
router.delete('/cannes/:id',  supprimerCanne)

module.exports = router
