import { verifyToken } from '../utils/jwt.util.js';
import { fail } from '../utils/response.util.js';

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return fail(res, 'Token requerido', 401);

  try {
    req.user = verifyToken(header.split(' ')[1]);
    next();
  } catch {
    fail(res, 'Token inválido o expirado', 401);
  }
};
