import * as svc from '../services/categorias.service.js';
import { ok, created } from '../utils/response.util.js';

export const getAll = async (req, res, next) => {
  try { ok(res, await svc.getAll()); } catch (err) { next(err); }
};
export const create = async (req, res, next) => {
  try { created(res, await svc.create(req.body)); } catch (err) { next(err); }
};
export const update = async (req, res, next) => {
  try { ok(res, await svc.update(+req.params.id, req.body)); } catch (err) { next(err); }
};
export const remove = async (req, res, next) => {
  try { ok(res, await svc.remove(+req.params.id)); } catch (err) { next(err); }
};
