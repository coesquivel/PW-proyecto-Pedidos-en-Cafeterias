import { User, Role } from '../models/associations.js';

const includeRole = { model: Role, as: 'role' };

/**
 * Obtener todos los usuarios (sin contraseña) con su rol
 */
const findAll = async (options = {}) => {
  return await User.findAll({ include: [includeRole], ...options });
};

/**
 * Contar usuarios
 */
const count = async (where = {}) => {
  return await User.count({ where });
};

/**
 * Obtener usuario por ID (sin contraseña) con su rol
 */
const findById = async (id) => {
  return await User.findByPk(id, { include: [includeRole] });
};

/**
 * Obtener usuario por correo CON contraseña (para el login)
 */
const findByEmailWithPassword = async (email) => {
  return await User.scope('withPassword').findOne({
    where: { email },
    include: [includeRole]
  });
};

const userRepository = {
  findAll,
  count,
  findById,
  findByEmailWithPassword
};

export default userRepository;
