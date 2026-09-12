import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middlewares/error.middleware.js';

import authRoutes from './routes/auth.routes.js';
import productosRoutes from './routes/productos.routes.js';
import categoriasRoutes from './routes/categorias.routes.js';
import pedidosRoutes from './routes/pedidos.routes.js';
import mesasRoutes from './routes/mesas.routes.js';
import clientesRoutes from './routes/clientes.routes.js';
import cajasRoutes from './routes/caja.routes.js';
import movimientosRoutes from './routes/movimientos.routes.js';
import reportesRoutes from './routes/reportes.routes.js';

const app = express();

// Seguridad HTTP Headers con Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Permitir CORS flexible para desarrollo y despliegues (Netlify, Vercel, localhost)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : '*';

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '5mb' }));

// Limitador de peticiones para Login (Prevenir ataques de fuerza bruta)
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // Máximo 10 intentos por minuto por IP
  message: { success: false, message: 'Demasiados intentos de acceso. Por favor, intenta de nuevo en un minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limitador de creación de pedidos (Prevenir spam / bots)
const pedidosLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 30, // Máximo 30 pedidos cada 5 minutos por IP
  message: { success: false, message: 'Has alcanzado el límite de pedidos permitidos. Espera un momento.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rutas
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/pedidos', pedidosLimiter, pedidosRoutes);
app.use('/api/mesas', mesasRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/caja', cajasRoutes);
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/reportes', reportesRoutes);

app.use(errorHandler);

export default app;

