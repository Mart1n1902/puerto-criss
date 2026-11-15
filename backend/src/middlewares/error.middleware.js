export const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Error de Prisma: registro no encontrado
  if (err.code === 'P2025') {
    return res.status(404).json({ success: false, message: 'Registro no encontrado' });
  }

  // Error de Prisma: violación de unicidad
  if (err.code === 'P2002') {
    return res.status(409).json({ success: false, message: 'Ya existe un registro con ese valor' });
  }

  // Error de Prisma: referencia inválida (FK)
  if (err.code === 'P2003') {
    return res.status(400).json({ success: false, message: 'Referencia inválida a un registro relacionado' });
  }

  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';
  const message = status >= 500 && isProd
    ? 'Error interno del servidor'
    : (err.message || 'Error interno del servidor');

  res.status(status).json({
    success: false,
    message,
  });
};
