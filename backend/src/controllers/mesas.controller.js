import * as svc from '../services/mesas.service.js';
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
    const { numero, estado } = req.body;
    if (!numero?.toString().trim()) return fail(res, 'Número de mesa requerido', 400);
    const data = { numero: String(numero).trim() };
    if (estado) data.estado = estado;
    created(res, await svc.create(data));
  } catch (err) { next(err); }
};
export const update = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return fail(res, 'ID inválido', 400);
    const { numero, estado } = req.body;
    const data = {};
    if (numero !== undefined) data.numero = String(numero).trim();
    if (estado !== undefined) data.estado = estado;
    ok(res, await svc.update(id, data));
  } catch (err) { next(err); }
};
