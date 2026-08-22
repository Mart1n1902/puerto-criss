import * as authService from '../services/auth.service.js';
import { ok, fail } from '../utils/response.util.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return fail(res, 'Email y contraseña requeridos');
    const data = await authService.login({ email, password });
    ok(res, data);
  } catch (err) {
    next(err);
  }
};

export const me = (req, res) => ok(res, req.user);
