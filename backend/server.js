import 'dotenv/config';
import http from 'http';
import app from './src/app.js';
import { initSocket } from './src/socket.js';

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Inicializar WebSockets
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Servidor y WebSockets corriendo en puerto ${PORT}`);
});
