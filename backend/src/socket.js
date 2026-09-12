import { Server } from 'socket.io';
import { verifyToken } from './utils/jwt.util.js';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    // Unirse a sala de staff (Cocina, Mozos, Admin) con validación de token
    socket.on('join:staff', (token) => {
      try {
        if (!token) return;
        const user = verifyToken(token);
        if (['ADMIN', 'COCINA', 'MOZO'].includes(user.rol)) {
          socket.join('staff');
        }
      } catch (err) {
        console.warn(`⚠️ Intento fallido de unirse a sala staff: ${err.message}`);
      }
    });

    // Unirse a la sala privada de un pedido específico para seguimiento en vivo
    socket.on('join:pedido', (codigoOrId) => {
      if (!codigoOrId) return;
      const room = `pedido:${String(codigoOrId).toUpperCase().trim()}`;
      socket.join(room);
    });

    socket.on('disconnect', () => {
      // Socket.io maneja la salida de salas automáticamente
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

// Emisores con aislamiento de privacidad y salas
export const emitirNuevoPedido = (pedido) => {
  if (io) {
    // Notificar al personal operativo (Cocina, Mozos, Admin)
    io.to('staff').emit('pedido:nuevo', pedido);

    // Notificar a la sala del cliente si ya está suscrito
    if (pedido.codigo) {
      io.to(`pedido:${pedido.codigo.toUpperCase()}`).emit('pedido:nuevo', pedido);
    }
  }
};

export const emitirCambioEstado = (pedido) => {
  if (io) {
    // Notificar al personal
    io.to('staff').emit('pedido:cambio_estado', pedido);

    // Notificar al cliente específico
    if (pedido.codigo) {
      io.to(`pedido:${pedido.codigo.toUpperCase()}`).emit('pedido:cambio_estado', pedido);
    }
    io.to(`pedido:${pedido.id}`).emit('pedido:cambio_estado', pedido);
  }
};

export const emitirProductoActualizado = (producto) => {
  if (io) {
    // El stock de la carta es información pública para comensales y personal
    io.emit('producto:disponibilidad', producto);
  }
};

