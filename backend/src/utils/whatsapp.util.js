/**
 * Genera un enlace de WhatsApp con el resumen del pedido.
 * @param {string} telefono - Número del negocio (con código de país, sin +)
 * @param {object} pedido - Objeto pedido con detalles
 */
export const buildWhatsappLink = (telefono, pedido) => {
  const items = pedido.detalles
    .map((d) => `• ${d.cantidad}x ${d.producto.nombre} - S/ ${d.precio_unitario}`)
    .join('\n');

  const total = pedido.detalles.reduce(
    (sum, d) => sum + d.cantidad * parseFloat(d.precio_unitario),
    0
  );

  const mensaje = [
    `🦐 *Pedido #${pedido.id} - Puerto Criss*`,
    `👤 ${pedido.cliente?.nombre || 'Cliente'}`,
    `📦 Tipo: ${pedido.tipo}`,
    ``,
    items,
    ``,
    `💰 Total: S/ ${total.toFixed(2)}`,
  ].join('\n');

  return `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
};
