import { Router } from 'express';
import * as ctrl from '../controllers/mesas.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/roles.middleware.js';

const router = Router();

// Pública: listar mesas (para clientes en restaurante y mozos)
router.get('/', ctrl.getAll);

// Privada: administración y mozos
router.post('/', authenticate, authorize('ADMIN'), ctrl.create);
router.put('/:id', authenticate, authorize('ADMIN', 'MOZO'), ctrl.update);

export default router;
