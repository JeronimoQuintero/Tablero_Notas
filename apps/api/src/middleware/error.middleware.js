export const notFound = (req, res) => res.status(404).json({ message: 'Ruta no encontrada' });
export const errorHandler = (error, req, res, next) => { console.error(error.message); res.status(error.status || 500).json({ message: error.status ? error.message : 'Error interno del servidor' }); };
