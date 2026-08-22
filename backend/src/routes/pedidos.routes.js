import { Router } from 'express';
import * as ctrl from '../controllers/pedidos.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/roles.middleware.js';

const router = Router();

// Pública: cliente crea pedido y consulta su estado
router.post('/', ctrl.create);
router.get('/codigo/:codigo', ctrl.getByCodigo);
router.get('/:id', ctrl.getById);

// Privada: cocina y mozo cambian estado
router.get('/', authenticate, authorize('ADMIN', 'COCINA', 'MOZO'), ctrl.getAll);
router.patch('/:id/estado', authenticate, authorize('ADMIN', 'COCINA', 'MOZO'), ctrl.cambiarEstado);
router.post('/:id/pago', authenticate, authorize('ADMIN', 'MOZO'), ctrl.registrarPago);

export default router;
