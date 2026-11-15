import { Server } from 'socket.io';
import { verifyToken } from './utils/jwt.util.js';

let io = null;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : '*';

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    // Unirse a sala de staff (Cocina, Mozos, Admin) con validación de token
    socket.on('join:staff', (token) => {
      try {
        if (!token || typeof token !== 'string') return;
        const user = verifyToken(token);
        if (['ADMIN', 'COCINA', 'MOZO'].includes(user.rol)) {
          socket.join('staff');
        }
      } catch (err) {
        console.warn(`⚠️ Intento fallido de unirse a sala staff: ${err.message}`);
      }
    });

    socket.on('leave:staff', () => {
      socket.leave('staff');
    });

    // Unirse a la sala privada de un pedido específico usando solo su código único
    socket.on('join:pedido', (codigo) => {
      if (!codigo || typeof codigo !== 'string') return;
      const normalized = codigo.toUpperCase().trim();
      if (!/^PC-[A-Z0-9]{4,}$/.test(normalized)) return;
      socket.join(`pedido:${normalized}`);
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

    // Notificar al cliente específico exclusivamente por código aleatorio
    if (pedido.codigo) {
      io.to(`pedido:${pedido.codigo.toUpperCase()}`).emit('pedido:cambio_estado', pedido);
    }
  }
};

export const emitirProductoActualizado = (producto) => {
  if (io) {
    // El stock de la carta es información pública para comensales y personal
    io.emit('producto:disponibilidad', producto);
  }
};

