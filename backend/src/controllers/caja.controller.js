import * as svc from '../services/caja.service.js';
import { ok, created, fail } from '../utils/response.util.js';

export const getSesionActiva = async (req, res, next) => {
  try { ok(res, await svc.getSesionActiva()); } catch (err) { next(err); }
};

export const abrir = async (req, res, next) => {
  try {
    const { monto_inicial } = req.body;
    if (monto_inicial === undefined) return fail(res, 'monto_inicial requerido');
    created(res, await svc.abrir(req.user.id, monto_inicial));
  } catch (err) { next(err); }
};

export const cerrar = async (req, res, next) => {
  try { ok(res, await svc.cerrar(+req.params.id)); } catch (err) { next(err); }
};

export const getHistorial = async (req, res, next) => {
  try { ok(res, await svc.getHistorial()); } catch (err) { next(err); }
};
