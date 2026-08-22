import Groq from 'groq-sdk';

export const generarResumen = async (kpis, topProductos, comparativa) => {
  const top = topProductos?.slice(0, 3).map((p) => `${p.nombre} (${p._sum.cantidad} vendidos)`).join(', ') || 'sin datos';

  const semanaActual = comparativa?.[comparativa.length - 1];
  const semanaAnterior = comparativa?.[comparativa.length - 2];
  const variacion = semanaActual && semanaAnterior && semanaAnterior.ventas > 0
    ? (((semanaActual.ventas - semanaAnterior.ventas) / semanaAnterior.ventas) * 100).toFixed(1)
    : null;

  const prompt = `
Eres el asistente de un pequeño restaurante de ceviche llamado "Puerto Criss" en Perú.
Tu trabajo es explicarle al dueño cómo va su negocio de forma simple, clara y amigable.
Usa soles peruanos (S/). Sé breve, máximo 5 oraciones. No uses tecnicismos.

Datos del negocio:

HOY:
- Ventas: S/ ${kpis.dia.ventas.toFixed(2)}
- Gastos: S/ ${kpis.dia.gastos.toFixed(2)}
- Ganancia: S/ ${kpis.dia.ganancia.toFixed(2)}
- Margen: ${kpis.dia.margen.toFixed(1)}%

ESTA SEMANA:
- Ventas: S/ ${kpis.semana.ventas.toFixed(2)}
- Gastos: S/ ${kpis.semana.gastos.toFixed(2)}
- Ganancia: S/ ${kpis.semana.ganancia.toFixed(2)}

ESTE MES:
- Ventas: S/ ${kpis.mes.ventas.toFixed(2)}
- Gastos: S/ ${kpis.mes.gastos.toFixed(2)}
- Ganancia: S/ ${kpis.mes.ganancia.toFixed(2)}

PRODUCTOS MÁS VENDIDOS HOY: ${top}
${variacion ? `COMPARADO CON LA SEMANA PASADA: las ventas ${+variacion >= 0 ? 'subieron' : 'bajaron'} un ${Math.abs(+variacion)}%` : ''}

Escribe el resumen en español, de forma directa y positiva cuando corresponda. Si hay pérdidas, menciona que hay que revisar los gastos sin alarmar.
`;

  try {
    const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 600,
    });

    return response.choices[0]?.message?.content || 'No se pudo generar el resumen.';
  } catch (error) {
    console.error('Error al generar resumen con IA:', error?.message || error);
    // Resumen local de contingencia
    const estadoHoy = kpis.dia.ganancia >= 0 ? 'ganancia' : 'pérdida';
    return `Hoy registramos S/ ${kpis.dia.ventas.toFixed(2)} en ventas y S/ ${kpis.dia.gastos.toFixed(2)} en gastos, cerrando con una ${estadoHoy} de S/ ${Math.abs(kpis.dia.ganancia).toFixed(2)}. ${top !== 'sin datos' ? `Los platos más pedidos fueron: ${top}.` : ''} En lo que va del mes acumulamos S/ ${kpis.mes.ventas.toFixed(2)} en ventas.`;
  }
};
