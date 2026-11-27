import * as optionGroupService from '../services/option_groups_services.js';
import { ok, fail, parseId } from './responses.js';

const invalidId = (res) => res.status(400).json({
  success: false, message: 'ID inválido', data: null, error: 'INVALID_ID'
});

export const listMyOptionGroups = async (req, res) => {
  try {
    const productId = parseId(req.params.productId);
    if (!productId) return invalidId(res);

    return ok(res, 'Grupos listados correctamente', await optionGroupService.fetchByProduct(req.store.id, productId));
  } catch (error) {
    return fail(res, error, 'Error al listar los grupos de opciones');
  }
};

export const createMyOptionGroup = async (req, res) => {
  try {
    const productId = parseId(req.params.productId);
    if (!productId) return invalidId(res);

    const group = await optionGroupService.createGroup(req.store.id, productId, req.body || {});

    return ok(res, 'Grupo creado correctamente', group, 201);
  } catch (error) {
    return fail(res, error, 'Error al crear el grupo de opciones');
  }
};

export const updateMyOptionGroup = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return invalidId(res);

    const group = await optionGroupService.updateGroup(req.store.id, id, req.body || {});

    return ok(res, 'Grupo actualizado correctamente', group);
  } catch (error) {
    return fail(res, error, 'Error al actualizar el grupo de opciones');
  }
};

export const deleteMyOptionGroup = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return invalidId(res);

    await optionGroupService.deleteGroup(req.store.id, id);

    return ok(res, 'Grupo eliminado correctamente');
  } catch (error) {
    return fail(res, error, 'Error al eliminar el grupo de opciones');
  }
};
