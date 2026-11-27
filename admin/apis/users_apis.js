import * as userService from '../services/users_services.js';

export const listUsers = async (req, res) => {
  try {
    const users = await userService.fetchAll();

    return res.status(200).json({
      success: true,
      message: 'Usuarios listados correctamente',
      data: users,
      error: null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al listar los usuarios',
      data: null,
      error: error.message
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await userService.fetchById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
        data: null,
        error: 'USER_NOT_FOUND'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Usuario obtenido correctamente',
      data: user,
      error: null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el usuario',
      data: null,
      error: error.message
    });
  }
};
