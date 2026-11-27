import productRepository from '../repositories/products_repository.js';
import categoryRepository from '../repositories/categories_repository.js';
import { saveImage, removeImage } from './images_services.js';
import { serviceError } from './errors.js';

/**
 * Valida y limpia los datos de un producto.
 * Solo acepta los campos permitidos; store_id nunca viene del cliente.
 * Con partial=true (actualización) solo valida los campos enviados.
 */
const buildProductData = async (storeId, data, partial) => {
  const clean = {};

  if (!partial || data.name !== undefined) {
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    if (!name || name.length > 60) {
      throw serviceError(400, 'INVALID_NAME', 'El nombre es obligatorio (máximo 60 caracteres)');
    }
    clean.name = name;
  }

  if (!partial || data.price !== undefined) {
    const price = Number(data.price);
    if (data.price === null || data.price === '' || !Number.isFinite(price) || price < 0) {
      throw serviceError(400, 'INVALID_PRICE', 'El precio debe ser un número mayor o igual a 0');
    }
    clean.price = price;
  }

  if (!partial || data.category_id !== undefined) {
    const category = await categoryRepository.findByIdAndStore(Number(data.category_id), storeId);
    if (!category) {
      throw serviceError(400, 'INVALID_CATEGORY', 'La categoría no existe en tu local');
    }
    clean.category_id = category.id;
  }

  if (data.description !== undefined) {
    if (data.description !== null && String(data.description).length > 160) {
      throw serviceError(400, 'INVALID_DESCRIPTION', 'La descripción admite máximo 160 caracteres');
    }
    clean.description = data.description;
  }

  if (data.available !== undefined) {
    if (typeof data.available !== 'boolean') {
      throw serviceError(400, 'INVALID_AVAILABLE', 'available debe ser true o false');
    }
    clean.available = data.available;
  }

  for (const field of ['daily_stock', 'preparation_time']) {
    if (data[field] !== undefined) {
      if (data[field] !== null && (!Number.isInteger(data[field]) || data[field] < 0)) {
        throw serviceError(400, 'INVALID_NUMBER', `${field} debe ser un entero mayor o igual a 0 (o null)`);
      }
      clean[field] = data[field];
    }
  }

  return clean;
};

/**
 * Obtener los productos de un local (con su categoría)
 */
export const fetchByStore = async (storeId) => {
  const products = await productRepository.findAllByStore(storeId);

  return products.map(product => product.toJSON());
};

/**
 * Carta pública del local, con los grupos de opciones de cada producto
 */
export const fetchByStoreWithOptions = async (storeId) => {
  const products = await productRepository.findAllByStoreWithOptions(storeId);

  return products.map(product => product.toJSON());
};

/**
 * Obtener un producto del local por su ID
 */
export const fetchById = async (storeId, id) => {
  const product = await productRepository.findByIdAndStore(id, storeId);

  if (!product) {
    throw serviceError(404, 'PRODUCT_NOT_FOUND', 'Producto no encontrado');
  }

  return product.toJSON();
};

/**
 * Crear un producto en el local
 */
export const create = async (storeId, data = {}) => {
  const clean = await buildProductData(storeId, data, false);

  const newProduct = await productRepository.create({ ...clean, store_id: storeId });

  return await fetchById(storeId, newProduct.id);
};

/**
 * Actualizar un producto del local
 */
export const update = async (storeId, id, data = {}) => {
  const product = await productRepository.findByIdAndStore(id, storeId);

  if (!product) {
    throw serviceError(404, 'PRODUCT_NOT_FOUND', 'Producto no encontrado');
  }

  const clean = await buildProductData(storeId, data, true);

  await productRepository.update(product, clean);

  return await fetchById(storeId, id);
};

/**
 * Eliminar un producto del local
 */
export const remove = async (storeId, id) => {
  const product = await productRepository.findByIdAndStore(id, storeId);

  if (!product) {
    throw serviceError(404, 'PRODUCT_NOT_FOUND', 'Producto no encontrado');
  }

  try {
    await productRepository.delete(product);
    await removeImage(product.picture_url);
    return true;
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      throw serviceError(409, 'PRODUCT_IN_USE', 'El producto tiene reseñas; márcalo como no disponible en lugar de eliminarlo');
    }
    throw error;
  }
};

/**
 * Poner o cambiar la foto del producto (data URL). La foto anterior se borra del disco.
 */
export const setPicture = async (storeId, id, image) => {
  const product = await productRepository.findByIdAndStore(id, storeId);

  if (!product) {
    throw serviceError(404, 'PRODUCT_NOT_FOUND', 'Producto no encontrado');
  }

  const url = await saveImage(image, 'products');
  const previous = product.picture_url;

  try {
    await productRepository.update(product, { picture_url: url });
  } catch (error) {
    await removeImage(url);
    throw error;
  }

  await removeImage(previous);

  return await fetchById(storeId, id);
};

/**
 * Quitar la foto del producto
 */
export const clearPicture = async (storeId, id) => {
  const product = await productRepository.findByIdAndStore(id, storeId);

  if (!product) {
    throw serviceError(404, 'PRODUCT_NOT_FOUND', 'Producto no encontrado');
  }

  const previous = product.picture_url;

  await productRepository.update(product, { picture_url: null });
  await removeImage(previous);

  return await fetchById(storeId, id);
};
