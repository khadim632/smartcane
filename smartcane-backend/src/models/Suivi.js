const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Suivi = sequelize.define('Suivi', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  porteur_id: { type: DataTypes.INTEGER, allowNull: false },
  proche_id: { type: DataTypes.INTEGER, allowNull: false },
  voir_position: { type: DataTypes.BOOLEAN, defaultValue: true },
  voir_historique: { type: DataTypes.BOOLEAN, defaultValue: true },
  recevoir_alertes: { type: DataTypes.BOOLEAN, defaultValue: true },
  statut: {
    type: DataTypes.ENUM('en_attente', 'accepte', 'refuse'),
    defaultValue: 'en_attente'
  }
}, {
  tableName: 'suivis',
  underscored: true,
  createdAt: 'date_creation',
  updatedAt: false
});

module.exports = Suivi;
