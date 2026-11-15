import * as svc from '../services/movimientos.service.js';
import { ok, created, fail } from '../utils/response.util.js';

const parseId = (raw) => {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export const getBySesion = async (req, res, next) => {
  try {
    const sesionId = parseId(req.params.sesionId);
    if (!sesionId) return fail(res, 'ID de sesión inválido', 400);
    ok(res, await svc.getBySesion(sesionId));
  } catch (err) { next(err); }
};

export const getByRango = async (req, res, next) => {
  try {
    const { desde, hasta } = req.query;
    ok(res, await svc.getByRango(desde, hasta));
  } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try {
    const { descripcion, fecha } = req.body;
    const categoria_movimiento_id = parseId(req.body.categoria_movimiento_id);
    const sesion_caja_id = parseId(req.body.sesion_caja_id);
    const monto = Number(req.body.monto);

    if (!categoria_movimiento_id || !sesion_caja_id || !Number.isFinite(monto) || monto <= 0) {
      return fail(res, 'Sesión, categoría y monto válido (> 0) requeridos', 400);
    }

    created(res, await svc.create({
      categoria_movimiento_id,
      sesion_caja_id,
      monto,
      descripcion: descripcion ? String(descripcion).trim() : null,
      fecha,
    }));
  } catch (err) { next(err); }
};

export const getCategorias = async (req, res, next) => {
  try { ok(res, await svc.getCategorias()); } catch (err) { next(err); }
};

export const createCategoria = async (req, res, next) => {
  try {
    const { nombre, tipo } = req.body;
    if (!nombre?.trim() || !['INGRESO', 'EGRESO'].includes(tipo)) {
      return fail(res, 'Nombre y tipo (INGRESO o EGRESO) requeridos', 400);
    }
    created(res, await svc.createCategoria({ nombre: nombre.trim(), tipo }));
  } catch (err) { next(err); }
};
