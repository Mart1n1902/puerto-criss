import { Router } from 'express';
import * as ctrl from '../controllers/movimientos.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/roles.middleware.js';

const router = Router();
const adminOnly = [authenticate, authorize('ADMIN')];

router.get('/categorias', ...adminOnly, ctrl.getCategorias);
router.post('/categorias', ...adminOnly, ctrl.createCategoria);
router.get('/rango', ...adminOnly, ctrl.getByRango);
router.get('/sesion/:sesionId', ...adminOnly, ctrl.getBySesion);
router.post('/', ...adminOnly, ctrl.create);

export default router;
