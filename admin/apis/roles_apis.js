import * as roleService from '../services/roles_services.js';

export const listRoles = async (req, res) => {
  try {
    const roles = await roleService.fetchAll();

    return res.status(200).json({
      success: true,
      message: 'Roles listados correctamente',
      data: roles,
      error: null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al listar los roles',
      data: null,
      error: error.message
    });
  }
};

export const getRoleById = async (req, res) => {
  try {
    const role = await roleService.fetchById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rol no encontrado',
        data: null,
        error: 'ROLE_NOT_FOUND'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Rol obtenido correctamente',
      data: role,
      error: null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el rol',
      data: null,
      error: error.message
    });
  }
};
