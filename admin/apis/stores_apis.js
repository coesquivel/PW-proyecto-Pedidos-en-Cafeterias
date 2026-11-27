import * as storeService from '../services/stores_services.js';
import { ok, fail, parseId } from './responses.js';

/**
 * Middleware: busca el local del usuario en sesión y lo deja en req.store
 * (solo para rutas del rol enterprises).
 */
export const loadMyStore = async (req, res, next) => {
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

    const store = await storeService.fetchByUserId(userId);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Tu usuario no tiene un local asociado',
        data: null,
        error: 'STORE_NOT_FOUND'
      });
    }

    req.store = store;
    next();
  } catch (error) {
    return fail(res, error, 'Error al obtener tu local');
  }
};

export const listStores = async (req, res) => {
  try {
    const stores = await storeService.fetchAllActive();

    return ok(res, 'Locales listados correctamente', stores);
  } catch (error) {
    return fail(res, error, 'Error al listar los locales');
  }
};

export const getStoreById = async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false, message: 'ID inválido', data: null, error: 'INVALID_ID'
      });
    }

    const store = await storeService.fetchActiveById(id);

    if (!store) {
      return res.status(404).json({
        success: false, message: 'Local no encontrado', data: null, error: 'STORE_NOT_FOUND'
      });
    }

    return ok(res, 'Local obtenido correctamente', store);
  } catch (error) {
    return fail(res, error, 'Error al obtener el local');
  }
};

export const getMyStore = async (req, res) => {
  return ok(res, 'Local obtenido correctamente', req.store);
};

export const setMyReceptionStatus = async (req, res) => {
  try {
    return ok(res, 'Estado del local actualizado', await storeService.setReceptionStatus(req.store, req.body?.status));
  } catch (error) {
    return fail(res, error, 'Error al cambiar el estado del local');
  }
};

export const setMyLogo = async (req, res) => {
  try {
    return ok(res, 'Logo guardado correctamente', await storeService.setLogo(req.store, req.body?.image));
  } catch (error) {
    return fail(res, error, 'Error al guardar el logo');
  }
};

export const deleteMyLogo = async (req, res) => {
  try {
    return ok(res, 'Logo eliminado correctamente', await storeService.clearLogo(req.store));
  } catch (error) {
    return fail(res, error, 'Error al eliminar el logo');
  }
};
