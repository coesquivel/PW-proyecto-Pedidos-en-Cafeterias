import sequelize from '../../configs/database.js';
import { User, Store } from '../models/associations.js';

/**
 * Comensales con su correo, estado, cantidad de pedidos y pedidos entregados
 */
const findDiners = async () => {
  return await sequelize.query(
    `SELECT d.id, d.user_id, d.first_name || ' ' || d.last_name AS name,
            u.email, u.status, u.status_reason AS reason,
            COUNT(o.id)::int AS orders,
            COUNT(o.id) FILTER (WHERE s.name = 'entregado')::int AS delivered
       FROM diners d
       JOIN users u ON u.id = d.user_id
       LEFT JOIN orders o ON o.diner_id = d.id
       LEFT JOIN order_statuses s ON s.id = o.status_id
      GROUP BY d.id, u.id
      ORDER BY d.id`,
    { type: 'SELECT' }
  );
};

/**
 * Locales aprobados (activos o suspendidos) con su correo, pedidos y rechazados
 */
const findStores = async () => {
  return await sequelize.query(
    `SELECT st.id, st.commercial_name AS name, u.email,
            st.operative_status AS status, st.status_reason AS reason,
            COUNT(o.id)::int AS orders,
            COUNT(o.id) FILTER (WHERE s.name = 'rechazado')::int AS cancelled
       FROM stores st
       JOIN users u ON u.id = st.user_id
       LEFT JOIN orders o ON o.store_id = st.id
       LEFT JOIN order_statuses s ON s.id = o.status_id
      WHERE st.operative_status IN ('activo', 'suspendido')
      GROUP BY st.id, u.id
      ORDER BY st.id`,
    { type: 'SELECT' }
  );
};

const findDinerUserId = async (dinerId) => {
  const rows = await sequelize.query('SELECT user_id FROM diners WHERE id = :dinerId', {
    replacements: { dinerId },
    type: 'SELECT'
  });
  return rows[0] ? rows[0].user_id : null;
};

const setUserStatus = async (userId, status, reason) => {
  await User.update({ status, status_reason: reason }, { where: { id: userId } });
};

const findStore = async (id) => {
  return await Store.findByPk(id);
};

const setStoreStatus = async (id, status, reason) => {
  await Store.update({ operative_status: status, status_reason: reason }, { where: { id } });
};

const ownerAccountsRepository = {
  findDiners,
  findStores,
  findDinerUserId,
  setUserStatus,
  findStore,
  setStoreStatus
};

export default ownerAccountsRepository;
