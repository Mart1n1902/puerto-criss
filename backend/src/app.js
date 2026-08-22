import express from 'express';
import cors from 'cors';
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

// Permitir peticiones CORS desde cualquier frontend (Netlify, Vercel, localhost)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/mesas', mesasRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/caja', cajasRoutes);
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/reportes', reportesRoutes);

app.use(errorHandler);

export default app;
