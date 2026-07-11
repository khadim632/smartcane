const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Alerte = sequelize.define('Alerte', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  canne_id: { type: DataTypes.INTEGER, allowNull: false },
  type: {
    type: DataTypes.ENUM('sos', 'chute', 'immobilite', 'batterie_faible', 'deconnexion_bluetooth'),
    allowNull: false
  },
  message: { type: DataTypes.STRING(255) },
  latitude: { type: DataTypes.DOUBLE },
  longitude: { type: DataTypes.DOUBLE },
  statut: {
    type: DataTypes.ENUM('active', 'traitee'),
    defaultValue: 'active'
  },
  date_alerte: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'alertes',
  underscored: true,
  timestamps: false
});

module.exports = Alerte;
