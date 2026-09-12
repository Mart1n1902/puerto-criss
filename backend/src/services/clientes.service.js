import prisma from '../prisma/client.js';

export const getAll = () =>
  prisma.cliente.findMany({ orderBy: { nombre: 'asc' } });

export const getById = (id) =>
  prisma.cliente.findUniqueOrThrow({
    where: { id: parseInt(id) },
    include: { pedidos: { orderBy: { createdAt: 'desc' }, take: 10 } },
  });

export const lookupByTelefono = async (telefono) => {
  if (!telefono || telefono.trim().length < 6) return null;
  const cliente = await prisma.cliente.findFirst({
    where: { telefono: telefono.trim() },
    include: {
      pedidos: {
        where: { tipo: 'DELIVERY' },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { direccion: true, referencia: true },
      },
    },
  });
  if (!cliente) return null;
  const ultimoPedido = cliente.pedidos?.[0];
  return {
    id: cliente.id,
    nombre: cliente.nombre,
    telefono: cliente.telefono,
    direccion: ultimoPedido?.direccion || null,
    referencia: ultimoPedido?.referencia || null,
  };
};

