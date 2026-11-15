import prisma from '../prisma/client.js';

export const getBySesion = (sesion_caja_id) =>
  prisma.movimientoCaja.findMany({
    where: { sesion_caja_id },
    include: { categoria_movimiento: true },
    orderBy: { createdAt: 'desc' },
  });

const parseFecha = (raw, nombreCampo) => {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) {
    throw { status: 400, message: `Fecha inválida en '${nombreCampo}'` };
  }
  return d;
};

export const getByRango = (desde, hasta) => {
  const fechaDesde = parseFecha(desde, 'desde');
  const fechaHasta = parseFecha(hasta, 'hasta');
  return prisma.movimientoCaja.findMany({
    where: {
      createdAt: { gte: fechaDesde, lte: fechaHasta },
    },
    include: { categoria_movimiento: true, sesion_caja: { select: { fecha_apertura: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

export const create = (data) =>
  prisma.movimientoCaja.create({
    data: {
      sesion_caja_id: data.sesion_caja_id,
      categoria_movimiento_id: data.categoria_movimiento_id,
      monto: data.monto,
      descripcion: data.descripcion,
      // Si viene fecha personalizada la usamos, sino la actual
      createdAt: data.fecha ? parseFecha(data.fecha, 'fecha') : new Date(),
    },
    include: { categoria_movimiento: true },
  });

export const getCategorias = () =>
  prisma.categoriaMovimiento.findMany({ orderBy: { nombre: 'asc' } });

export const createCategoria = (data) =>
  prisma.categoriaMovimiento.create({ data });
