import * as reviewService from '../services/reviews_services.js';
import * as storeService from '../services/stores_services.js';
import { ok, fail, parseId } from './responses.js';

const invalidId = (res) => res.status(400).json({
  success: false, message: 'ID inválido', data: null, error: 'INVALID_ID'
});

export const createMyReview = async (req, res) => {
  try {
    const orderId = parseId(req.params.id);
    if (!orderId) return invalidId(res);

    const review = await reviewService.createReview(req.diner.id, orderId, req.body || {});

    return ok(res, 'Calificación enviada correctamente', review, 201);
  } catch (error) {
    return fail(res, error, 'Error al enviar la calificación');
  }
};

export const listMyReviews = async (req, res) => {
  try {
    return ok(res, 'Calificaciones listadas correctamente', await reviewService.fetchMyReviews(req.diner.id));
  } catch (error) {
    return fail(res, error, 'Error al listar tus calificaciones');
  }
};

export const listStoreReviews = async (req, res) => {
  try {
    const storeId = parseId(req.params.id);
    if (!storeId) return invalidId(res);

    if (!(await storeService.fetchActiveById(storeId))) {
      return res.status(404).json({
        success: false, message: 'Local no encontrado', data: null, error: 'STORE_NOT_FOUND'
      });
    }

    return ok(res, 'Calificaciones listadas correctamente', await reviewService.fetchStoreReviews(storeId));
  } catch (error) {
    return fail(res, error, 'Error al listar las calificaciones');
  }
};

export const listMyStoreReviews = async (req, res) => {
  try {
    return ok(res, 'Calificaciones listadas correctamente', await reviewService.fetchMyStoreReviews(req.store.id));
  } catch (error) {
    return fail(res, error, 'Error al listar las calificaciones');
  }
};

export const replyMyStoreReview = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return invalidId(res);

    const review = await reviewService.replyReview(req.store.id, id, req.body || {});

    return ok(res, 'Respuesta guardada correctamente', review);
  } catch (error) {
    return fail(res, error, 'Error al guardar la respuesta');
  }
};
