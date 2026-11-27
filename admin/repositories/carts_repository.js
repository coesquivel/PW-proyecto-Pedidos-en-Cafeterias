import sequelize from '../../configs/database.js';
import { Cart, CartItem, CartItemOption, ProductOption, Product, Store } from '../models/associations.js';

const cartInclude = [
  { model: Store, as: 'store', attributes: ['id', 'commercial_name', 'campus_location', 'operative_status', 'reception_status'] },
  {
    model: CartItem,
    as: 'items',
    include: [
      { model: Product, as: 'product' },
      { model: CartItemOption, as: 'chosen', include: [{ model: ProductOption, as: 'option' }] }
    ]
  }
];

/**
 * Carrito del comensal con su local, ítems y productos
 */
const findByDiner = async (dinerId) => {
  return await Cart.findOne({
    where: { diner_id: dinerId },
    include: cartInclude,
    order: [[{ model: CartItem, as: 'items' }, 'id', 'ASC'], [{ model: CartItem, as: 'items' }, { model: CartItemOption, as: 'chosen' }, 'id', 'ASC']]
  });
};

const create = async (data) => {
  return await Cart.create(data);
};

const changeStore = async (cart, storeId) => {
  return await cart.update({ store_id: storeId });
};

const deleteByDiner = async (dinerId) => {
  return await Cart.destroy({ where: { diner_id: dinerId } });
};

/**
 * Ítems del carrito con el mismo producto y nota (con sus opciones elegidas)
 */
const findItems = async (cartId, productId, notes) => {
  return await CartItem.findAll({
    where: { cart_id: cartId, product_id: productId, notes },
    include: [{ model: CartItemOption, as: 'chosen' }]
  });
};

const findItemByIdAndCart = async (id, cartId) => {
  return await CartItem.findOne({ where: { id, cart_id: cartId } });
};

/**
 * Crea el ítem junto con sus opciones elegidas (transacción)
 */
const createItem = async (data, optionIds = []) => {
  return await sequelize.transaction(async (transaction) => {
    const item = await CartItem.create(data, { transaction });

    await CartItemOption.bulkCreate(
      optionIds.map((optionId) => ({ cart_item_id: item.id, product_option_id: optionId })),
      { transaction }
    );

    return item;
  });
};

const updateItem = async (item, data) => {
  return await item.update(data);
};

const deleteItem = async (item) => {
  return await item.destroy();
};

const deleteItemsByCart = async (cartId) => {
  return await CartItem.destroy({ where: { cart_id: cartId } });
};

const cartRepository = {
  findByDiner,
  create,
  changeStore,
  deleteByDiner,
  findItems,
  findItemByIdAndCart,
  createItem,
  updateItem,
  deleteItem,
  deleteItemsByCart
};

export default cartRepository;
