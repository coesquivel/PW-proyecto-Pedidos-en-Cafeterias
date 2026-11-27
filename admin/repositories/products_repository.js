import { Product, Category, OptionGroup, ProductOption } from '../models/associations.js';

const includeCategory = { model: Category, as: 'category' };

/**
 * Obtener los productos de un local (con su categoría)
 */
const findAllByStore = async (storeId) => {
  return await Product.findAll({
    where: { store_id: storeId },
    include: [includeCategory],
    order: [['category_id', 'ASC'], ['id', 'ASC']]
  });
};

/**
 * Carta pública: productos con su categoría y sus grupos de opciones
 */
const findAllByStoreWithOptions = async (storeId) => {
  return await Product.findAll({
    where: { store_id: storeId },
    include: [
      includeCategory,
      { model: OptionGroup, as: 'option_groups', include: [{ model: ProductOption, as: 'options' }] }
    ],
    order: [
      ['category_id', 'ASC'], ['id', 'ASC'],
      [{ model: OptionGroup, as: 'option_groups' }, 'id', 'ASC'],
      [{ model: OptionGroup, as: 'option_groups' }, { model: ProductOption, as: 'options' }, 'id', 'ASC']
    ]
  });
};

/**
 * Obtener un producto, solo si pertenece al local indicado
 */
const findByIdAndStore = async (id, storeId) => {
  return await Product.findOne({
    where: { id, store_id: storeId },
    include: [includeCategory]
  });
};

/**
 * Obtener un producto por ID (sin importar el local)
 */
const findById = async (id) => {
  return await Product.findByPk(id);
};

/**
 * Contar productos de una categoría
 */
const countByCategory = async (categoryId) => {
  return await Product.count({ where: { category_id: categoryId } });
};

/**
 * Crear producto
 */
const create = async (data) => {
  return await Product.create(data);
};

/**
 * Actualizar producto
 */
const update = async (product, data) => {
  return await product.update(data);
};

/**
 * Eliminar producto
 */
const deleteProduct = async (product) => {
  await product.destroy();
  return true;
};

const productRepository = {
  findAllByStore,
  findAllByStoreWithOptions,
  findByIdAndStore,
  findById,
  countByCategory,
  create,
  update,
  delete: deleteProduct
};

export default productRepository;
