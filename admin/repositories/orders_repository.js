import { Op } from 'sequelize';
import sequelize from '../../configs/database.js';
import { Order, OrderItem, OrderItemOption, OrderReview, OrderStatus, Diner, Store, Cart } from '../models/associations.js';

const orderInclude = [
  { model: OrderStatus, as: 'status', attributes: ['id', 'name'] },
  { model: OrderReview, as: 'review', attributes: ['id'] },
  { model: Store, as: 'store', attributes: ['id', 'commercial_name', 'campus_location'] },
  { model: Diner, as: 'diner', attributes: ['id', 'first_name', 'last_name'] },
  { model: OrderItem, as: 'items', include: [{ model: OrderItemOption, as: 'options' }] }
];

const itemsOrder = [{ model: OrderItem, as: 'items' }, 'id', 'ASC'];

const findStatusByName = async (name) => {
  return await OrderStatus.findOne({ where: { name } });
};

/**
 * Pedidos de un comensal (más recientes primero)
 */
const findAllByDiner = async (dinerId) => {
  return await Order.findAll({
    where: { diner_id: dinerId },
    include: orderInclude,
    order: [['created', 'DESC'], ['id', 'DESC'], itemsOrder]
  });
};

/**
 * Pedidos de un local: los de hoy en adelante, más los anteriores aún sin cerrar
 * (recibido, preparacion, listo).
 */
const findAllByStore = async (storeId, today) => {
  return await Order.findAll({
    where: {
      store_id: storeId,
      [Op.or]: [
        { pickup_date: { [Op.gte]: today } },
        { '$status.name$': { [Op.in]: ['recibido', 'preparacion', 'listo'] } }
      ]
    },
    include: orderInclude,
    order: [['pickup_date', 'ASC'], ['pickup_time', 'ASC'], ['id', 'ASC'], itemsOrder]
  });
};

/**
 * Todos los pedidos del local con recojo en una fecha (para el resumen del día)
 */
const findAllByStoreAndDate = async (storeId, date) => {
  return await Order.findAll({
    where: { store_id: storeId, pickup_date: date },
    include: orderInclude,
    order: [['pickup_time', 'ASC'], ['id', 'ASC'], itemsOrder]
  });
};

const findByIdAndStore = async (id, storeId) => {
  return await Order.findOne({
    where: { id, store_id: storeId },
    include: orderInclude,
    order: [itemsOrder]
  });
};

const findByCodeAndStore = async (code, storeId) => {
  return await Order.findOne({
    where: { code, store_id: storeId },
    include: orderInclude,
    order: [itemsOrder]
  });
};

const findByIdAndDiner = async (id, dinerId) => {
  return await Order.findOne({
    where: { id, diner_id: dinerId },
    include: orderInclude,
    order: [itemsOrder]
  });
};

const updateStatus = async (order, statusId) => {
  return await order.update({ status_id: statusId });
};

/**
 * Crea el pedido, copia los ítems del carrito y vacía el carrito.
 * Todo en una transacción: o se guarda completo o no se guarda nada.
 */
const createFromCart = async ({ order, items, cartId }) => {
  return await sequelize.transaction(async (transaction) => {
    const created = await Order.create(order, { transaction });

    // El código visible se arma con el id (PED-0001) y se guarda aquí mismo
    await created.update(
      { code: `PED-${String(created.id).padStart(4, '0')}` },
      { transaction }
    );

    for (const { options = [], ...item } of items) {
      const createdItem = await OrderItem.create({ ...item, order_id: created.id }, { transaction });

      await OrderItemOption.bulkCreate(
        options.map((option) => ({ ...option, order_item_id: createdItem.id })),
        { transaction }
      );
    }

    await Cart.destroy({ where: { id: cartId }, transaction });

    return created.id;
  });
};

const orderRepository = {
  findStatusByName,
  findAllByDiner,
  findAllByStore,
  findAllByStoreAndDate,
  findByIdAndStore,
  findByCodeAndStore,
  findByIdAndDiner,
  updateStatus,
  createFromCart
};

export default orderRepository;
