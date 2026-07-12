require('dotenv').config()
const express     = require('express')
const cors        = require('cors')
const helmet      = require('helmet')
const { globalLimiter } = require('./middlewares/rateLimiter')

const authRoutes      = require('./routes/authRoutes')
const userRoutes      = require('./routes/userRoutes')
const canneRoutes     = require('./routes/canneRoutes')
const positionRoutes  = require('./routes/positionRoutes')
const alerteRoutes    = require('./routes/alerteRoutes')
const suiviRoutes     = require('./routes/suiviRoutes')
const geofenceRoutes  = require('./routes/geofenceRoutes')
const adminRoutes     = require('./routes/adminRoutes')
const notifRoutes     = require('./routes/notificationRoutes')
const errorHandler    = require('./middlewares/errorHandler')

const app = express()

// ---- Sécurité HTTP ----
app.use(helmet())

// ---- CORS strict : uniquement le frontend autorisé ----
const originesAutorisees = (process.env.FRONTEND_URL || 'https://smartcane-nine.vercel.app').split(',')
app.use(cors({
  origin: (origin, callback) => {
    // Autorise les appels sans origin (Postman, curl, applis mobile)
    if (!origin || originesAutorisees.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`Origine non autorisée: ${origin}`))
    }
  },
  credentials: true
}))

app.use(express.json({ limit: '1mb' }))

// ---- Rate limiting global ----
app.use(globalLimiter)

// ---- Route de santé ----
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// ---- Routes ----
app.use('/api/auth',        authRoutes)
app.use('/api/users',       userRoutes)
app.use('/api/cannes',      canneRoutes)
app.use('/api/positions',   positionRoutes)
app.use('/api/alertes',     alerteRoutes)
app.use('/api/suivis',      suiviRoutes)
app.use('/api/geofences',   geofenceRoutes)
app.use('/api/admin',       adminRoutes)
app.use('/api/notifications', notifRoutes)

// ---- Gestion des erreurs ----
app.use(errorHandler)

module.exports = app
