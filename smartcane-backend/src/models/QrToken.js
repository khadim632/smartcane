const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const QrToken = sequelize.define('QrToken', {
  id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  canne_id:        { type: DataTypes.INTEGER, allowNull: false },
  token:           { type: DataTypes.STRING(100), allowNull: false, unique: true },
  utilise:         { type: DataTypes.BOOLEAN, defaultValue: false },
  date_expiration: { type: DataTypes.DATE }
}, {
  tableName: 'qr_tokens',
  underscored: true,
  createdAt: 'date_creation',
  updatedAt: false
})

module.exports = QrToken
