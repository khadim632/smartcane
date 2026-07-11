const nodemailer = require('nodemailer');

// "service: gmail" sait deja configurer les bons serveurs SMTP de Google,
// pas besoin de host/port manuels
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD // mot de passe d'application, pas le mot de passe du compte
  }
});

async function envoyerEmailReinitialisation(destinataire, lienReinitialisation) {
  await transporter.sendMail({
    from: `"SmartCane" <${process.env.GMAIL_USER}>`,
    to: destinataire,
    subject: 'Reinitialisation de votre mot de passe SmartCane',
    html: `
      <p>Bonjour,</p>
      <p>Vous avez demande la reinitialisation de votre mot de passe SmartCane.</p>
      <p><a href="${lienReinitialisation}">Cliquez ici pour reinitialiser votre mot de passe</a></p>
      <p>Ce lien est valable 30 minutes. Si vous n'etes pas a l'origine de cette demande, ignorez cet email.</p>
    `
  });
}

module.exports = { envoyerEmailReinitialisation };
