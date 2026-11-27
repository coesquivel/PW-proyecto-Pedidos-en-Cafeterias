import * as profileService from '../services/store_profile_services.js';
import { ok, fail, parseId } from './responses.js';

export const getMyProfile = async (req, res) => {
  try {
    return ok(res, 'Perfil obtenido correctamente', await profileService.fetchProfile(req.store.id));
  } catch (error) {
    return fail(res, error, 'Error al obtener el perfil');
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    return ok(res, 'Perfil actualizado correctamente', await profileService.updateProfile(req.store, req.body || {}));
  } catch (error) {
    return fail(res, error, 'Error al actualizar el perfil');
  }
};

export const addMyPhoto = async (req, res) => {
  try {
    const photo = await profileService.addPhoto(req.store, req.body?.image);

    return ok(res, 'Fotografía agregada correctamente', photo, 201);
  } catch (error) {
    return fail(res, error, 'Error al agregar la fotografía');
  }
};

export const deleteMyPhoto = async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({ success: false, message: 'ID inválido', data: null, error: 'INVALID_ID' });
    }

    await profileService.removePhoto(req.store, id);

    return ok(res, 'Fotografía eliminada correctamente');
  } catch (error) {
    return fail(res, error, 'Error al eliminar la fotografía');
  }
};
