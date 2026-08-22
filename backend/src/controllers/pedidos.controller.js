import * as svc from '../services/pedidos.service.js';
import { ok, created, fail } from '../utils/response.util.js';

export const getAll = async (req, res, next) => {
  try {
    const { estado, tipo } = req.query;
    const filtros = {};
    if (estado) filtros.estado = estado;
    if (tipo) filtros.tipo = tipo;
    ok(res, await svc.getAll(filtros));
  } catch (err) { next(err); }
};

export const getById = async (req, res, next) => {
  try { ok(res, await svc.getById(req.params.id)); }
  catch (err) { next(err); }
};

export const getByCodigo = async (req, res, next) => {
  try { ok(res, await svc.getByCodigo(req.params.codigo)); }
  catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try {
    const { detalles } = req.body;
    if (!detalles?.length) return fail(res, 'El pedido debe tener al menos un producto');
    created(res, await svc.create(req.body));
  } catch (err) { next(err); }
};

export const cambiarEstado = async (req, res, next) => {
  try {
    const { estado } = req.body;
    if (!estado) return fail(res, 'Estado requerido');
    ok(res, await svc.cambiarEstado(+req.params.id, estado));
  } catch (err) { next(err); }
};

export const registrarPago = async (req, res, next) => {
  try { created(res, await svc.registrarPago(+req.params.id, req.body)); }
  catch (err) { next(err); }
};
