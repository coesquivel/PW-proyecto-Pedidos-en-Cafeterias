import storeRequestRepository from '../repositories/store_requests_repository.js';
import { serviceError } from './errors.js';

// activo = aprobado, pendiente = en revisión, rechazado = observado
const STATUSES = ['pendiente', 'activo', 'rechazado'];

const toView = (store) => ({
  id: store.id,
  commercial_name: store.commercial_name,
  ruc: store.ruc,
  campus: store.campus,
  campus_location: store.campus_location,
  email: store.user.email,
  phone: store.user.phone,
  status: store.operative_status
});

/**
 * Solicitudes de local (todas, o solo las de un estado)
 */
export const fetchAll = async (status) => {
  if (status !== undefined && status !== 'todos' && !STATUSES.includes(status)) {
    throw serviceError(400, 'INVALID_STATUS', `El estado debe ser: ${STATUSES.join(', ')} o todos`);
  }

  const where = status && status !== 'todos' ? { operative_status: status } : {};
  const stores = await storeRequestRepository.findAll(where);

  return stores.map(toView);
};

/**
 * Aprobar, observar o mover a revisión una solicitud.
 * Actualiza el local y su usuario: solo con estado "activo" el local puede iniciar sesión y aparecer a los comensales.
 */
export const changeStatus = async (id, status) => {
  if (!STATUSES.includes(status)) {
    throw serviceError(400, 'INVALID_STATUS', `El estado debe ser: ${STATUSES.join(', ')}`);
  }

  const store = await storeRequestRepository.findById(id);

  if (!store) {
    throw serviceError(404, 'STORE_NOT_FOUND', 'Local no encontrado');
  }

  await storeRequestRepository.updateStatus(store, status);

  return toView(await storeRequestRepository.findById(id));
};
