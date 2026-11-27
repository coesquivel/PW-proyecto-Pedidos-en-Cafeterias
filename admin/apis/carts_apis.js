import * as cartService from '../services/carts_services.js';
import { ok, fail, parseId } from './responses.js';

const invalidId = (res) => res.status(400).json({
  success: false, message: 'ID inválido', data: null, error: 'INVALID_ID'
});

export const getMyCart = async (req, res) => {
  try {
    return ok(res, 'Carrito obtenido correctamente', await cartService.fetchCart(req.diner.id));
  } catch (error) {
    return fail(res, error, 'Error al obtener el carrito');
  }
};

export const addToMyCart = async (req, res) => {
  try {
    const cart = await cartService.addItem(req.diner.id, req.body);

    return ok(res, 'Producto agregado al carrito', cart, 201);
  } catch (error) {
    return fail(res, error, 'Error al agregar el producto al carrito');
  }
};

export const repeatMyOrder = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return invalidId(res);

    const result = await cartService.repeatOrder(req.diner.id, id, req.body || {});

    return ok(res, 'Pedido agregado al carrito', result);
  } catch (error) {
    return fail(res, error, 'Error al repetir el pedido');
  }
};

export const updateMyCartItem = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return invalidId(res);

    const cart = await cartService.updateItem(req.diner.id, id, req.body);

    return ok(res, 'Carrito actualizado correctamente', cart);
  } catch (error) {
    return fail(res, error, 'Error al actualizar el carrito');
  }
};

export const deleteMyCartItem = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return invalidId(res);

    const cart = await cartService.removeItem(req.diner.id, id);

    return ok(res, 'Producto quitado del carrito', cart);
  } catch (error) {
    return fail(res, error, 'Error al quitar el producto del carrito');
  }
};

export const clearMyCart = async (req, res) => {
  try {
    return ok(res, 'Carrito vaciado correctamente', await cartService.clearCart(req.diner.id));
  } catch (error) {
    return fail(res, error, 'Error al vaciar el carrito');
  }
};
