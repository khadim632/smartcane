# SmartCane Backend

API backend pour l'application SmartCane (Express + PostgreSQL + Socket.IO + JWT).

## Stack technique

- **Node.js + Express** — serveur API REST
- **PostgreSQL (Neon)** — base de données cloud
- **Sequelize** — ORM pour interagir avec la base
- **JWT** — authentification sécurisée (access token 15min + refresh token 7j)
- **bcrypt** — hashage des mots de passe
- **Socket.IO** — positions GPS et alertes en temps réel
- **Nodemailer + Gmail** — envoi d'emails (mot de passe oublié)

---

## 1. Installation

```bash
cd smartcane-backend
npm install
```

---

## 2. Configuration du fichier .env

Copie `.env.example` et renomme-le `.env`, puis remplis les valeurs :

```env
PORT=5000

# Connection string Neon (depuis ton dashboard Neon)
DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require

# Secrets JWT : mets deux textes longs et différents, garde-les privés
JWT_SECRET=ton_secret_jwt_long_et_aleatoire
JWT_REFRESH_SECRET=ton_autre_secret_refresh_different
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Gmail pour l'envoi d'emails (mot de passe oublié)
# GMAIL_APP_PASSWORD = mot de passe d'APPLICATION (pas ton mot de passe Gmail habituel)
# A générer sur : myaccount.google.com/apppasswords
GMAIL_USER=ton_adresse@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# URL du frontend React
FRONTEND_URL=http://localhost:5173
```

> ⚠️ Ne mets jamais ton fichier `.env` sur GitHub — il est déjà dans `.gitignore`

---

## 3. Migration base de données (si pas encore fait)

Si tu avais déjà créé les tables avant d'ajouter le système de mot de passe oublié,
exécute ce script dans le SQL Editor de Neon :

```sql
ALTER TABLE utilisateurs
ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_password_expire TIMESTAMP;
```

---

## 4. Lancer le serveur

```bash
npm run dev
```

Si tout fonctionne :
```
Connexion a la base de donnees reussie
Serveur SmartCane demarre sur le port 5000
```

Vérifie dans le navigateur : http://localhost:5000/api/health → `{"status":"ok"}`

---

## 5. Structure du projet

```
smartcane-backend/
├── server.js                  point d'entrée (HTTP + Socket.IO)
├── .env                       variables d'environnement (jamais sur GitHub)
├── .env.example               modèle de configuration
├── migration_reset_password.sql
└── src/
    ├── app.js                 configuration Express (routes, middlewares)
    ├── config/
    │   └── database.js        connexion Sequelize à Neon
    ├── models/                un fichier par table
    │   ├── index.js           associations entre tables
    │   ├── Utilisateur.js
    │   ├── Canne.js
    │   ├── Suivi.js
    │   ├── Position.js
    │   ├── Alerte.js
    │   ├── Geofence.js
    │   ├── Notification.js
    │   └── RefreshToken.js
    ├── controllers/           logique métier
    │   ├── authController.js
    │   ├── userController.js
    │   ├── canneController.js
    │   ├── positionController.js
    │   ├── alerteController.js
    │   ├── suiviController.js
    │   ├── geofenceController.js
    │   └── adminController.js
    ├── routes/                URLs de l'API
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   ├── canneRoutes.js
    │   ├── positionRoutes.js
    │   ├── alerteRoutes.js
    │   ├── suiviRoutes.js
    │   ├── geofenceRoutes.js
    │   └── adminRoutes.js
    ├── middlewares/
    │   ├── authMiddleware.js  vérifie le token JWT
    │   ├── roleMiddleware.js  contrôle d'accès par rôle
    │   └── errorHandler.js   gestion centralisée des erreurs
    ├── utils/
    │   ├── jwt.js             génération/vérification des tokens
    │   └── mailer.js          envoi d'emails via Gmail
    └── sockets/
        └── socketHandler.js   événements temps réel
```

---

## 6. Toutes les routes API

### Authentification (public)

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion → retourne accessToken + refreshToken |
| POST | `/api/auth/refresh` | Renouveler l'access token |
| POST | `/api/auth/logout` | Déconnexion |
| POST | `/api/auth/forgot-password` | Envoie un lien de réinitialisation par email |
| POST | `/api/auth/reset-password` | Définit le nouveau mot de passe |

### Profil (connecté)

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/users/me` | Voir son profil |
| PUT | `/api/users/me` | Modifier son profil |

### Cannes (connecté)

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/cannes/:id` | Infos d'une canne (batterie, bluetooth) |
| PUT | `/api/cannes/:id` | Mise à jour état de la canne (appelé par l'objet connecté) |

### Positions GPS (connecté)

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/positions/current/:canneId` | Dernière position connue |
| GET | `/api/positions/history/:canneId` | Historique (filtrable par `?debut=&fin=`) |
| POST | `/api/positions` | Nouvelle position envoyée par la canne |

### Alertes (connecté)

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/alertes` | Liste des alertes (filtrable par `?statut=&canneId=`) |
| POST | `/api/alertes` | Nouvelle alerte déclenchée par la canne |
| PUT | `/api/alertes/:id` | Marquer une alerte comme traitée |

### Proches / Suivis (connecté)

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/suivis` | Liste des liens porteur ↔ proche |
| POST | `/api/suivis` | Inviter un proche (par email) |
| PUT | `/api/suivis/:id` | Accepter l'invitation / modifier permissions |
| DELETE | `/api/suivis/:id` | Supprimer un lien |

### Géofencing (connecté)

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/geofences` | Liste des zones de sécurité |
| POST | `/api/geofences` | Créer une zone |
| PUT | `/api/geofences/:id` | Modifier une zone |
| DELETE | `/api/geofences/:id` | Supprimer une zone |

### Admin (role: admin uniquement)

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/admin/stats` | Vue d'ensemble (nb utilisateurs, cannes, alertes actives) |
| GET | `/api/admin/users` | Liste tous les comptes (filtrable par `?role=`) |
| GET | `/api/admin/users/:id` | Détail d'un compte |
| PUT | `/api/admin/users/:id` | Modifier un compte (y compris changer son rôle) |
| DELETE | `/api/admin/users/:id` | Supprimer un compte |
| GET | `/api/admin/cannes` | Liste toutes les cannes avec leur porteur |
| POST | `/api/admin/cannes` | Enregistrer une nouvelle canne |
| PUT | `/api/admin/cannes/:id` | Modifier une canne |
| DELETE | `/api/admin/cannes/:id` | Supprimer une canne |

---

## 7. Créer le premier compte admin

Par sécurité, `/api/auth/register` ne permet jamais de créer un compte admin.
Pour le premier admin, une seule manipulation manuelle dans Neon :

```sql
UPDATE utilisateurs SET role = 'admin' WHERE email = 'ton_email@exemple.com';
```

Ensuite reconnecte-toi via `/api/auth/login` → le token contiendra `role: "admin"`.
Après ça, tu peux promouvoir d'autres comptes via `PUT /api/admin/users/:id`.

---

## 8. Temps réel (Socket.IO)

Le frontend doit se connecter à Socket.IO et rejoindre la room de la canne suivie :

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

// Rejoindre la room d'une canne pour recevoir ses événements
socket.emit('canne:join', canneId);

// Écouter les mises à jour de position
socket.on('position:update', (position) => {
  console.log('Nouvelle position :', position);
});

// Écouter les alertes
socket.on('alerte:new', (alerte) => {
  console.log('Nouvelle alerte :', alerte);
});

// Écouter l'état de la canne (batterie, bluetooth)
socket.on('canne:status', (canne) => {
  console.log('État canne :', canne);
});
```

---

## 9. Rôles disponibles

| Rôle | Description |
|---|---|
| `porteur` | Utilisateur principal, propriétaire de la canne |
| `proche` | Suit un porteur, reçoit les alertes selon ses permissions |
| `admin` | Accès complet à toutes les routes `/api/admin/...` |
