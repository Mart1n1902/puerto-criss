import 'dotenv/config';
import http from 'http';
import app from './src/app.js';
import { initSocket } from './src/socket.js';
import prisma from './src/prisma/client.js';

const requiredEnv = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`❌ Faltan variables de entorno obligatorias: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Inicializar WebSockets
const io = initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Servidor y WebSockets corriendo en puerto ${PORT}`);
});

const shutdown = async (signal) => {
  console.log(`\n⏳ Señal ${signal} recibida. Cerrando servidor...`);
  const forceExit = setTimeout(() => {
    console.error('❌ Cierre forzado por timeout');
    process.exit(1);
  }, 10000);
  forceExit.unref();

  try {
    io.close();
    await new Promise((resolve) => server.close(resolve));
    await prisma.$disconnect();
    console.log('✅ Servidor y conexiones cerrados correctamente');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al cerrar servidor:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
