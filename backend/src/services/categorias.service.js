import prisma from '../prisma/client.js';

export const getAll = () => prisma.categoria.findMany({ orderBy: { nombre: 'asc' } });
export const create = (data) => prisma.categoria.create({ data });
export const update = (id, data) => prisma.categoria.update({ where: { id }, data });
export const remove = (id) => prisma.categoria.update({ where: { id }, data: { activo: false } });
