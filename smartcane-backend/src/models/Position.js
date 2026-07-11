const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Position = sequelize.define('Position', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  canne_id: { type: DataTypes.INTEGER, allowNull: false },
  latitude: { type: DataTypes.DOUBLE, allowNull: false },
  longitude: { type: DataTypes.DOUBLE, allowNull: false },
  altitude: { type: DataTypes.DOUBLE },
  date_position: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'positions',
  underscored: true,
  timestamps: false
});

module.exports = Position;
