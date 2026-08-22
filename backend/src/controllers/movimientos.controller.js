import * as svc from '../services/movimientos.service.js';
import { ok, created } from '../utils/response.util.js';

export const getBySesion = async (req, res, next) => {
  try { ok(res, await svc.getBySesion(+req.params.sesionId)); } catch (err) { next(err); }
};

export const getByRango = async (req, res, next) => {
  try {
    const { desde, hasta } = req.query;
    ok(res, await svc.getByRango(desde, hasta));
  } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      categoria_movimiento_id: parseInt(req.body.categoria_movimiento_id),
      sesion_caja_id: parseInt(req.body.sesion_caja_id),
      monto: parseFloat(req.body.monto),
    };
    created(res, await svc.create(data));
  } catch (err) { next(err); }
};

export const getCategorias = async (req, res, next) => {
  try { ok(res, await svc.getCategorias()); } catch (err) { next(err); }
};

export const createCategoria = async (req, res, next) => {
  try { created(res, await svc.createCategoria(req.body)); } catch (err) { next(err); }
};
