import roleRepository from '../repositories/roles_repository.js';

/**
 * Obtener todos los roles
 */
export const fetchAll = async () => {
  const roles = await roleRepository.findAll({ order: [['id', 'ASC']] });

  return roles.map(role => role.toJSON());
};

/**
 * Obtener un rol por su ID
 */
export const fetchById = async (id) => {
  const role = await roleRepository.findById(id);

  if (!role) {
    return null;
  }

  return role.toJSON();
};
