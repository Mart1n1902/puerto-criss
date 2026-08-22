import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from './src/prisma/client.js';

async function main() {
  // Limpiar datos existentes
  await prisma.detallePedido.deleteMany();
  await prisma.pago.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.movimientoCaja.deleteMany();
  await prisma.sesionCaja.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.categoriaMovimiento.deleteMany();
  await prisma.mesa.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.usuario.deleteMany();

  // Usuarios
  const password = await bcrypt.hash('123456', 10);

  await prisma.usuario.createMany({
    data: [
      { nombre: 'Administrador', email: 'admin@puertocris.com', password, rol: 'ADMIN' },
      { nombre: 'Cocina', email: 'cocina@puertocris.com', password, rol: 'COCINA' },
      { nombre: 'Mozo', email: 'mozo@puertocris.com', password, rol: 'MOZO' },
    ],
    skipDuplicates: true,
  });

  // Categorías
  await prisma.categoria.createMany({
    data: [
      { nombre: 'Ceviches' },
      { nombre: 'Chicharrones' },
      { nombre: 'Chaufas' },
      { nombre: 'Causas' },
      { nombre: 'Bebidas' },
    ],
    skipDuplicates: true,
  });

  const categorias = await prisma.categoria.findMany();
  const get = (nombre) => categorias.find((c) => c.nombre === nombre).id;

  // Productos
  await prisma.producto.createMany({
    data: [
      { nombre: 'Ceviche', precio_actual: 25.00, categoria_id: get('Ceviches') },
      { nombre: 'Leche de Tigre', precio_actual: 15.00, categoria_id: get('Ceviches') },
      { nombre: 'Chicharrón de Pota', precio_actual: 22.00, categoria_id: get('Chicharrones') },
      { nombre: 'Chicharrón de Pescado', precio_actual: 22.00, categoria_id: get('Chicharrones') },
      { nombre: 'Pescado Frito', precio_actual: 24.00, categoria_id: get('Chicharrones') },
      { nombre: 'Chaufa de Langostino', precio_actual: 28.00, categoria_id: get('Chaufas') },
      { nombre: 'Chaufa de Pescado', precio_actual: 25.00, categoria_id: get('Chaufas') },
      { nombre: 'Causa Acevichada', precio_actual: 20.00, categoria_id: get('Causas') },
    ],
    skipDuplicates: true,
  });

  // Mesas
  await prisma.mesa.createMany({
    data: [1, 2, 3, 4, 5].map((n) => ({ numero: `Mesa ${n}` })),
    skipDuplicates: true,
  });

  // Categorías de movimiento
  await prisma.categoriaMovimiento.createMany({
    data: [
      { nombre: 'Venta', tipo: 'INGRESO' },
      { nombre: 'Insumos', tipo: 'EGRESO' },
      { nombre: 'Servicios', tipo: 'EGRESO' },
      { nombre: 'Otros ingresos', tipo: 'INGRESO' },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed completado');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
