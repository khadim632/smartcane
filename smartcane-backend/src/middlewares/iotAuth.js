// Middleware d'authentification pour les objets IoT (la canne physique)
// La canne envoie sa clé API dans le header X-IoT-Key
function iotAuth(req, res, next) {
  const key = req.headers['x-iot-key']

  if (!key) {
    return res.status(401).json({ message: 'Clé API IoT manquante (header X-IoT-Key requis)' })
  }

  if (key !== process.env.IOT_API_KEY) {
    return res.status(401).json({ message: 'Clé API IoT invalide' })
  }

  next()
}

module.exports = iotAuth
