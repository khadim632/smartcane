function socketHandler(io) {
  io.on('connection', (socket) => {
    console.log(`Client connecte: ${socket.id}`);

    // Le client (app du proche) rejoint une "room" dediee a une canne precise
    // pour ne recevoir que les evenements de la canne qu'il suit
    socket.on('canne:join', (canneId) => {
      socket.join(`canne_${canneId}`);
    });

    socket.on('canne:leave', (canneId) => {
      socket.leave(`canne_${canneId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client deconnecte: ${socket.id}`);
    });
  });
}

module.exports = socketHandler;
