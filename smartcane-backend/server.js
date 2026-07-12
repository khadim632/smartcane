require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const app = require('./src/app');
const sequelize = require('./src/config/database');
require('./src/models'); // charge les modeles et leurs associations
const socketHandler = require('./src/sockets/socketHandler');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || 'https://smartcane-nine.vercel.app' }
});

app.set('io', io);
socketHandler(io);

async function demarrer() {
  try {
    await sequelize.authenticate();
    console.log('Connexion a la base de donnees reussie');

    server.listen(PORT, () => {
      console.log(`Serveur SmartCane demarre sur le port ${PORT}`);
    });
  } catch (err) {
    console.error('Impossible de se connecter a la base de donnees:', err);
    process.exit(1);
  }
}

demarrer();
