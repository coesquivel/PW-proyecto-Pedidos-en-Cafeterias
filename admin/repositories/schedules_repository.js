import sequelize from '../../configs/database.js';
import { StoreSchedule } from '../models/associations.js';

/**
 * Horario de un local (una fila por día)
 */
const findByStore = async (storeId) => {
  return await StoreSchedule.findAll({
    where: { store_id: storeId },
    order: [['day_of_week', 'ASC']]
  });
};

/**
 * Reemplaza el horario completo del local (los 7 días) en una transacción
 */
const replaceForStore = async (storeId, days) => {
  return await sequelize.transaction(async (transaction) => {
    await StoreSchedule.destroy({ where: { store_id: storeId }, transaction });

    await StoreSchedule.bulkCreate(
      days.map((day) => ({ ...day, store_id: storeId })),
      { transaction }
    );
  });
};

const scheduleRepository = {
  findByStore,
  replaceForStore
};

export default scheduleRepository;
