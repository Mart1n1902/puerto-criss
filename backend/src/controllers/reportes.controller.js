import * as svc from '../services/reportes.service.js';
import * as iaSvc from '../services/ia.service.js';
import { ok, fail } from '../utils/response.util.js';

export const getDashboard = async (req, res, next) => {
  try { ok(res, await svc.getDashboard()); } catch (err) { next(err); }
};

export const getKpis = async (req, res, next) => {
  try { ok(res, await svc.getKpis()); } catch (err) { next(err); }
};

export const getVentasPorDia = async (req, res, next) => {
  try {
    const dias = Math.min(Math.max(parseInt(req.query.dias) || 7, 1), 90);
    ok(res, await svc.getVentasPorDia(dias));
  } catch (err) { next(err); }
};

export const getComparativaSemanal = async (req, res, next) => {
  try {
    const semanas = Math.min(Math.max(parseInt(req.query.semanas) || 4, 1), 24);
    ok(res, await svc.getComparativaSemanal(semanas));
  } catch (err) { next(err); }
};

export const getGastosPorCategoria = async (req, res, next) => {
  try {
    const { desde, hasta } = req.query;
    if (!desde || !hasta) return fail(res, 'desde y hasta son requeridos');
    ok(res, await svc.getGastosPorCategoria(desde, hasta));
  } catch (err) { next(err); }
};

export const getResumenIA = async (req, res, next) => {
  try {
    const [kpis, dashboard, comparativa] = await Promise.all([
       svc.getKpis(),
       svc.getDashboard(),
       svc.getComparativaSemanal(2),
     ]);
     const resumen = await iaSvc.generarResumen(kpis, dashboard.top_productos, comparativa);
     ok(res, { resumen });
   } catch (err) { next(err); }
 };

export const exportarCSV = async (req, res, next) => {
   try {
     const { desde, hasta } = req.query;
     const csvData = await svc.exportarVentasCSV({ desde, hasta });
     const filename = `ventas-puerto-criss-${new Date().toISOString().split('T')[0]}.csv`;

     res.setHeader('Content-Type', 'text/csv; charset=utf-8');
     res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
     res.send(csvData);
   } catch (err) { next(err); }
};

