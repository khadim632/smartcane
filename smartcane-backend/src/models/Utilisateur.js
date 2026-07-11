const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Utilisateur = sequelize.define('Utilisateur', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nom: { type: DataTypes.STRING(100), allowNull: false },
  prenom: { type: DataTypes.STRING(100), allowNull: false },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  mot_de_passe: { type: DataTypes.STRING(255), allowNull: false },
  telephone: { type: DataTypes.STRING(20) },
  role: {
    type: DataTypes.ENUM('porteur', 'proche', 'admin'),
    allowNull: false,
    defaultValue: 'proche'
  },
  avatar_url: { type: DataTypes.STRING(255) },
  // Stocke un HASH du jeton de reinitialisation (jamais le jeton brut), avec sa date d'expiration
  reset_password_token: { type: DataTypes.STRING(255), allowNull: true },
  reset_password_expire: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'utilisateurs',
  underscored: true,
  createdAt: 'date_creation',
  updatedAt: 'date_maj'
});

module.exports = Utilisateur;
