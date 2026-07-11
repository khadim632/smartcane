const { verifierAccessToken } = require('../utils/jwt');

function authMiddleware(req, res, next) {
  const entete = req.headers.authorization;

  if (!entete || !entete.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  const token = entete.split(' ')[1];

  try {
    const payload = verifierAccessToken(token);
    req.utilisateur = payload; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide ou expire' });
  }
}

module.exports = authMiddleware;
