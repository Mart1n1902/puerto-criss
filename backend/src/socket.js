import { Server } from 'socket.io';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado a WebSocket: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`❌ Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    console.warn('⚠️ Socket.io no ha sido inicializado aún');
  }
  return io;
};

// Emisores globales de eventos en tiempo real
export const emitirNuevoPedido = (pedido) => {
  if (io) {
    io.emit('pedido:nuevo', pedido);
  }
};

export const emitirCambioEstado = (pedido) => {
  if (io) {
    io.emit('pedido:cambio_estado', pedido);
  }
};

export const emitirProductoActualizado = (producto) => {
  if (io) {
    io.emit('producto:disponibilidad', producto);
  }
};
