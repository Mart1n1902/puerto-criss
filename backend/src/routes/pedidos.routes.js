import { Router } from 'express';
import * as ctrl from '../controllers/pedidos.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/roles.middleware.js';

const router = Router();

// Pública: cliente crea pedido y consulta su estado exclusivamente por su código único de seguimiento
router.post('/', ctrl.create);
router.get('/codigo/:codigo', ctrl.getByCodigo);

// Privada: personal operativo (Admin, Cocina, Mozos)
router.get('/', authenticate, authorize('ADMIN', 'COCINA', 'MOZO'), ctrl.getAll);
router.get('/:id', authenticate, authorize('ADMIN', 'COCINA', 'MOZO'), ctrl.getById);
router.patch('/:id/estado', authenticate, authorize('ADMIN', 'COCINA', 'MOZO'), ctrl.cambiarEstado);
router.post('/:id/pago', authenticate, authorize('ADMIN', 'MOZO'), ctrl.registrarPago);

export default router;

