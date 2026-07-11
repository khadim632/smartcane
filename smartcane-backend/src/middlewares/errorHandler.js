function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ message: 'Une ressource avec ces informations existe deja' });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ message: err.errors.map(e => e.message).join(', ') });
  }

  res.status(err.status || 500).json({ message: err.message || 'Erreur serveur' });
}

module.exports = errorHandler;
