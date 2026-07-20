const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { Utilisateur, RefreshToken } = require('../models');
const { genererAccessToken, genererRefreshToken, verifierRefreshToken } = require('../utils/jwt');
const { envoyerEmailReinitialisation } = require('../utils/mailer');

async function register(req, res, next) {
  try {
    const { nom, prenom, email, mot_de_passe, telephone, role } = req.body;

    if (!nom || !prenom || !email || !mot_de_passe) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    const motDePasseHash = await bcrypt.hash(mot_de_passe, 10);

    const utilisateur = await Utilisateur.create({
      nom,
      prenom,
      email,
      mot_de_passe: motDePasseHash,
      telephone,
      // un compte admin ne se cree jamais via l'inscription publique
      role: role === 'admin' ? 'proche' : (role || 'proche')
    });

    return res.status(201).json({
      id: utilisateur.id,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      role: utilisateur.role
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, mot_de_passe } = req.body;

    const utilisateur = await Utilisateur.findOne({ where: { email } });
    if (!utilisateur) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
    if (!motDePasseValide) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const accessToken = genererAccessToken(utilisateur);
    const refreshToken = genererRefreshToken(utilisateur);

    await RefreshToken.create({
      utilisateur_id: utilisateur.id,
      token: refreshToken,
      date_expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return res.json({
      accessToken,
      refreshToken,
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role
      }
    });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token manquant' });
    }

    const enBase = await RefreshToken.findOne({ where: { token: refreshToken } });
    if (!enBase) {
      return res.status(401).json({ message: 'Refresh token invalide' });
    }

    const payload = verifierRefreshToken(refreshToken);
    const utilisateur = await Utilisateur.findByPk(payload.id);
    if (!utilisateur) {
      return res.status(401).json({ message: 'Utilisateur introuvable' });
    }

    const nouvelAccessToken = genererAccessToken(utilisateur);
    return res.json({ accessToken: nouvelAccessToken });
  } catch (err) {
    return res.status(401).json({ message: 'Refresh token invalide ou expire' });
  }
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    await RefreshToken.destroy({ where: { token: refreshToken } });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// Etape 1 : l'utilisateur demande un lien de reinitialisation
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const utilisateur = await Utilisateur.findOne({ where: { email } });

    // On repond toujours pareil, meme si l'email n'existe pas,
    // pour ne pas reveler quels emails sont inscrits dans la base
    const reponseGenerique = { message: 'Si ce compte existe, un email de reinitialisation a ete envoye' };

    if (!utilisateur) {
      return res.json(reponseGenerique);
    }

    // On genere un jeton aleatoire, on n'envoie que LUI par email,
    // et on stocke seulement son hash en base (comme pour un mot de passe)
    const tokenBrut = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(tokenBrut).digest('hex');

    utilisateur.reset_password_token = tokenHash;
    utilisateur.reset_password_expire = new Date(Date.now() + 30 * 60 * 1000); // valable 30 minutes
    await utilisateur.save();

    const lien = `${process.env.FRONTEND_URL}/reset-password?token=${tokenBrut}&email=${encodeURIComponent(email)}`;

    // On repond immediatement : l'envoi d'email ne doit jamais faire attendre
    // le frontend (SMTP peut etre lent ou bloque par l'hebergeur).
    res.json(reponseGenerique);

    envoyerEmailReinitialisation(email, lien).catch((err) => {
      console.error('Echec envoi email de reinitialisation :', err.message);
    });
  } catch (err) {
    next(err);
  }
}

// Etape 2 : l'utilisateur clique sur le lien recu et envoie son nouveau mot de passe
async function resetPassword(req, res, next) {
  try {
    const { email, token, nouveau_mot_de_passe } = req.body;

    if (!email || !token || !nouveau_mot_de_passe) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const utilisateur = await Utilisateur.findOne({
      where: {
        email,
        reset_password_token: tokenHash,
        reset_password_expire: { [Op.gt]: new Date() } // pas encore expire
      }
    });

    if (!utilisateur) {
      return res.status(400).json({ message: 'Lien invalide ou expire' });
    }

    utilisateur.mot_de_passe = await bcrypt.hash(nouveau_mot_de_passe, 10);
    utilisateur.reset_password_token = null;
    utilisateur.reset_password_expire = null;
    await utilisateur.save();

    return res.json({ message: 'Mot de passe reinitialise avec succes' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword };
