/**
 * Error de negocio con código HTTP.
 * Las APIs lo convierten en la respuesta { success:false, ... }.
 */
export const serviceError = (status, code, message) => {
  return Object.assign(new Error(message), { status, code });
};
