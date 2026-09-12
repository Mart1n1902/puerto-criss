import prisma from '../prisma/client.js';

export const getSesionActiva = () =>
  prisma.sesionCaja.findFirst({
    where: { estado: 'ABIERTA' },
    include: { usuario: { select: { nombre: true } }, movimientos: true },
  });

export const abrir = async (usuario_id, monto_inicial) => {
  const activa = await prisma.sesionCaja.findFirst({ where: { estado: 'ABIERTA' } });
  if (activa) {
    throw { status: 400, message: 'Ya existe una sesión de caja abierta actualmente' };
  }
  return prisma.sesionCaja.create({
    data: {
      usuario_id: parseInt(usuario_id),
      monto_inicial: parseFloat(monto_inicial) || 0,
    },
  });
};

export const cerrar = async (id) => {
  return prisma.$transaction(async (tx) => {
    const sesion = await tx.sesionCaja.findUniqueOrThrow({ where: { id: parseInt(id) } });

    if (sesion.estado === 'CERRADA') {
      throw { status: 400, message: 'Esta sesión de caja ya fue cerrada previamente' };
    }

    const movimientos = await tx.movimientoCaja.findMany({
      where: { sesion_caja_id: parseInt(id) },
      include: { categoria_movimiento: true },
    });

    const netoMovimientos = movimientos.reduce((sum, m) => {
      const val = parseFloat(m.monto);
      return m.categoria_movimiento.tipo === 'INGRESO' ? sum + val : sum - val;
    }, 0);

    const monto_final = parseFloat(sesion.monto_inicial || 0) + netoMovimientos;

    return tx.sesionCaja.update({
      where: { id: parseInt(id) },
      data: { estado: 'CERRADA', fecha_cierre: new Date(), monto_final },
    });
  });
};

export const getHistorial = () =>
  prisma.sesionCaja.findMany({
    orderBy: { fecha_apertura: 'desc' },
    include: { usuario: { select: { nombre: true } } },
  });

