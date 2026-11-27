import dinerRepository from '../repositories/diners_repository.js';
import { serviceError } from './errors.js';

/**
 * Un comensal bloqueado por el owner no puede agregar al carrito ni confirmar pedidos
 * (aunque su sesión siga abierta). Los pedidos en curso se mantienen.
 */
export const assertDinerCanOrder = async (dinerId) => {
  const diner = await dinerRepository.findByIdWithUser(dinerId);

  if (diner && diner.user && diner.user.status === 'bloqueado') {
    throw serviceError(403, 'ACCOUNT_BLOCKED', 'Tu cuenta está bloqueada y no puede crear nuevos pedidos');
  }
};
