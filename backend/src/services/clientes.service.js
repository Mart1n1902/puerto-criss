import prisma from '../prisma/client.js';

export const getAll = () =>
  prisma.cliente.findMany({ orderBy: { nombre: 'asc' } });

export const getById = (id) =>
  prisma.cliente.findUniqueOrThrow({
    where: { id },
    include: { pedidos: { orderBy: { createdAt: 'desc' }, take: 10 } },
  });
