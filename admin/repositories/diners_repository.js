import { Diner, User } from '../models/associations.js';

/**
 * Obtener el perfil de comensal de un usuario
 */
const findByUserId = async (userId) => {
  return await Diner.findOne({ where: { user_id: userId } });
};

/**
 * Perfil de comensal por id, con el estado de su usuario
 */
const findByIdWithUser = async (id) => {
  return await Diner.findByPk(id, { include: [{ model: User, as: 'user', attributes: ['id', 'status'] }] });
};

const dinerRepository = {
  findByIdWithUser,
  findByUserId
};

export default dinerRepository;
