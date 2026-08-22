import { Router } from 'express';
import * as ctrl from '../controllers/clientes.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/roles.middleware.js';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), ctrl.getAll);
router.get('/:id', authenticate, authorize('ADMIN'), ctrl.getById);

export default router;
