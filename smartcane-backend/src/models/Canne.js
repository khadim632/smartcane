const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Canne = sequelize.define('Canne', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  numero_serie: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  niveau_batterie: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
    validate: { min: 0, max: 100 }
  },
  etat_bluetooth: {
    type: DataTypes.ENUM('connecte', 'deconnecte'),
    allowNull: false,
    defaultValue: 'deconnecte'
  },
  statut: {
    type: DataTypes.ENUM('disponible', 'vendue'),
    allowNull: false,
    defaultValue: 'disponible'
  },
  porteur_id: { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: 'cannes',
  underscored: true,
  createdAt: 'date_creation',
  updatedAt: false
})

module.exports = Canne
