import * as ownerStatsService from '../services/owner_stats_services.js';
import { ok, fail } from './responses.js';

export const getRanking = async (req, res) => {
  try {
    return ok(res, 'Ranking obtenido correctamente', await ownerStatsService.fetchRanking(req.query.days));
  } catch (error) {
    return fail(res, error, 'Error al obtener el ranking');
  }
};

export const getProductSales = async (req, res) => {
  try {
    return ok(res, 'Ventas por producto obtenidas correctamente', await ownerStatsService.fetchProductSales(req.query.days));
  } catch (error) {
    return fail(res, error, 'Error al obtener las ventas por producto');
  }
};

export const getDailySales = async (req, res) => {
  try {
    return ok(res, 'Ventas diarias obtenidas correctamente', await ownerStatsService.fetchDailySales(req.query.days));
  } catch (error) {
    return fail(res, error, 'Error al obtener las ventas diarias');
  }
};
