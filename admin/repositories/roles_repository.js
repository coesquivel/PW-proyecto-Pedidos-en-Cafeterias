import { Role } from '../models/associations.js';

/**
 * Obtener todos los roles
 */
const findAll = async (options = {}) => {
  return await Role.findAll(options);
};

/**
 * Obtener rol por ID
 */
const findById = async (id) => {
  return await Role.findByPk(id);
};

/**
 * Obtener rol por nombre (enterprises, owner, comensal)
 */
const findByName = async (name) => {
  return await Role.findOne({ where: { name } });
};

const roleRepository = {
  findAll,
  findById,
  findByName
};

export default roleRepository;
