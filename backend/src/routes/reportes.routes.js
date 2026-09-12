import { Router } from 'express';
import * as ctrl from '../controllers/reportes.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/roles.middleware.js';

const router = Router();
const adminOnly = [authenticate, authorize('ADMIN')];

router.get('/dashboard', ...adminOnly, ctrl.getDashboard);
router.get('/kpis', ...adminOnly, ctrl.getKpis);
router.get('/ventas', ...adminOnly, ctrl.getVentasPorDia);
router.get('/comparativa', ...adminOnly, ctrl.getComparativaSemanal);
router.get('/gastos-categoria', ...adminOnly, ctrl.getGastosPorCategoria);
router.get('/resumen-ia', ...adminOnly, ctrl.getResumenIA);
router.get('/exportar-csv', ...adminOnly, ctrl.exportarCSV);

export default router;

