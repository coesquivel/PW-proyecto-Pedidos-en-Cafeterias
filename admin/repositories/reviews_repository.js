import { fn, col } from 'sequelize';
import sequelize from '../../configs/database.js';
import { OrderReview, ProductReview, Product, Diner, Order, Store } from '../models/associations.js';

const reviewInclude = [
  { model: Diner, as: 'diner', attributes: ['id', 'first_name', 'last_name'] },
  { model: Order, as: 'order', attributes: ['id', 'code'] },
  { model: ProductReview, as: 'products', include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }] }
];

const reviewOrder = [['created_at', 'DESC'], ['id', 'DESC']];

/**
 * Calificaciones de un local (más recientes primero)
 */
const findAllByStore = async (storeId) => {
  return await OrderReview.findAll({ where: { store_id: storeId }, include: reviewInclude, order: reviewOrder });
};

/**
 * Calificaciones hechas por un comensal (más recientes primero)
 */
const findAllByDiner = async (dinerId) => {
  return await OrderReview.findAll({
    where: { diner_id: dinerId },
    include: [...reviewInclude, { model: Store, as: 'store', attributes: ['id', 'commercial_name'] }],
    order: reviewOrder
  });
};

const findByIdAndStore = async (id, storeId) => {
  return await OrderReview.findOne({ where: { id, store_id: storeId }, include: reviewInclude });
};

const findByOrder = async (orderId) => {
  return await OrderReview.findOne({ where: { order_id: orderId } });
};

/**
 * Crea la calificación del local con las de sus productos (transacción)
 */
const create = async (review, products) => {
  const id = await sequelize.transaction(async (transaction) => {
    const created = await OrderReview.create(review, { transaction });

    await ProductReview.bulkCreate(
      products.map((product) => ({ ...product, order_review_id: created.id })),
      { transaction }
    );

    return created.id;
  });

  return await OrderReview.findByPk(id, { include: reviewInclude });
};

const setReply = async (review, reply) => {
  return await review.update({ store_reply: reply });
};

/**
 * Promedio y cantidad de calificaciones por local: { [store_id]: { average, total } }
 */
const ratingsByStore = async () => {
  const rows = await OrderReview.findAll({
    attributes: ['store_id', [fn('AVG', col('store_rating')), 'average'], [fn('COUNT', col('id')), 'total']],
    group: ['store_id'],
    raw: true
  });

  return Object.fromEntries(rows.map((row) => [
    row.store_id,
    { average: Math.round(Number(row.average) * 10) / 10, total: Number(row.total) }
  ]));
};

const reviewRepository = { findAllByStore, findAllByDiner, findByIdAndStore, findByOrder, create, setReply, ratingsByStore };

export default reviewRepository;
