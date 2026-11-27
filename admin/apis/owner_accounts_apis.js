import * as ownerAccountsService from '../services/owner_accounts_services.js';
import { ok, fail, parseId } from './responses.js';

const invalidId = (res) =>
  res.status(400).json({ success: false, message: 'ID inválido', data: null, error: 'INVALID_ID' });

export const listDiners = async (req, res) => {
  try {
    return ok(res, 'Comensales listados correctamente', await ownerAccountsService.fetchDiners());
  } catch (error) {
    return fail(res, error, 'Error al listar los comensales');
  }
};

export const listStores = async (req, res) => {
  try {
    return ok(res, 'Locales listados correctamente', await ownerAccountsService.fetchStores());
  } catch (error) {
    return fail(res, error, 'Error al listar los locales');
  }
};

export const changeDinerStatus = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return invalidId(res);

    return ok(res, 'Estado del comensal actualizado', await ownerAccountsService.changeDinerStatus(id, req.body));
  } catch (error) {
    return fail(res, error, 'Error al cambiar el estado del comensal');
  }
};

export const changeStoreStatus = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return invalidId(res);

    return ok(res, 'Estado del local actualizado', await ownerAccountsService.changeStoreStatus(id, req.body));
  } catch (error) {
    return fail(res, error, 'Error al cambiar el estado del local');
  }
};
