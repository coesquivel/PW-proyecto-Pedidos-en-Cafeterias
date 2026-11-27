import storeRepository from '../repositories/stores_repository.js';
import { saveImage, removeImage } from './images_services.js';
import { fetchRatingsByStore } from './reviews_services.js';
import { normalizeSchedule, storeStatus } from './schedule_rules.js';
import { serviceError } from './errors.js';

export const RECEPTION_STATUSES = ['abierto', 'suspendido', 'cerrado'];

/**
 * Local + su horario y si está abierto ahora (hora de Lima)
 */
const withSchedule = (store, ratings = {}) => {
  const { schedules, ...data } = store.toJSON();
  const schedule = normalizeSchedule(schedules);
  const rating = ratings[store.id] || { average: null, total: 0 };

  const status = storeStatus(schedule);

  // "Cerrado" lo fuerza el dueño: aunque el horario esté en curso, el comensal lo ve cerrado
  if (data.reception_status === 'cerrado') {
    status.open_now = false;
  }

  return { ...data, schedule, ...status, rating_average: rating.average, rating_count: rating.total };
};

/**
 * Obtener los locales activos (los que ve el comensal)
 */
export const fetchAllActive = async () => {
  const stores = await storeRepository.findAll({
    where: { operative_status: 'activo' },
    order: [['id', 'ASC']]
  });

  const ratings = await fetchRatingsByStore();

  return stores.map((store) => withSchedule(store, ratings));
};

/**
 * Obtener un local activo por su ID
 */
export const fetchActiveById = async (id) => {
  const store = await storeRepository.findById(id);

  if (!store || store.operative_status !== 'activo') {
    return null;
  }

  return withSchedule(store, await fetchRatingsByStore());
};

/**
 * Obtener el local que pertenece a un usuario
 */
export const fetchByUserId = async (userId) => {
  const store = await storeRepository.findByUserId(userId);

  if (!store) {
    return null;
  }

  return store.toJSON();
};

/**
 * Poner o cambiar el logo del local (data URL). El logo anterior se borra del disco.
 */
export const setLogo = async (store, image) => {
  const url = await saveImage(image, 'stores');

  try {
    const updated = await storeRepository.setLogo(store.id, url);
    await removeImage(store.logo_url);
    return updated.toJSON();
  } catch (error) {
    await removeImage(url);
    throw error;
  }
};

/**
 * Cambiar el estado de recepción del local. Suspender o cerrar no cancela los pedidos ya aceptados.
 */
export const setReceptionStatus = async (store, status) => {
  if (!RECEPTION_STATUSES.includes(status)) {
    throw serviceError(400, 'INVALID_STATUS', 'El estado debe ser abierto, suspendido o cerrado');
  }

  const updated = await storeRepository.setReceptionStatus(store.id, status);

  return updated.toJSON();
};

export const clearLogo = async (store) => {
  const updated = await storeRepository.setLogo(store.id, null);
  await removeImage(store.logo_url);

  return updated.toJSON();
};
