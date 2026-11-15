import prisma from '../prisma/client.js';
import { verifyToken } from '../utils/jwt.util.js';
import { fail } from '../utils/response.util.js';

const resolveActiveUser = async (token) => {
  const decoded = verifyToken(token);
  const user = await prisma.usuario.findUnique({
    where: { id: decoded.id },
    select: { id: true, nombre: true, email: true, rol: true, activo: true },
  });
  if (!user || !user.activo) return null;
  return user;
};

export const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return fail(res, 'Token requerido', 401);

  try {
    const user = await resolveActiveUser(header.split(' ')[1]);
    if (!user) return fail(res, 'Usuario inactivo o no autorizado', 401);
    req.user = user;
    next();
  } catch {
    fail(res, 'Token inválido o expirado', 401);
  }
};

export const optionalAuthenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();

  try {
    const user = await resolveActiveUser(header.split(' ')[1]);
    if (user) req.user = user;
  } catch {
    // En rutas públicas con token opcional, ignorar tokens inválidos y continuar como invitado
  }
  next();
};
