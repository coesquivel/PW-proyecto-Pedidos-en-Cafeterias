import * as productService from '../services/products_services.js';
import * as storeService from '../services/stores_services.js';
import { ok, fail, parseId } from './responses.js';

const invalidId = (res) => res.status(400).json({
  success: false, message: 'ID inválido', data: null, error: 'INVALID_ID'
});

/**
 * Carta pública de un local activo (la ve el comensal)
 */
export const listStoreProducts = async (req, res) => {
  try {
    const storeId = parseId(req.params.id);
    if (!storeId) return invalidId(res);

    const store = await storeService.fetchActiveById(storeId);

    if (!store) {
      return res.status(404).json({
        success: false, message: 'Local no encontrado', data: null, error: 'STORE_NOT_FOUND'
      });
    }

    const products = await productService.fetchByStoreWithOptions(storeId);

    return ok(res, 'Productos listados correctamente', products);
  } catch (error) {
    return fail(res, error, 'Error al listar los productos');
  }
};

export const listMyProducts = async (req, res) => {
  try {
    const products = await productService.fetchByStore(req.store.id);

    return ok(res, 'Productos listados correctamente', products);
  } catch (error) {
    return fail(res, error, 'Error al listar los productos');
  }
};

export const getMyProductById = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return invalidId(res);

    const product = await productService.fetchById(req.store.id, id);

    return ok(res, 'Producto obtenido correctamente', product);
  } catch (error) {
    return fail(res, error, 'Error al obtener el producto');
  }
};

export const createMyProduct = async (req, res) => {
  try {
    const product = await productService.create(req.store.id, req.body);

    return ok(res, 'Producto creado correctamente', product, 201);
  } catch (error) {
    return fail(res, error, 'Error al crear el producto');
  }
};

export const updateMyProduct = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return invalidId(res);

    const product = await productService.update(req.store.id, id, req.body);

    return ok(res, 'Producto actualizado correctamente', product);
  } catch (error) {
    return fail(res, error, 'Error al actualizar el producto');
  }
};

export const deleteMyProduct = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return invalidId(res);

    await productService.remove(req.store.id, id);

    return ok(res, 'Producto eliminado correctamente');
  } catch (error) {
    return fail(res, error, 'Error al eliminar el producto');
  }
};

export const setMyProductPicture = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return invalidId(res);

    const product = await productService.setPicture(req.store.id, id, req.body?.image);

    return ok(res, 'Foto guardada correctamente', product);
  } catch (error) {
    return fail(res, error, 'Error al guardar la foto');
  }
};

export const deleteMyProductPicture = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return invalidId(res);

    return ok(res, 'Foto eliminada correctamente', await productService.clearPicture(req.store.id, id));
  } catch (error) {
    return fail(res, error, 'Error al eliminar la foto');
  }
};
