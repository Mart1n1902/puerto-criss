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

export const getAll = ({ limit, ...where } = {}) =>
  prisma.pedido.findMany({
    where,
    include: pedidoInclude,
    orderBy: { createdAt: 'desc' },
    take: Math.min(Math.max(parseInt(limit) || 200, 1), 500),
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

const TIPOS_VALIDOS = ['DELIVERY', 'RECOJO', 'MESA'];
const METODOS_PAGO_VALIDOS = ['EFECTIVO', 'YAPE', 'TARJETA'];
const TRANSICIONES_VALIDAS = {
  PENDIENTE: ['PREPARANDO', 'LISTO', 'ENTREGADO', 'CANCELADO'],
  PREPARANDO: ['LISTO', 'ENTREGADO', 'CANCELADO'],
  LISTO: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: [],
};

export const create = async ({
  cliente,
  detalles,
  tipo,
  direccion,
  referencia,
  notas,
  mesa_id,
  usuario_id,
}) => {
  if (!TIPOS_VALIDOS.includes(tipo)) {
    throw { status: 400, message: `Tipo de pedido inválido. Permitidos: ${TIPOS_VALIDOS.join(', ')}` };
  }
  if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
    throw { status: 400, message: 'El pedido debe incluir al menos un producto' };
  }

  // Agrupar cantidades por producto_id para evitar colisión en la clave compuesta (pedido_id, producto_id)
  const cantidadesPorProducto = new Map();
  for (const d of detalles) {
    const prodId = parseInt(d.producto_id);
    if (!Number.isInteger(prodId) || prodId <= 0) {
      throw { status: 400, message: `Producto ID inválido: ${d.producto_id}` };
    }
    const cantidad = Math.max(1, parseInt(d.cantidad) || 1);
    cantidadesPorProducto.set(prodId, (cantidadesPorProducto.get(prodId) || 0) + cantidad);
  }

  // SEGURIDAD: Obtener precios oficiales y verificar disponibilidad desde la base de datos
  const productIds = Array.from(cantidadesPorProducto.keys());
  const productosEnDB = await prisma.producto.findMany({
    where: { id: { in: productIds }, disponible: true },
  });

  const productosMap = new Map(productosEnDB.map((p) => [p.id, p]));

  const detallesValidados = productIds.map((prodId) => {
    const prod = productosMap.get(prodId);
    if (!prod) {
      throw { status: 400, message: `El producto ID ${prodId} no existe o no está disponible` };
    }
    return {
      producto_id: prodId,
      cantidad: cantidadesPorProducto.get(prodId),
      precio_unitario: parseFloat(prod.precio_actual),
    };
  });

  // Ejecutar operaciones atómicamente dentro de una transacción
  const nuevoPedido = await prisma.$transaction(async (tx) => {
    // 1. Manejo seguro de cliente por teléfono
    let clienteRecord = null;
    if (cliente?.nombre) {
      const telefono = cliente.telefono?.trim();
      if (telefono) {
        const existente = await tx.cliente.findFirst({
          where: { telefono },
        });
        if (existente) {
          clienteRecord = await tx.cliente.update({
            where: { id: existente.id },
            data: { nombre: cliente.nombre.trim() },
          });
        } else {
          clienteRecord = await tx.cliente.create({
            data: { nombre: cliente.nombre.trim(), telefono },
          });
        }
      } else {
        clienteRecord = await tx.cliente.create({
          data: { nombre: cliente.nombre.trim() },
        });
      }
    }

    const parsedMesaId = mesa_id ? parseInt(mesa_id) : null;

    // 2. Verificar mesa y marcarla como ocupada si corresponde
    if (parsedMesaId) {
      const mesa = await tx.mesa.findUnique({ where: { id: parsedMesaId } });
      if (!mesa) {
        throw { status: 404, message: 'La mesa seleccionada no existe' };
      }
      await tx.mesa.update({
        where: { id: parsedMesaId },
        data: { estado: 'OCUPADA' },
      });
    }

    // 3. Vincular sesión de caja activa desde el servidor (no confiar en el cliente)
    const sesionActiva = await tx.sesionCaja.findFirst({
      where: { estado: 'ABIERTA' },
      select: { id: true },
    });

    // 4. Generar código único aleatorio
    let codigo = generarCodigo();
    let reintentos = 0;
    while (await tx.pedido.findUnique({ where: { codigo } }) && reintentos < 10) {
      codigo = generarCodigo();
      reintentos++;
    }
    if (await tx.pedido.findUnique({ where: { codigo } })) {
      throw { status: 500, message: 'No se pudo generar un código único para el pedido, intenta nuevamente' };
    }

    // 5. Crear el pedido y sus detalles
    return tx.pedido.create({
      data: {
        codigo,
        tipo,
        direccion: direccion || null,
        referencia: referencia || null,
        notas: notas || null,
        mesa_id: parsedMesaId,
        sesion_caja_id: sesionActiva?.id ?? null,
        usuario_id: usuario_id || null,
        cliente_id: clienteRecord?.id ?? null,
        detalles: {
          create: detallesValidados,
        },
      },
      include: pedidoInclude,
    });
  });

  // Notificar a Cocina y Mozos en tiempo real mediante WebSocket seguro
  emitirNuevoPedido(nuevoPedido);

  return nuevoPedido;
};

export const cambiarEstado = async (id, estado) => {
  if (!Object.prototype.hasOwnProperty.call(TRANSICIONES_VALIDAS, estado)) {
    throw { status: 400, message: `Estado de pedido inválido: ${estado}` };
  }

  const pedido = await prisma.$transaction(async (tx) => {
    const actual = await tx.pedido.findUniqueOrThrow({
      where: { id },
      select: { id: true, estado: true, mesa_id: true, sesion_caja_id: true },
    });

    if (actual.estado === estado) {
      return tx.pedido.findUniqueOrThrow({ where: { id }, include: pedidoInclude });
    }

    if (!TRANSICIONES_VALIDAS[actual.estado].includes(estado)) {
      throw { status: 400, message: `No se puede cambiar un pedido de ${actual.estado} a ${estado}` };
    }

    const ped = await tx.pedido.update({
      where: { id },
      data: { estado },
      include: pedidoInclude,
    });

    // Liberar mesa si el pedido finaliza y no quedan otros pedidos activos en esa mesa
    if ((estado === 'ENTREGADO' || estado === 'CANCELADO') && ped.mesa_id) {
      const otrosActivos = await tx.pedido.count({
        where: {
          mesa_id: ped.mesa_id,
          id: { not: ped.id },
          estado: { notIn: ['ENTREGADO', 'CANCELADO'] },
        },
      });
      if (otrosActivos === 0) {
        await tx.mesa.update({
          where: { id: ped.mesa_id },
          data: { estado: 'LIBRE' },
        });
      }
    }

    // Al entregar, registrar ingreso automático en caja si la sesión sigue abierta y no existe ya un registro
    if (estado === 'ENTREGADO' && ped.sesion_caja_id) {
      const sesion = await tx.sesionCaja.findUnique({
        where: { id: ped.sesion_caja_id },
        select: { estado: true },
      });

      if (sesion?.estado === 'ABIERTA') {
        const total = ped.detalles.reduce(
          (sum, d) => sum + d.cantidad * parseFloat(d.precio_unitario),
          0
        );

        const movExistente = await tx.movimientoCaja.findFirst({
          where: {
            sesion_caja_id: ped.sesion_caja_id,
            descripcion: `Pedido #${id}`,
          },
        });

        if (!movExistente && total > 0) {
          const catIngreso = await tx.categoriaMovimiento.findFirst({
            where: { tipo: 'INGRESO' },
          });
          if (catIngreso) {
            await tx.movimientoCaja.create({
              data: {
                sesion_caja_id: ped.sesion_caja_id,
                categoria_movimiento_id: catIngreso.id,
                monto: total,
                descripcion: `Pedido #${id}`,
              },
            });
          }
        }
      }
    }

    return ped;
  }, { isolationLevel: 'Serializable' });

  // Notificar cambio de estado a cliente y pantallas en tiempo real
  emitirCambioEstado(pedido);

  return pedido;
};

export const registrarPago = async (pedido_id, { metodo, monto }) => {
  if (!METODOS_PAGO_VALIDOS.includes(metodo)) {
    throw { status: 400, message: `Método de pago inválido. Permitidos: ${METODOS_PAGO_VALIDOS.join(', ')}` };
  }
  const ped = await prisma.pedido.findUniqueOrThrow({
    where: { id: pedido_id },
    select: { id: true, estado: true },
  });
  if (ped.estado === 'CANCELADO') {
    throw { status: 400, message: 'No se puede registrar un pago para un pedido cancelado' };
  }
  return prisma.pago.create({ data: { pedido_id, metodo, monto } });
};

