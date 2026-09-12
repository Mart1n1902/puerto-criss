import * as svc from '../services/clientes.service.js';
import { ok } from '../utils/response.util.js';

export const getAll = async (req, res, next) => {
  try { ok(res, await svc.getAll()); } catch (err) { next(err); }
};

export const getById = async (req, res, next) => {
  try { ok(res, await svc.getById(+req.params.id)); } catch (err) { next(err); }
};

export const lookup = async (req, res, next) => {
  try {
    const { telefono } = req.query;
    ok(res, await svc.lookupByTelefono(telefono));
  } catch (err) { next(err); }
};

