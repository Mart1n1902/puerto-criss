import * as svc from '../services/productos.service.js';
import { ok, created, fail } from '../utils/response.util.js';

const parseId = (raw) => {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const pickProductoFields = (body) => {
  const data = {};
  if (body.nombre !== undefined) data.nombre = String(body.nombre).trim();
  if (body.descripcion !== undefined) data.descripcion = body.descripcion ? String(body.descripcion).trim() : null;
  if (body.precio_actual !== undefined) data.precio_actual = Number(body.precio_actual);
  if (body.imagen_url !== undefined) data.imagen_url = body.imagen_url ? String(body.imagen_url).trim() : null;
  if (body.disponible !== undefined) data.disponible = Boolean(body.disponible);
  if (body.categoria_id !== undefined) data.categoria_id = Number(body.categoria_id);
  return data;
};

export const getAll = async (req, res, next) => {
  try {
    const soloDisponibles = req.query.disponibles === 'true';
    ok(res, await svc.getAll(soloDisponibles));
  } catch (err) { next(err); }
};

export const getById = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return fail(res, 'ID inválido', 400);
    ok(res, await svc.getById(id));
  } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try {
    const data = pickProductoFields(req.body);
    if (!data.nombre || !Number.isFinite(data.precio_actual) || !Number.isInteger(data.categoria_id)) {
      return fail(res, 'Nombre, precio_actual y categoria_id válidos son requeridos', 400);
    }
    created(res, await svc.create(data));
  } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return fail(res, 'ID inválido', 400);
    const data = pickProductoFields(req.body);
    ok(res, await svc.update(id, data));
  } catch (err) { next(err); }
};

export const toggleDisponible = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return fail(res, 'ID inválido', 400);
    ok(res, await svc.toggleDisponible(id));
  } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return fail(res, 'ID inválido', 400);
    ok(res, await svc.remove(id));
  } catch (err) { next(err); }
};
