const jwt = require('jsonwebtoken');

function genererAccessToken(utilisateur) {
  return jwt.sign(
    { id: utilisateur.id, role: utilisateur.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );
}

function genererRefreshToken(utilisateur) {
  return jwt.sign(
    { id: utilisateur.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
  );
}

function verifierAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function verifierRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

module.exports = {
  genererAccessToken,
  genererRefreshToken,
  verifierAccessToken,
  verifierRefreshToken
};
