import prisma from '../prisma/client.js';

export const getBySesion = (sesion_caja_id) =>
  prisma.movimientoCaja.findMany({
    where: { sesion_caja_id },
    include: { categoria_movimiento: true },
    orderBy: { createdAt: 'desc' },
  });

export const getByRango = (desde, hasta) =>
  prisma.movimientoCaja.findMany({
    where: {
      createdAt: { gte: new Date(desde), lte: new Date(hasta) },
    },
    include: { categoria_movimiento: true, sesion_caja: { select: { fecha_apertura: true } } },
    orderBy: { createdAt: 'desc' },
  });

export const create = (data) =>
  prisma.movimientoCaja.create({
    data: {
      sesion_caja_id: data.sesion_caja_id,
      categoria_movimiento_id: data.categoria_movimiento_id,
      monto: data.monto,
      descripcion: data.descripcion,
      // Si viene fecha personalizada la usamos, sino la actual
      createdAt: data.fecha ? new Date(data.fecha) : new Date(),
    },
    include: { categoria_movimiento: true },
  });

export const getCategorias = () =>
  prisma.categoriaMovimiento.findMany({ orderBy: { nombre: 'asc' } });

export const createCategoria = (data) =>
  prisma.categoriaMovimiento.create({ data });
