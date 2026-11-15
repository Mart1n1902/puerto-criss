import prisma from '../prisma/client.js';

export const getSesionActiva = () =>
  prisma.sesionCaja.findFirst({
    where: { estado: 'ABIERTA' },
    include: { usuario: { select: { nombre: true } }, movimientos: true },
  });

export const abrir = async (usuario_id, monto_inicial) => {
  const monto = Number(monto_inicial ?? 0);
  if (!Number.isFinite(monto) || monto < 0) {
    throw { status: 400, message: 'El monto inicial debe ser un número mayor o igual a 0' };
  }

  return prisma.$transaction(
    async (tx) => {
      const activa = await tx.sesionCaja.findFirst({ where: { estado: 'ABIERTA' } });
      if (activa) {
        throw { status: 400, message: 'Ya existe una sesión de caja abierta actualmente' };
      }
      return tx.sesionCaja.create({
        data: {
          usuario_id: parseInt(usuario_id),
          monto_inicial: monto,
        },
      });
    },
    { isolationLevel: 'Serializable' }
  );
};

export const cerrar = async (id) => {
  const sesionId = parseInt(id);
  if (!Number.isInteger(sesionId) || sesionId <= 0) {
    throw { status: 400, message: 'ID de sesión inválido' };
  }

  return prisma.$transaction(
    async (tx) => {
      const sesion = await tx.sesionCaja.findUniqueOrThrow({ where: { id: sesionId } });

      if (sesion.estado === 'CERRADA') {
        throw { status: 400, message: 'Esta sesión de caja ya fue cerrada previamente' };
      }

      // Bloqueo atómico: solo una transacción puede pasar de ABIERTA a CERRADA
      const updated = await tx.sesionCaja.updateMany({
        where: { id: sesionId, estado: 'ABIERTA' },
        data: { estado: 'CERRADA', fecha_cierre: new Date() },
      });
      if (updated.count === 0) {
        throw { status: 400, message: 'Esta sesión de caja ya fue cerrada previamente' };
      }

      const movimientos = await tx.movimientoCaja.findMany({
        where: { sesion_caja_id: sesionId },
        include: { categoria_movimiento: true },
      });

      const netoMovimientos = movimientos.reduce((sum, m) => {
        const val = parseFloat(m.monto);
        return m.categoria_movimiento.tipo === 'INGRESO' ? sum + val : sum - val;
      }, 0);

      const monto_final = parseFloat(sesion.monto_inicial || 0) + netoMovimientos;

      return tx.sesionCaja.update({
        where: { id: sesionId },
        data: { monto_final },
      });
    },
    { isolationLevel: 'Serializable' }
  );
};

export const getHistorial = () =>
  prisma.sesionCaja.findMany({
    orderBy: { fecha_apertura: 'desc' },
    include: { usuario: { select: { nombre: true } } },
  });

