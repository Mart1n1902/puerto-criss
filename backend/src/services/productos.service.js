import prisma from '../prisma/client.js';
import { emitirProductoActualizado } from '../socket.js';

export const getAll = (soloDisponibles = false) =>
  prisma.producto.findMany({
    where: soloDisponibles ? { disponible: true } : {},
    include: { categoria: { select: { id: true, nombre: true } } },
    orderBy: { nombre: 'asc' },
  });

export const getById = (id) =>
  prisma.producto.findUniqueOrThrow({ where: { id }, include: { categoria: true } });

export const create = async (data) => {
  const producto = await prisma.producto.create({ data });
  emitirProductoActualizado(producto);
  return producto;
};

export const update = async (id, data) => {
  const producto = await prisma.producto.update({
    where: { id },
    data,
    include: { categoria: { select: { id: true, nombre: true } } },
  });
  emitirProductoActualizado(producto);
  return producto;
};

export const toggleDisponible = async (id) => {
  const actual = await prisma.producto.findUniqueOrThrow({ where: { id } });
  const producto = await prisma.producto.update({
    where: { id },
    data: { disponible: !actual.disponible },
    include: { categoria: { select: { id: true, nombre: true } } },
  });
  emitirProductoActualizado(producto);
  return producto;
};

export const remove = async (id) => {
  const producto = await prisma.producto.update({
    where: { id },
    data: { disponible: false },
    include: { categoria: { select: { id: true, nombre: true } } },
  });
  emitirProductoActualizado(producto);
  return producto;
};
