import sequelize from '../../configs/database.js';
import { Store, User } from '../models/associations.js';

const includeUser = { model: User, as: 'user', attributes: ['id', 'email', 'phone', 'status'] };

/**
 * Locales con los datos de su usuario (para revisar solicitudes)
 */
const findAll = async (where = {}) => {
  return await Store.findAll({ where, include: [includeUser], order: [['id', 'DESC']] });
};

const findById = async (id) => {
  return await Store.findByPk(id, { include: [includeUser] });
};

/**
 * Cambia el estado del local y el de su usuario a la vez (transacción)
 */
const updateStatus = async (store, status) => {
  return await sequelize.transaction(async (transaction) => {
    await store.update({ operative_status: status }, { transaction });
    await User.update({ status }, { where: { id: store.user_id }, transaction });
  });
};

const storeRequestRepository = {
  findAll,
  findById,
  updateStatus
};

export default storeRequestRepository;
