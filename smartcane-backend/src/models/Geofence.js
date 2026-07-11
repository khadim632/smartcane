const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Geofence = sequelize.define('Geofence', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  porteur_id: { type: DataTypes.INTEGER, allowNull: false },
  nom: { type: DataTypes.STRING(100), allowNull: false },
  latitude_centre: { type: DataTypes.DOUBLE, allowNull: false },
  longitude_centre: { type: DataTypes.DOUBLE, allowNull: false },
  rayon_metres: { type: DataTypes.INTEGER, defaultValue: 200 },
  actif: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'geofences',
  underscored: true,
  createdAt: 'date_creation',
  updatedAt: false
});

module.exports = Geofence;
