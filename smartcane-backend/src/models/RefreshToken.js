const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RefreshToken = sequelize.define('RefreshToken', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  utilisateur_id: { type: DataTypes.INTEGER, allowNull: false },
  token: { type: DataTypes.STRING(500), allowNull: false },
  date_expiration: { type: DataTypes.DATE, allowNull: false }
}, {
  tableName: 'refresh_tokens',
  underscored: true,
  createdAt: 'date_creation',
  updatedAt: false
});

module.exports = RefreshToken;
