const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  utilisateur_id: { type: DataTypes.INTEGER, allowNull: false },
  alerte_id: { type: DataTypes.INTEGER },
  titre: { type: DataTypes.STRING(150) },
  message: { type: DataTypes.STRING(255) },
  lu: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'notifications',
  underscored: true,
  createdAt: 'date_creation',
  updatedAt: false
});

module.exports = Notification;
