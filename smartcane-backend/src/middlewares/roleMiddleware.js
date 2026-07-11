function roleMiddleware(...rolesAutorises) {
  return (req, res, next) => {
    if (!req.utilisateur || !rolesAutorises.includes(req.utilisateur.role)) {
      return res.status(403).json({ message: 'Acces refuse pour ce role' });
    }
    next();
  };
}

module.exports = roleMiddleware;
