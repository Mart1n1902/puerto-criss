import prisma from '../prisma/client.js';
import { emitirNuevoPedido, emitirCambioEstado } from '../socket.js';

const pedidoInclude = {
  cliente: true,
  mesa: true,
  usuario: { select: { id: true, nombre: true } },
  detalles: { include: { producto: { select: { id: true, nombre: true, imagen_url: true } } } },
  pagos: true,
};

// Generador de códigos únicos legibles (ej: PC-7K4M)
const generarCodigo = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = 'PC-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const getAll = (filtros = {}) =>
  prisma.pedido.findMany({
    where: filtros,
    include: pedidoInclude,
    orderBy: { createdAt: 'desc' },
  });

export const getById = (param) => {
  const isNumeric = !isNaN(Number(param)) && !String(param).includes('-');
  if (isNumeric) {
    return prisma.pedido.findFirstOrThrow({
      where: {
        OR: [
          { id: parseInt(param) },
          { codigo: String(param).toUpperCase() }
        ]
      },
      include: pedidoInclude
    });
  }
  return prisma.pedido.findFirstOrThrow({
    where: { codigo: String(param).toUpperCase() },
    include: pedidoInclude
  });
};

export const getByCodigo = (codigo) =>
  prisma.pedido.findFirstOrThrow({
    where: { codigo: String(codigo).toUpperCase().trim() },
    include: pedidoInclude,
  });

export const create = async ({
  cliente,
  detalles,
  tipo,
  direccion,
  referencia,
  notas,
  mesa_id,
  sesion_caja_id,
  usuario_id,
}) => {
  if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
    throw { status: 400, message: 'El pedido debe incluir al menos un producto' };
  }

  // SEGURIDAD: Obtener precios oficiales desde la base de datos para evitar manipulación de precios desde el cliente
  const productIds = detalles.map((d) => parseInt(d.producto_id)).filter((id) => !isNaN(id));
  const productosEnDB = await prisma.producto.findMany({
    where: { id: { in: productIds } },
  });

  const productosMap = new Map(productosEnDB.map((p) => [p.id, p]));

  const detallesValidados = detalles.map((d) => {
    const prodId = parseInt(d.producto_id);
    const prod = productosMap.get(prodId);
    if (!prod) {
      throw { status: 400, message: `El producto ID ${d.producto_id} no existe o no está disponible` };
    }
    const cantidad = Math.max(1, parseInt(d.cantidad) || 1);
    const precioUnitario = parseFloat(prod.precio_actual);

    return {
      producto_id: prodId,
      cantidad,
      precio_unitario: precioUnitario,
    };
  });

  // Manejo seguro de cliente por teléfono
  let clienteRecord = null;
  if (cliente?.nombre) {
    const telefono = cliente.telefono?.trim();
    if (telefono) {
      const existente = await prisma.cliente.findFirst({
        where: { telefono },
      });
      if (existente) {
        clienteRecord = await prisma.cliente.update({
          where: { id: existente.id },
          data: { nombre: cliente.nombre.trim() },
        });
      } else {
        clienteRecord = await prisma.cliente.create({
          data: { nombre: cliente.nombre.trim(), telefono },
        });
      }
    } else {
      clienteRecord = await prisma.cliente.create({
        data: { nombre: cliente.nombre.trim() },
      });
    }
  }

  const parsedMesaId = mesa_id ? parseInt(mesa_id) : null;

  // Si se asigna a una mesa, marcarla como ocupada
  if (parsedMesaId) {
    await prisma.mesa
      .update({
        where: { id: parsedMesaId },
        data: { estado: 'OCUPADA' },
      })
      .catch(() => {});
  }

  // Generar código único aleatorio
  let codigo = generarCodigo();
  let reintentos = 0;
  while (await prisma.pedido.findUnique({ where: { codigo } }).catch(() => null) && reintentos < 5) {
    codigo = generarCodigo();
    reintentos++;
  }

  const nuevoPedido = await prisma.pedido.create({
    data: {
      codigo,
      tipo,
      direccion: direccion || null,
      referencia: referencia || null,
      notas: notas || null,
      mesa_id: parsedMesaId,
      sesion_caja_id: sesion_caja_id ? parseInt(sesion_caja_id) : null,
      usuario_id: usuario_id ? parseInt(usuario_id) : null,
      cliente_id: clienteRecord?.id ?? null,
      detalles: {
        create: detallesValidados,
      },
    },
    include: pedidoInclude,
  });

  // Notificar a Cocina y Mozos en tiempo real
  emitirNuevoPedido(nuevoPedido);

  return nuevoPedido;
};

export const cambiarEstado = async (id, estado) => {
  const pedido = await prisma.pedido.update({
    where: { id },
    data: { estado },
    include: pedidoInclude,
  });

  // Notificar cambio de estado a cliente y pantallas en tiempo real
  emitirCambioEstado(pedido);

  // Al entregar, registrar ingreso automático en caja si hay sesión activa y no existe ya un registro
  if (estado === 'ENTREGADO' && pedido.sesion_caja_id) {
    const total = pedido.detalles.reduce(
      (sum, d) => sum + d.cantidad * parseFloat(d.precio_unitario),
      0
    );

    const movExistente = await prisma.movimientoCaja.findFirst({
      where: {
        sesion_caja_id: pedido.sesion_caja_id,
        descripcion: `Pedido #${id}`,
      },
    });

    if (!movExistente && total > 0) {
      const catIngreso = await prisma.categoriaMovimiento.findFirst({
        where: { tipo: 'INGRESO' },
      });
      if (catIngreso) {
        await prisma.movimientoCaja.create({
          data: {
            sesion_caja_id: pedido.sesion_caja_id,
            categoria_movimiento_id: catIngreso.id,
            monto: total,
            descripcion: `Pedido #${id}`,
          },
        });
      }
    }
  }

  return pedido;
};

export const registrarPago = async (pedido_id, { metodo, monto }) =>
  prisma.pago.create({ data: { pedido_id, metodo, monto } });
