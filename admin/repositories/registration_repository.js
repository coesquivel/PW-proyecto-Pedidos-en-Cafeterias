import sequelize from '../../configs/database.js';
import { User, Diner, Store } from '../models/associations.js';

/**
 * Crea el usuario y su perfil de comensal en una transacción
 */
const createDiner = async ({ user, diner }) => {
  return await sequelize.transaction(async (transaction) => {
    const createdUser = await User.create(user, { transaction });
    await Diner.create({ ...diner, user_id: createdUser.id }, { transaction });

    return createdUser.id;
  });
};

/**
 * Crea el usuario y el local (pendiente de aprobación) en una transacción
 */
const createStore = async ({ user, store }) => {
  return await sequelize.transaction(async (transaction) => {
    const createdUser = await User.create(user, { transaction });
    await Store.create({ ...store, user_id: createdUser.id }, { transaction });

    return createdUser.id;
  });
};

const findUserByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};

const findStoreByRuc = async (ruc) => {
  return await Store.findOne({ where: { ruc } });
};

const registrationRepository = {
  createDiner,
  createStore,
  findUserByEmail,
  findStoreByRuc
};

export default registrationRepository;
