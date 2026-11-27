import categoryRepository from '../repositories/categories_repository.js';
import productRepository from '../repositories/products_repository.js';
import { serviceError } from './errors.js';

const cleanName = (name) => (typeof name === 'string' ? name.trim() : '');

/**
 * Obtener las categorías de un local
 */
export const fetchByStore = async (storeId) => {
  const categories = await categoryRepository.findAllByStore(storeId);

  return categories.map(category => category.toJSON());
};

/**
 * Crear una categoría en un local
 */
export const create = async (storeId, data = {}) => {
  const name = cleanName(data.name);

  if (!name || name.length > 40) {
    throw serviceError(400, 'INVALID_NAME', 'El nombre es obligatorio (máximo 40 caracteres)');
  }

  const newCategory = await categoryRepository.create({
    name,
    display_order: Number.isInteger(data.display_order) ? data.display_order : 0,
    store_id: storeId
  });

  return newCategory.toJSON();
};

/**
 * Actualizar una categoría del local
 */
export const update = async (storeId, id, data = {}) => {
  const category = await categoryRepository.findByIdAndStore(id, storeId);

  if (!category) {
    throw serviceError(404, 'CATEGORY_NOT_FOUND', 'Categoría no encontrada');
  }

  const changes = {};

  if (data.name !== undefined) {
    const name = cleanName(data.name);
    if (!name || name.length > 40) {
      throw serviceError(400, 'INVALID_NAME', 'El nombre es obligatorio (máximo 40 caracteres)');
    }
    changes.name = name;
  }

  if (data.display_order !== undefined) {
    if (!Number.isInteger(data.display_order)) {
      throw serviceError(400, 'INVALID_ORDER', 'display_order debe ser un número entero');
    }
    changes.display_order = data.display_order;
  }

  const updated = await categoryRepository.update(category, changes);

  return updated.toJSON();
};

/**
 * Eliminar una categoría del local (solo si no tiene productos)
 */
export const remove = async (storeId, id) => {
  const category = await categoryRepository.findByIdAndStore(id, storeId);

  if (!category) {
    throw serviceError(404, 'CATEGORY_NOT_FOUND', 'Categoría no encontrada');
  }

  const total = await productRepository.countByCategory(category.id);

  if (total > 0) {
    throw serviceError(409, 'CATEGORY_HAS_PRODUCTS', 'La categoría tiene productos; muévelos o elimínalos primero');
  }

  return await categoryRepository.delete(category);
};
