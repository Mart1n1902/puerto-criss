import * as svc from '../services/categorias.service.js';
import { ok, created, fail } from '../utils/response.util.js';

const parseId = (raw) => {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export const getAll = async (req, res, next) => {
  try { ok(res, await svc.getAll()); } catch (err) { next(err); }
};
export const create = async (req, res, next) => {
  try {
    const { nombre, activo } = req.body;
    if (!nombre?.trim()) return fail(res, 'Nombre requerido', 400);
    const data = { nombre: nombre.trim() };
    if (typeof activo === 'boolean') data.activo = activo;
    created(res, await svc.create(data));
  } catch (err) { next(err); }
};
export const update = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return fail(res, 'ID inválido', 400);
    const { nombre, activo } = req.body;
    const data = {};
    if (nombre !== undefined) data.nombre = String(nombre).trim();
    if (typeof activo === 'boolean') data.activo = activo;
    ok(res, await svc.update(id, data));
  } catch (err) { next(err); }
};
export const remove = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return fail(res, 'ID inválido', 400);
    ok(res, await svc.remove(id));
  } catch (err) { next(err); }
};
