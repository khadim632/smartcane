const sequelize = require('../config/database');
const Utilisateur = require('./Utilisateur');
const Canne = require('./Canne');
const Suivi = require('./Suivi');
const Position = require('./Position');
const Alerte = require('./Alerte');
const Geofence = require('./Geofence');
const Notification = require('./Notification');
const RefreshToken = require('./RefreshToken');
const QrToken = require('./QrToken');

// Un porteur possede plusieurs cannes
Utilisateur.hasMany(Canne, { foreignKey: 'porteur_id', as: 'cannes' });
Canne.belongsTo(Utilisateur, { foreignKey: 'porteur_id', as: 'porteur' });

// Suivis : un porteur a plusieurs proches, un proche suit plusieurs porteurs
Utilisateur.hasMany(Suivi, { foreignKey: 'porteur_id', as: 'proches_suivis' });
Utilisateur.hasMany(Suivi, { foreignKey: 'proche_id', as: 'porteurs_suivis' });
Suivi.belongsTo(Utilisateur, { foreignKey: 'porteur_id', as: 'porteur' });
Suivi.belongsTo(Utilisateur, { foreignKey: 'proche_id', as: 'proche' });

// Positions et alertes appartiennent a une canne
Canne.hasMany(Position, { foreignKey: 'canne_id', as: 'positions' });
Position.belongsTo(Canne, { foreignKey: 'canne_id' });

Canne.hasMany(Alerte, { foreignKey: 'canne_id', as: 'alertes' });
Alerte.belongsTo(Canne, { foreignKey: 'canne_id' });

// Geofences appartiennent a un porteur
Utilisateur.hasMany(Geofence, { foreignKey: 'porteur_id', as: 'geofences' });
Geofence.belongsTo(Utilisateur, { foreignKey: 'porteur_id' });

// Notifications
Utilisateur.hasMany(Notification, { foreignKey: 'utilisateur_id', as: 'notifications' });
Notification.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id' });
Alerte.hasMany(Notification, { foreignKey: 'alerte_id', as: 'notifications' });
Notification.belongsTo(Alerte, { foreignKey: 'alerte_id' });

// Refresh tokens
Utilisateur.hasMany(RefreshToken, { foreignKey: 'utilisateur_id' });
RefreshToken.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id' });

// QR tokens liés aux cannes
Canne.hasMany(QrToken, { foreignKey: 'canne_id', as: 'qrTokens' })
QrToken.belongsTo(Canne, { foreignKey: 'canne_id' })

module.exports = {
  sequelize,
  Utilisateur,
  Canne,
  Suivi,
  Position,
  Alerte,
  Geofence,
  Notification,
  RefreshToken,
  QrToken
};
