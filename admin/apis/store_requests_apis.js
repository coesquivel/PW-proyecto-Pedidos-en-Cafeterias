import * as storeRequestService from '../services/store_requests_services.js';
import { ok, fail, parseId } from './responses.js';

export const listStoreRequests = async (req, res) => {
  try {
    return ok(res, 'Solicitudes listadas correctamente', await storeRequestService.fetchAll(req.query.status));
  } catch (error) {
    return fail(res, error, 'Error al listar las solicitudes');
  }
};

export const changeStoreRequestStatus = async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false, message: 'ID inválido', data: null, error: 'INVALID_ID'
      });
    }

    const store = await storeRequestService.changeStatus(id, req.body?.status);

    return ok(res, 'Estado de la solicitud actualizado', store);
  } catch (error) {
    return fail(res, error, 'Error al actualizar la solicitud');
  }
};
