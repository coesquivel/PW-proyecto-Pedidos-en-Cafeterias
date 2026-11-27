/**
 * Respuestas JSON con el formato { success, message, data, error }
 */
export const ok = (res, message, data = null, status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
    error: null
  });
};

/**
 * Respuesta de error. Si el error viene de un servicio (tiene status)
 * se usa su código y mensaje; si no, es un error inesperado (500).
 */
export const fail = (res, error, fallbackMessage) => {
  const status = error.status || 500;

  return res.status(status).json({
    success: false,
    message: error.status ? error.message : fallbackMessage,
    data: null,
    error: error.code || error.message
  });
};

/**
 * Convierte un parámetro de ruta en entero; devuelve null si no lo es.
 */
export const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};
