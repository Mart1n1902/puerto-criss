import prisma from '../prisma/client.js';

export const getAll = () => prisma.mesa.findMany({ orderBy: { numero: 'asc' } });
export const update = (id, data) => prisma.mesa.update({ where: { id }, data });
export const create = (data) => prisma.mesa.create({ data });
