import * as categoryService from '../services/categories_services.js';
import { ok, fail, parseId } from './responses.js';

const invalidId = (res) => res.status(400).json({
  success: false, message: 'ID inválido', data: null, error: 'INVALID_ID'
});

export const listMyCategories = async (req, res) => {
  try {
    const categories = await categoryService.fetchByStore(req.store.id);

    return ok(res, 'Categorías listadas correctamente', categories);
  } catch (error) {
    return fail(res, error, 'Error al listar las categorías');
  }
};

export const createMyCategory = async (req, res) => {
  try {
    const category = await categoryService.create(req.store.id, req.body);

    return ok(res, 'Categoría creada correctamente', category, 201);
  } catch (error) {
    return fail(res, error, 'Error al crear la categoría');
  }
};

export const updateMyCategory = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return invalidId(res);

    const category = await categoryService.update(req.store.id, id, req.body);

    return ok(res, 'Categoría actualizada correctamente', category);
  } catch (error) {
    return fail(res, error, 'Error al actualizar la categoría');
  }
};

export const deleteMyCategory = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return invalidId(res);

    await categoryService.remove(req.store.id, id);

    return ok(res, 'Categoría eliminada correctamente');
  } catch (error) {
    return fail(res, error, 'Error al eliminar la categoría');
  }
};
