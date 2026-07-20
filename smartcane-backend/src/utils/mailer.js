// Envoi d'email via l'API HTTPS de Resend (port 443, jamais bloque par les
// hebergeurs cloud) -- remplace l'ancien envoi SMTP Gmail qui timeoutait sur Render.
// Necessite la variable d'environnement RESEND_API_KEY (cle recuperee sur resend.com).
// L'adresse d'expedition doit provenir d'un domaine verifie dans Resend, ou tu peux
// utiliser l'adresse de test fournie par Resend ("onboarding@resend.dev") en attendant.

const RESEND_API_URL = 'https://api.resend.com/emails';

async function envoyerEmailReinitialisation(destinataire, lienReinitialisation) {
  const expediteur = process.env.RESEND_FROM || 'SmartCane <onboarding@resend.dev>';

  const reponse = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: expediteur,
      to: destinataire,
      subject: 'Reinitialisation de votre mot de passe SmartCane',
      html: `
        <p>Bonjour,</p>
        <p>Vous avez demande la reinitialisation de votre mot de passe SmartCane.</p>
        <p><a href="${lienReinitialisation}">Cliquez ici pour reinitialiser votre mot de passe</a></p>
        <p>Ce lien est valable 30 minutes. Si vous n'etes pas a l'origine de cette demande, ignorez cet email.</p>
      `
    })
  });

  if (!reponse.ok) {
    const detail = await reponse.text().catch(() => '');
    throw new Error(`Resend a repondu ${reponse.status} : ${detail}`);
  }
}

module.exports = { envoyerEmailReinitialisation };
