import * as profileService from '../services/profile_services.js';
import { ok, fail } from './responses.js';

export const getMe = async (req, res) => {
  try {
    const profile = await profileService.fetchSessionProfile(req.session.user);

    return ok(res, 'Perfil obtenido correctamente', profile);
  } catch (error) {
    return fail(res, error, 'Error al obtener el perfil');
  }
};
