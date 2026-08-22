import bcrypt from 'bcryptjs';
import prisma from '../prisma/client.js';
import { generateToken } from '../utils/jwt.util.js';

export const login = async ({ email, password }) => {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario || !usuario.activo) throw { status: 401, message: 'Credenciales inválidas' };

  const valid = await bcrypt.compare(password, usuario.password);
  if (!valid) throw { status: 401, message: 'Credenciales inválidas' };

  const token = generateToken({ id: usuario.id, rol: usuario.rol, nombre: usuario.nombre });
  return { token, user: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol } };
};

export const hashPassword = (plain) => bcrypt.hash(plain, 10);
