import { Router } from 'express';
import * as ctrl from '../controllers/productos.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/roles.middleware.js';

const router = Router();

// Pública: menú del cliente
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);

// Control rápido de stock disponible / agotado (Admin, Cocina, Mozo)
router.patch('/:id/toggle-disponible', authenticate, authorize('ADMIN', 'COCINA', 'MOZO'), ctrl.toggleDisponible);

// Privada: solo admin
router.post('/', authenticate, authorize('ADMIN'), ctrl.create);
router.put('/:id', authenticate, authorize('ADMIN'), ctrl.update);
router.delete('/:id', authenticate, authorize('ADMIN'), ctrl.remove);

export default router;
