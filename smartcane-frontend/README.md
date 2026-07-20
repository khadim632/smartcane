# SmartCane — Frontend

Tableau de bord React connecté au backend SmartCane (déployé sur Render). Trois interfaces
selon le rôle du compte : **porteur**, **proche**, **admin**.

## 1. Installation

```bash
cd frontend
npm install
```

## 2. Configuration

Copie `.env.example` en `.env` et renseigne l'URL de ton backend Render :

```env
VITE_API_URL=https://ton-backend.onrender.com
```

## 3. Lancer en local

```bash
npm run dev
```

Ouvre http://localhost:5173

⚠️ Sur le backend Render, la variable d'environnement `FRONTEND_URL` doit correspondre
exactement à l'URL depuis laquelle tu ouvres ce frontend (ex: `http://localhost:5173` en dev,
puis l'URL de déploiement final en production), sinon les appels API seront bloqués par CORS.

## 4. Déployer le frontend

Ce projet est un site statique généré par Vite — il se déploie facilement sur **Vercel**,
**Netlify** ou **Render (Static Site)** :

```bash
npm run build
```

Le dossier `dist/` généré est à publier. Pense à définir `VITE_API_URL` dans les variables
d'environnement de la plateforme de déploiement (pas seulement en local).

## 5. Rôles et tableaux de bord

| Rôle | Ce qu'il voit |
|---|---|
| `porteur` | Sa canne (batterie, bluetooth), sa position en direct + trajet, ses alertes, ses zones de sécurité, ses proches, son profil |
| `proche` | Les porteurs qu'il suit (invitations à accepter/refuser), la position/alertes de chaque porteur suivi (selon les permissions accordées par le porteur), ses notifications |
| `admin` | Statistiques globales, gestion des comptes, gestion du parc de cannes (création, QR code), création de comptes porteur |

## 6. Notes techniques

- Auth par JWT (access token 15 min + refresh token), rafraîchi automatiquement via un
  intercepteur axios en cas de 401.
- Position et alertes en direct via Socket.IO (le frontend rejoint la room `canne_<id>`).
- Cartes via Leaflet + tuiles OpenStreetMap (gratuit, aucune clé API requise).
- Design system dans `src/styles/tokens.css` (couleurs, typographie) — signature visuelle :
  le composant `Radar` (ping en anneaux concentriques), qui évoque à la fois le capteur
  ultrason de la canne et le signal GPS.
