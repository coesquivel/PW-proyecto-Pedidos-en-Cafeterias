import ownerAccountsRepository from '../repositories/owner_accounts_repository.js';
import { serviceError } from './errors.js';

const parseReason = (value) => {
  const reason = typeof value === 'string' ? value.trim() : '';

  if (!reason || reason.length > 300) {
    throw serviceError(400, 'INVALID_REASON', 'El motivo es obligatorio (máximo 300 caracteres)');
  }

  return reason;
};

export const fetchDiners = async () => ownerAccountsRepository.findDiners();

export const fetchStores = async () => ownerAccountsRepository.findStores();

/**
 * Bloquear o reactivar la cuenta de un comensal. Bloquear exige un motivo.
 */
export const changeDinerStatus = async (dinerId, data = {}) => {
  const userId = await ownerAccountsRepository.findDinerUserId(dinerId);

  if (!userId) {
    throw serviceError(404, 'DINER_NOT_FOUND', 'Comensal no encontrado');
  }

  if (data.status === 'bloqueado') {
    await ownerAccountsRepository.setUserStatus(userId, 'bloqueado', parseReason(data.reason));
  } else if (data.status === 'activo') {
    await ownerAccountsRepository.setUserStatus(userId, 'activo', null);
  } else {
    throw serviceError(400, 'INVALID_STATUS', 'El estado debe ser activo o bloqueado');
  }

  return (await ownerAccountsRepository.findDiners()).find((diner) => diner.id === dinerId);
};

/**
 * Suspender o reactivar un local aprobado. Suspender exige un motivo.
 */
export const changeStoreStatus = async (storeId, data = {}) => {
  const store = await ownerAccountsRepository.findStore(storeId);

  if (!store || !['activo', 'suspendido'].includes(store.operative_status)) {
    throw serviceError(404, 'STORE_NOT_FOUND', 'Local no encontrado');
  }

  if (data.status === 'suspendido') {
    await ownerAccountsRepository.setStoreStatus(storeId, 'suspendido', parseReason(data.reason));
  } else if (data.status === 'activo') {
    await ownerAccountsRepository.setStoreStatus(storeId, 'activo', null);
  } else {
    throw serviceError(400, 'INVALID_STATUS', 'El estado debe ser activo o suspendido');
  }

  return (await ownerAccountsRepository.findStores()).find((item) => item.id === storeId);
};
