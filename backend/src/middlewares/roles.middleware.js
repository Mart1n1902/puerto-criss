import { fail } from '../utils/response.util.js';

export const authorize = (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user?.rol)) {
      return fail(res, 'Acceso denegado', 403);
    }
    next();
  };
