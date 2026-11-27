import { Category } from '../models/associations.js';

/**
 * Obtener las categorías de un local
 */
const findAllByStore = async (storeId) => {
  return await Category.findAll({
    where: { store_id: storeId },
    order: [['display_order', 'ASC'], ['id', 'ASC']]
  });
};

/**
 * Obtener una categoría, solo si pertenece al local indicado
 */
const findByIdAndStore = async (id, storeId) => {
  return await Category.findOne({ where: { id, store_id: storeId } });
};

/**
 * Crear categoría
 */
const create = async (data) => {
  return await Category.create(data);
};

/**
 * Actualizar categoría
 */
const update = async (category, data) => {
  return await category.update(data);
};

/**
 * Eliminar categoría
 */
const deleteCategory = async (category) => {
  await category.destroy();
  return true;
};

const categoryRepository = {
  findAllByStore,
  findByIdAndStore,
  create,
  update,
  delete: deleteCategory
};

export default categoryRepository;
