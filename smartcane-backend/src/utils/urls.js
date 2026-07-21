// FRONTEND_URL peut contenir plusieurs origines separees par des virgules
// (necessaire pour la whitelist CORS dans app.js). Mais un lien envoye par email
// ou encode dans un QR code doit pointer vers UNE SEULE URL precise.
//
// PUBLIC_APP_URL permet de definir explicitement cette URL unique.
// A defaut, on prend la premiere origine listee dans FRONTEND_URL.
function getPublicAppUrl() {
  if (process.env.PUBLIC_APP_URL) return process.env.PUBLIC_APP_URL.trim().replace(/\/$/, '');
  const premiere = (process.env.FRONTEND_URL || 'https://smartcane-chi.vercel.app').split(',')[0];
  return premiere.trim().replace(/\/$/, '');
}

module.exports = { getPublicAppUrl };
