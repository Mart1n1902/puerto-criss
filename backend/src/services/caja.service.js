import prisma from '../prisma/client.js';

export const getSesionActiva = () =>
  prisma.sesionCaja.findFirst({
    where: { estado: 'ABIERTA' },
    include: { usuario: { select: { nombre: true } }, movimientos: true },
  });

export const abrir = (usuario_id, monto_inicial) =>
  prisma.sesionCaja.create({ data: { usuario_id, monto_inicial } });

export const cerrar = async (id) => {
  const sesion = await prisma.sesionCaja.findUniqueOrThrow({ where: { id } });

  const movimientos = await prisma.movimientoCaja.findMany({
    where: { sesion_caja_id: id },
    include: { categoria_movimiento: true },
  });

  const netoMovimientos = movimientos.reduce((sum, m) => {
    const val = parseFloat(m.monto);
    return m.categoria_movimiento.tipo === 'INGRESO' ? sum + val : sum - val;
  }, 0);

  const monto_final = parseFloat(sesion.monto_inicial || 0) + netoMovimientos;

  return prisma.sesionCaja.update({
    where: { id },
    data: { estado: 'CERRADA', fecha_cierre: new Date(), monto_final },
  });
};

export const getHistorial = () =>
  prisma.sesionCaja.findMany({
    orderBy: { fecha_apertura: 'desc' },
    include: { usuario: { select: { nombre: true } } },
  });
