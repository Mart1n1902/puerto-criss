import { Router } from 'express';
import * as ctrl from '../controllers/caja.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/roles.middleware.js';

const router = Router();

const adminOnly = [authenticate, authorize('ADMIN')];

router.get('/activa', ...adminOnly, ctrl.getSesionActiva);
router.get('/historial', ...adminOnly, ctrl.getHistorial);
router.post('/abrir', ...adminOnly, ctrl.abrir);
router.patch('/:id/cerrar', ...adminOnly, ctrl.cerrar);

export default router;
