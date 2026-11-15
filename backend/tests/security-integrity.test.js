import test from 'node:test';
import assert from 'node:assert/strict';
import { generateToken, verifyToken } from '../src/utils/jwt.util.js';
import { errorHandler } from '../src/middlewares/error.middleware.js';
import { abrir } from '../src/services/caja.service.js';
import { create as crearPedido, cambiarEstado } from '../src/services/pedidos.service.js';
import { getByRango } from '../src/services/movimientos.service.js';

const mockRes = () => {
  const res = { statusCode: 200, body: null };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.body = payload;
    return res;
  };
  return res;
};

test('JWT: genera y verifica token cuando JWT_SECRET está definido', () => {
  const prev = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'test_secret_123';
  try {
    const token = generateToken({ id: 1, rol: 'ADMIN' });
    const decoded = verifyToken(token);
    assert.equal(decoded.id, 1);
    assert.equal(decoded.rol, 'ADMIN');
  } finally {
    process.env.JWT_SECRET = prev;
  }
});

test('JWT: lanza error si JWT_SECRET no está definido', () => {
  const prev = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;
  try {
    assert.throws(() => generateToken({ id: 1 }), /JWT_SECRET/);
  } finally {
    process.env.JWT_SECRET = prev;
  }
});

test('errorHandler: mapea P2025, P2002, P2003 y oculta 500 en producción', () => {
  const prevEnv = process.env.NODE_ENV;
  const origErr = console.error;
  console.error = () => {};

  try {
    const r404 = mockRes();
    errorHandler({ code: 'P2025' }, {}, r404, () => {});
    assert.equal(r404.statusCode, 404);

    const r409 = mockRes();
    errorHandler({ code: 'P2002' }, {}, r409, () => {});
    assert.equal(r409.statusCode, 409);

    const r400 = mockRes();
    errorHandler({ code: 'P2003' }, {}, r400, () => {});
    assert.equal(r400.statusCode, 400);

    process.env.NODE_ENV = 'production';
    const r500 = mockRes();
    errorHandler(new Error('Detalle interno SQL'), {}, r500, () => {});
    assert.equal(r500.statusCode, 500);
    assert.equal(r500.body.message, 'Error interno del servidor');
  } finally {
    process.env.NODE_ENV = prevEnv;
    console.error = origErr;
  }
});

test('Validaciones de negocio: caja negativa, tipo/estado de pedido y fechas inválidas', async () => {
  await assert.rejects(() => abrir(1, -10), (err) => err.status === 400);
  await assert.rejects(
    () => crearPedido({ tipo: 'INVALIDO', detalles: [{ producto_id: 1, cantidad: 1 }] }),
    (err) => err.status === 400
  );
  await assert.rejects(() => cambiarEstado(1, 'ESTADO_FALSO'), (err) => err.status === 400);
  assert.throws(() => getByRango('no-es-fecha', '2026-01-01'), (err) => err.status === 400);
});

