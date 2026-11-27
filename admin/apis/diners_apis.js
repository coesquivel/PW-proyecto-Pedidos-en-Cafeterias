import dinerRepository from '../repositories/diners_repository.js';
import { fail } from './responses.js';

/**
 * Middleware: busca el perfil de comensal del usuario en sesión y lo deja en req.diner
 * (solo para rutas del rol comensal).
 */
export const loadMyDiner = async (req, res, next) => {
  try {
    const userId = req.session?.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Vuelve a iniciar sesión',
        data: null,
        error: 'SESSION_NOT_FOUND'
      });
    }

    const diner = await dinerRepository.findByUserId(userId);

    if (!diner) {
      return res.status(404).json({
        success: false,
        message: 'Tu usuario no tiene un perfil de comensal',
        data: null,
        error: 'DINER_NOT_FOUND'
      });
    }

    req.diner = diner;
    next();
  } catch (error) {
    return fail(res, error, 'Error al obtener tu perfil de comensal');
  }
};
