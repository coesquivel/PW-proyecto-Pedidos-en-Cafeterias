import * as orderService from '../services/orders_services.js';
import { ok, fail, parseId } from './responses.js';

const invalidId = (res) => res.status(400).json({
  success: false, message: 'ID inválido', data: null, error: 'INVALID_ID'
});

/* ---------- Comensal ---------- */
export const createMyOrder = async (req, res) => {
  try {
    const order = await orderService.createFromCart(req.diner.id, req.body);

    return ok(res, 'Pedido confirmado correctamente', order, 201);
  } catch (error) {
    return fail(res, error, 'Error al confirmar el pedido');
  }
};

export const listMyOrders = async (req, res) => {
  try {
    return ok(res, 'Pedidos listados correctamente', await orderService.fetchByDiner(req.diner.id));
  } catch (error) {
    return fail(res, error, 'Error al listar tus pedidos');
  }
};

/* ---------- Local ---------- */
export const listStoreOrders = async (req, res) => {
  try {
    return ok(res, 'Pedidos del local listados correctamente', await orderService.fetchByStore(req.store.id));
  } catch (error) {
    return fail(res, error, 'Error al listar los pedidos del local');
  }
};

export const getStoreOrdersOfDay = async (req, res) => {
  try {
    return ok(res, 'Pedidos del día listados correctamente', await orderService.fetchDayByStore(req.store.id, req.query.date));
  } catch (error) {
    return fail(res, error, 'Error al listar los pedidos del día');
  }
};

export const getStoreOrderByCode = async (req, res) => {
  try {
    const order = await orderService.fetchByCode(req.store.id, req.params.code);

    return ok(res, 'Pedido obtenido correctamente', order);
  } catch (error) {
    return fail(res, error, 'Error al buscar el pedido');
  }
};

export const changeStoreOrderStatus = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return invalidId(res);

    const order = await orderService.changeStatus(req.store.id, id, req.body?.status);

    return ok(res, 'Estado del pedido actualizado', order);
  } catch (error) {
    return fail(res, error, 'Error al actualizar el estado del pedido');
  }
};
