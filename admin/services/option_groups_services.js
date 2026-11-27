import optionGroupRepository from '../repositories/option_groups_repository.js';
import productRepository from '../repositories/products_repository.js';
import { serviceError } from './errors.js';

const MAX_OPTIONS = 20;

const toView = (group) => ({
  id: group.id,
  product_id: group.product_id,
  name: group.name,
  selection_type: group.selection_type,
  is_required: group.is_required,
  options: group.options.map((option) => ({
    id: option.id,
    name: option.name,
    additional_price: option.additional_price
  }))
});

/**
 * Valida y limpia un grupo con sus alternativas
 */
const buildGroupData = (data) => {
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  if (!name || name.length > 50) {
    throw serviceError(400, 'INVALID_NAME', 'El nombre del grupo es obligatorio (máximo 50 caracteres)');
  }

  if (!['unica', 'multiple'].includes(data.selection_type)) {
    throw serviceError(400, 'INVALID_SELECTION_TYPE', 'El tipo de selección debe ser unica o multiple');
  }

  if (typeof data.is_required !== 'boolean') {
    throw serviceError(400, 'INVALID_REQUIRED', 'is_required debe ser true o false');
  }

  if (!Array.isArray(data.options) || data.options.length === 0) {
    throw serviceError(400, 'INVALID_OPTIONS', 'Agrega al menos una alternativa');
  }

  if (data.options.length > MAX_OPTIONS) {
    throw serviceError(400, 'INVALID_OPTIONS', `Máximo ${MAX_OPTIONS} alternativas por grupo`);
  }

  const options = data.options.map((option) => {
    const optionName = typeof option?.name === 'string' ? option.name.trim() : '';
    if (!optionName || optionName.length > 50) {
      throw serviceError(400, 'INVALID_OPTION_NAME', 'Cada alternativa necesita un nombre (máximo 50 caracteres)');
    }

    const price = option.additional_price === undefined || option.additional_price === ''
      ? 0
      : Number(option.additional_price);
    if (!Number.isFinite(price) || price < 0 || price > 9999) {
      throw serviceError(400, 'INVALID_OPTION_PRICE', 'El precio adicional debe ser un número entre 0 y 9999');
    }

    return { name: optionName, additional_price: price };
  });

  return { group: { name, selection_type: data.selection_type, is_required: data.is_required }, options };
};

const findProduct = async (storeId, productId) => {
  const product = await productRepository.findByIdAndStore(productId, storeId);

  if (!product) {
    throw serviceError(404, 'PRODUCT_NOT_FOUND', 'Producto no encontrado');
  }

  return product;
};

const findGroup = async (storeId, groupId) => {
  const group = await optionGroupRepository.findByIdAndStore(groupId, storeId);

  if (!group) {
    throw serviceError(404, 'GROUP_NOT_FOUND', 'Grupo de opciones no encontrado');
  }

  return group;
};

export const fetchByProduct = async (storeId, productId) => {
  await findProduct(storeId, productId);

  return (await optionGroupRepository.findAllByProduct(productId)).map(toView);
};

export const createGroup = async (storeId, productId, data) => {
  await findProduct(storeId, productId);
  const { group, options } = buildGroupData(data);

  return toView(await optionGroupRepository.create(productId, group, options));
};

export const updateGroup = async (storeId, groupId, data) => {
  await findGroup(storeId, groupId);
  const { group, options } = buildGroupData(data);

  return toView(await optionGroupRepository.update(groupId, group, options));
};

export const deleteGroup = async (storeId, groupId) => {
  await findGroup(storeId, groupId);

  return await optionGroupRepository.delete(groupId);
};
