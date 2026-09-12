import { Router } from 'express';
import * as ctrl from '../controllers/clientes.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/roles.middleware.js';

const router = Router();

// Búsqueda rápida por teléfono para autocompletado en checkout
router.get('/lookup', ctrl.lookup);

// Privadas: administración
router.get('/', authenticate, authorize('ADMIN'), ctrl.getAll);
router.get('/:id', authenticate, authorize('ADMIN'), ctrl.getById);

export default router;

