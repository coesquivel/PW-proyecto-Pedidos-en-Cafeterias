import { Store, StoreSchedule } from '../models/associations.js';

const includeSchedules = { model: StoreSchedule, as: 'schedules' };

/**
 * Obtener locales (con opciones: where, order, etc.) junto con su horario
 */
const findAll = async (options = {}) => {
  return await Store.findAll({ ...options, include: [includeSchedules] });
};

/**
 * Obtener local por ID (con su horario)
 */
const findById = async (id) => {
  return await Store.findByPk(id, { include: [includeSchedules] });
};

/**
 * Obtener el local de un usuario (rol enterprises)
 */
const findByUserId = async (userId) => {
  return await Store.findOne({ where: { user_id: userId } });
};

/**
 * Guarda (o quita, con null) el logo del local
 */
const setLogo = async (id, url) => {
  await Store.update({ logo_url: url }, { where: { id } });
  return await Store.findByPk(id);
};

/**
 * Guarda el estado de recepción del local (abierto | suspendido | cerrado)
 */
const setReceptionStatus = async (id, status) => {
  await Store.update({ reception_status: status }, { where: { id } });
  return await Store.findByPk(id);
};

const storeRepository = {
  setReceptionStatus,
  setLogo,
  findAll,
  findById,
  findByUserId
};

export default storeRepository;
