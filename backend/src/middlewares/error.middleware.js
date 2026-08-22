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

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
  });
};
