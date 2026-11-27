import userRepository from '../repositories/users_repository.js';

/**
 * Obtener todos los usuarios (sin contraseña)
 */
export const fetchAll = async () => {
  const users = await userRepository.findAll({ order: [['id', 'ASC']] });

  return users.map(user => user.toJSON());
};

/**
 * Obtener un usuario por su ID (sin contraseña)
 */
export const fetchById = async (id) => {
  const user = await userRepository.findById(id);

  if (!user) {
    return null;
  }

  return user.toJSON();
};
