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

const parseId = (raw) => {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export const getById = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return fail(res, 'ID de pedido inválido', 400);
    ok(res, await svc.getById(id));
  } catch (err) { next(err); }
};

export const getByCodigo = async (req, res, next) => {
  try { ok(res, await svc.getByCodigo(req.params.codigo)); }
  catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try {
    const { cliente, detalles, tipo, direccion, referencia, notas, mesa_id } = req.body;
    if (!detalles?.length) return fail(res, 'El pedido debe tener al menos un producto');
    created(res, await svc.create({
      cliente,
      detalles,
      tipo,
      direccion,
      referencia,
      notas,
      mesa_id,
      usuario_id: req.user?.id ?? null,
    }));
  } catch (err) { next(err); }
};

export const cambiarEstado = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return fail(res, 'ID de pedido inválido', 400);
    const { estado } = req.body;
    if (!estado) return fail(res, 'Estado requerido');
    ok(res, await svc.cambiarEstado(id, estado));
  } catch (err) { next(err); }
};

export const registrarPago = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return fail(res, 'ID de pedido inválido', 400);
    const { metodo, monto } = req.body;
    const parsedMonto = Number(monto);
    if (!metodo || !Number.isFinite(parsedMonto) || parsedMonto <= 0) {
      return fail(res, 'Método y monto válido (> 0) requeridos', 400);
    }
    created(res, await svc.registrarPago(id, { metodo, monto: parsedMonto }));
  } catch (err) { next(err); }
};
