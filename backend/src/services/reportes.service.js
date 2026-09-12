import prisma from '../prisma/client.js';

const inicioDia = (fecha = new Date()) => {
  const d = new Date(fecha);
  d.setHours(0, 0, 0, 0);
  return d;
};

const finDia = (fecha = new Date()) => {
  const d = new Date(fecha);
  d.setHours(23, 59, 59, 999);
  return d;
};

const inicioSemana = (fecha = new Date()) => {
  const d = new Date(fecha);
  const dia = d.getDay();
  d.setDate(d.getDate() - (dia === 0 ? 6 : dia - 1));
  d.setHours(0, 0, 0, 0);
  return d;
};

const inicioMes = (fecha = new Date()) => {
  const d = new Date(fecha);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const calcularVentas = async (desde, hasta) => {
  const pedidos = await prisma.pedido.findMany({
    where: { createdAt: { gte: desde, lte: hasta }, estado: { not: 'CANCELADO' } },
    include: { detalles: true },
  });
  return pedidos.reduce(
    (sum, p) => sum + p.detalles.reduce((s, d) => s + d.cantidad * parseFloat(d.precio_unitario), 0),
    0
  );
};

const calcularGastos = async (desde, hasta) => {
  const movs = await prisma.movimientoCaja.findMany({
    where: { createdAt: { gte: desde, lte: hasta } },
    include: { categoria_movimiento: true },
  });
  return movs
    .filter((m) => m.categoria_movimiento.tipo === 'EGRESO')
    .reduce((sum, m) => sum + parseFloat(m.monto), 0);
};

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const getDashboard = async () => {
  const desde = inicioDia();

  const [pedidosHoy, movimientos, topProductos] = await Promise.all([
    prisma.pedido.findMany({
      where: { createdAt: { gte: desde }, estado: { not: 'CANCELADO' } },
      include: { detalles: true },
    }),
    prisma.movimientoCaja.findMany({
      where: { createdAt: { gte: desde } },
      include: { categoria_movimiento: true },
    }),
    prisma.detallePedido.groupBy({
      by: ['producto_id'],
      _sum: { cantidad: true },
      orderBy: { _sum: { cantidad: 'desc' } },
      take: 5,
    }),
  ]);

  const ventas = pedidosHoy.reduce(
    (sum, p) => sum + p.detalles.reduce((s, d) => s + d.cantidad * parseFloat(d.precio_unitario), 0),
    0
  );
  const gastos = movimientos
    .filter((m) => m.categoria_movimiento.tipo === 'EGRESO')
    .reduce((sum, m) => sum + parseFloat(m.monto), 0);

  const productosIds = topProductos.map((t) => t.producto_id);
  const productos = await prisma.producto.findMany({
    where: { id: { in: productosIds } },
    select: { id: true, nombre: true },
  });

  return {
    ventas,
    gastos,
    ganancia: ventas - gastos,
    pedidos: pedidosHoy.length,
    ticket_promedio: pedidosHoy.length ? ventas / pedidosHoy.length : 0,
    top_productos: topProductos.map((t) => ({
      ...t,
      nombre: productos.find((p) => p.id === t.producto_id)?.nombre,
    })),
  };
};

// ─── KPIs ─────────────────────────────────────────────────────────────────────

export const getKpis = async () => {
  const ahora = new Date();

  const [
    ventasDia, gastosDia,
    ventasSemana, gastosSemana,
    ventasMes, gastosMes,
  ] = await Promise.all([
    calcularVentas(inicioDia(ahora), finDia(ahora)),
    calcularGastos(inicioDia(ahora), finDia(ahora)),
    calcularVentas(inicioSemana(ahora), ahora),
    calcularGastos(inicioSemana(ahora), ahora),
    calcularVentas(inicioMes(ahora), ahora),
    calcularGastos(inicioMes(ahora), ahora),
  ]);

  return {
    dia: {
      ventas: ventasDia,
      gastos: gastosDia,
      ganancia: ventasDia - gastosDia,
      margen: ventasDia > 0 ? ((ventasDia - gastosDia) / ventasDia) * 100 : 0,
    },
    semana: {
      ventas: ventasSemana,
      gastos: gastosSemana,
      ganancia: ventasSemana - gastosSemana,
      margen: ventasSemana > 0 ? ((ventasSemana - gastosSemana) / ventasSemana) * 100 : 0,
    },
    mes: {
      ventas: ventasMes,
      gastos: gastosMes,
      ganancia: ventasMes - gastosMes,
      margen: ventasMes > 0 ? ((ventasMes - gastosMes) / ventasMes) * 100 : 0,
    },
  };
};

// ─── Ventas por día (últimos N días) ─────────────────────────────────────────

export const getVentasPorDia = async (dias = 7) => {
  const desde = new Date();
  desde.setDate(desde.getDate() - dias);
  const rows = await prisma.$queryRaw`
    SELECT DATE(p.created_at AT TIME ZONE 'America/Lima') as fecha, SUM(d.cantidad * d.precio_unitario) as total,
           COUNT(DISTINCT p.id) as pedidos
    FROM pedidos p
    JOIN detalle_pedido d ON d.pedido_id = p.id
    WHERE p.created_at >= ${desde} AND p.estado != 'CANCELADO'
    GROUP BY DATE(p.created_at AT TIME ZONE 'America/Lima')
    ORDER BY fecha ASC
  `;
  // Convertir BigInt a Number para que JSON.stringify funcione
  return rows.map((r) => ({
    fecha: r.fecha,
    total: Number(r.total),
    pedidos: Number(r.pedidos),
  }));
};

// ─── Comparativa semanal (últimas N semanas) ──────────────────────────────────

export const getComparativaSemanal = async (semanas = 4) => {
  const resultado = [];
  const ahora = new Date();

  for (let i = semanas - 1; i >= 0; i--) {
    const inicioS = new Date(inicioSemana(ahora));
    inicioS.setDate(inicioS.getDate() - i * 7);
    const finS = new Date(inicioS);
    finS.setDate(finS.getDate() + 6);
    finS.setHours(23, 59, 59, 999);

    const [ventas, gastos] = await Promise.all([
      calcularVentas(inicioS, finS),
      calcularGastos(inicioS, finS),
    ]);

    resultado.push({
      semana: `Sem ${semanas - i}`,
      desde: inicioS.toISOString().split('T')[0],
      hasta: finS.toISOString().split('T')[0],
      ventas,
      gastos,
      ganancia: ventas - gastos,
    });
  }

  return resultado;
};

// ─── Gastos por categoría ─────────────────────────────────────────────────────

export const getGastosPorCategoria = async (desde, hasta) => {
  const movs = await prisma.movimientoCaja.findMany({
    where: {
      createdAt: { gte: new Date(desde), lte: new Date(hasta) },
    },
    include: { categoria_movimiento: true },
  });

  const agrupado = {};
  for (const m of movs) {
    const key = m.categoria_movimiento.nombre;
    const tipo = m.categoria_movimiento.tipo;
    if (!agrupado[key]) agrupado[key] = { nombre: key, tipo, total: 0 };
    agrupado[key].total += parseFloat(m.monto);
  }

  return Object.values(agrupado).sort((a, b) => b.total - a.total);
};

// ─── Exportación de Ventas a Formato CSV ──────────────────────────────────────

export const exportarVentasCSV = async ({ desde, hasta } = {}) => {
  const where = { estado: { not: 'CANCELADO' } };
  if (desde || hasta) {
    where.createdAt = {};
    if (desde) where.createdAt.gte = new Date(desde);
    if (hasta) {
      const h = new Date(hasta);
      h.setHours(23, 59, 59, 999);
      where.createdAt.lte = h;
    }
  }

  const pedidos = await prisma.pedido.findMany({
    where,
    include: {
      cliente: true,
      mesa: true,
      detalles: { include: { producto: true } },
      pagos: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const header = ['ID Pedido', 'Codigo', 'Fecha y Hora', 'Tipo', 'Cliente', 'Telefono', 'Mesa / Direccion', 'Productos', 'Total (S/)', 'Estado', 'Metodo de Pago'];

  const rows = pedidos.map((p) => {
    const fecha = new Date(p.createdAt).toLocaleString('es-PE', { timeZone: 'America/Lima' });
    const productosStr = p.detalles.map((d) => `${d.cantidad}x ${d.producto.nombre}`).join(' | ');
    const total = p.detalles.reduce((sum, d) => sum + d.cantidad * parseFloat(d.precio_unitario), 0).toFixed(2);
    const destino = p.tipo === 'MESA' ? `Mesa ${p.mesa?.numero || '-'}` : (p.direccion || '-');
    const metodoPago = p.pagos.map((pg) => pg.metodo).join(', ') || 'Pendiente';

    return [
      p.id,
      p.codigo || '-',
      `"${fecha}"`,
      p.tipo,
      `"${(p.cliente?.nombre || 'Anonimo').replace(/"/g, '""')}"`,
      `"${p.cliente?.telefono || '-'}"`,
      `"${destino.replace(/"/g, '""')}"`,
      `"${productosStr.replace(/"/g, '""')}"`,
      total,
      p.estado,
      `"${metodoPago}"`,
    ].join(',');
  });

  // UTF-8 BOM para soporte de tildes y caracteres en Microsoft Excel
  return '\uFEFF' + [header.join(','), ...rows].join('\n');
};

