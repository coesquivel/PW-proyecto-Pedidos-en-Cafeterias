import sequelize from '../../configs/database.js';
import { OptionGroup, ProductOption, Product } from '../models/associations.js';

const includeOptions = { model: ProductOption, as: 'options' };
const order = [['id', 'ASC'], [{ model: ProductOption, as: 'options' }, 'id', 'ASC']];

/**
 * Grupos de opciones de un producto (con sus alternativas)
 */
const findAllByProduct = async (productId) => {
  return await OptionGroup.findAll({ where: { product_id: productId }, include: [includeOptions], order });
};

/**
 * Un grupo, solo si su producto pertenece al local indicado
 */
const findByIdAndStore = async (id, storeId) => {
  return await OptionGroup.findOne({
    where: { id },
    include: [
      includeOptions,
      { model: Product, as: 'product', attributes: ['id'], where: { store_id: storeId }, required: true }
    ],
    order
  });
};

const findOne = async (id) => {
  return await OptionGroup.findByPk(id, { include: [includeOptions], order });
};

/**
 * Crea el grupo con sus alternativas (transacción)
 */
const create = async (productId, group, options) => {
  const id = await sequelize.transaction(async (transaction) => {
    const created = await OptionGroup.create({ ...group, product_id: productId }, { transaction });
    await ProductOption.bulkCreate(
      options.map((option) => ({ ...option, option_group_id: created.id })),
      { transaction }
    );
    return created.id;
  });

  return await findOne(id);
};

/**
 * Actualiza el grupo y reemplaza sus alternativas (transacción)
 */
const update = async (groupId, group, options) => {
  await sequelize.transaction(async (transaction) => {
    await OptionGroup.update(group, { where: { id: groupId }, transaction });
    await ProductOption.destroy({ where: { option_group_id: groupId }, transaction });
    await ProductOption.bulkCreate(
      options.map((option) => ({ ...option, option_group_id: groupId })),
      { transaction }
    );
  });

  return await findOne(groupId);
};

const remove = async (groupId) => {
  await OptionGroup.destroy({ where: { id: groupId } });
  return true;
};

const optionGroupRepository = { findAllByProduct, findByIdAndStore, create, update, delete: remove };

export default optionGroupRepository;
