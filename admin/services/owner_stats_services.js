import ownerStatsRepository from '../repositories/owner_stats_repository.js';
import storeRepository from '../repositories/stores_repository.js';
import { todayInLima } from './orders_services.js';
import { addDays } from './lima_time.js';
import { serviceError } from './errors.js';

const MAX_DAYS = 90;

/**
 * Ranking: productos y locales con su calificación promedio de los últimos N días
 * (la pantalla aplica el mínimo de calificaciones y el top).
 */
export const fetchRanking = async (rawDays) => {
  const days = rawDays === undefined || rawDays === '' ? 30 : Number(rawDays);

  if (!Number.isInteger(days) || days < 1 || days > 365) {
    throw serviceError(400, 'INVALID_DAYS', 'Los días deben ser un entero entre 1 y 365');
  }

  const to = todayInLima();
  const from = addDays(to, -(days - 1));

  // created_at es un instante: se compara desde el inicio del día (hora de Lima) de la fecha inicial
  const [products, stores] = await Promise.all([
    ownerStatsRepository.findProductRatings(`${from} 00:00:00-05`),
    ownerStatsRepository.findStoreRatings(`${from} 00:00:00-05`)
  ]);

  return { from, to, products, stores };
};

/**
 * Ventas por producto y hora de recojo de los últimos N días, más el catálogo de productos
 * (para detectar los que no tuvieron movimiento).
 */
export const fetchProductSales = async (rawDays) => {
  const days = rawDays === undefined || rawDays === '' ? 30 : Number(rawDays);

  if (!Number.isInteger(days) || days < 1 || days > 365) {
    throw serviceError(400, 'INVALID_DAYS', 'Los días deben ser un entero entre 1 y 365');
  }

  const to = todayInLima();
  const from = addDays(to, -(days - 1));

  const [stores, products, sales] = await Promise.all([
    storeRepository.findAll({ where: { operative_status: 'activo' }, order: [['id', 'ASC']] }),
    ownerStatsRepository.findCatalog(),
    ownerStatsRepository.findProductSales(from, to)
  ]);

  return {
    from,
    to,
    stores: stores.map((store) => ({ id: store.id, name: store.commercial_name })),
    products,
    sales
  };
};

/**
 * Ventas diarias por local de los últimos N días (hasta hoy, hora de Lima).
 * Devuelve los locales activos y una fila por día y local con movimiento.
 */
export const fetchDailySales = async (rawDays) => {
  const days = rawDays === undefined || rawDays === '' ? 60 : Number(rawDays);

  if (!Number.isInteger(days) || days < 1 || days > MAX_DAYS) {
    throw serviceError(400, 'INVALID_DAYS', `Los días deben ser un entero entre 1 y ${MAX_DAYS}`);
  }

  const to = todayInLima();
  const from = addDays(to, -(days - 1));

  const stores = await storeRepository.findAll({
    where: { operative_status: 'activo' },
    order: [['id', 'ASC']]
  });

  const rows = await ownerStatsRepository.findDailySales(from, to);

  return {
    from,
    to,
    stores: stores.map((store) => ({ id: store.id, name: store.commercial_name, campus: store.campus })),
    days: rows
  };
};
