import reviewRepository from '../repositories/reviews_repository.js';
import orderRepository from '../repositories/orders_repository.js';
import { serviceError } from './errors.js';

const dateInLima = (date) => new Date(date).toLocaleDateString('en-CA', { timeZone: 'America/Lima' });

/**
 * Calificación de la base -> formato que usa el front.
 * Para el público se muestra el nombre con la inicial del apellido; el código del pedido solo lo ve el local.
 */
const toView = (review, { forStore = false, forDiner = false } = {}) => ({
  id: review.id,
  author: `${review.diner.first_name} ${review.diner.last_name.charAt(0)}.`,
  rating: review.store_rating,
  comment: review.comment,
  date: dateInLima(review.created_at),
  reply: review.store_reply,
  ...(forStore || forDiner ? { order_code: review.order.code } : {}),
  ...(forDiner ? { store: { id: review.store.id, name: review.store.commercial_name } } : {}),
  products: review.products.map((product) => ({
    product_id: product.product_id,
    name: product.product.name,
    rating: product.rating,
    comment: product.comment
  }))
});

const summarize = (reviews) => {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((review) => { distribution[review.rating] += 1; });

  const total = reviews.length;
  const average = total ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / total) * 10) / 10 : null;

  return { average, total, distribution };
};

const parseRating = (value, message) => {
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw serviceError(400, 'INVALID_RATING', message);
  }

  return value;
};

const parseComment = (value, max) => {
  if (value === undefined || value === null) return null;

  const comment = String(value).trim();

  if (comment.length > max) {
    throw serviceError(400, 'INVALID_COMMENT', `El comentario admite máximo ${max} caracteres`);
  }

  return comment === '' ? null : comment;
};

/**
 * El comensal califica un pedido suyo ya entregado (una sola vez):
 * estrellas del local y, opcionalmente, de los productos que consumió.
 */
export const createReview = async (dinerId, orderId, data = {}) => {
  const order = await orderRepository.findByIdAndDiner(orderId, dinerId);

  if (!order) {
    throw serviceError(404, 'ORDER_NOT_FOUND', 'Pedido no encontrado');
  }

  if (order.status.name !== 'entregado') {
    throw serviceError(409, 'ORDER_NOT_DELIVERED', 'Solo puedes calificar pedidos entregados');
  }

  if (await reviewRepository.findByOrder(order.id)) {
    throw serviceError(409, 'ALREADY_REVIEWED', 'Ya calificaste este pedido');
  }

  const storeRating = parseRating(data.store_rating, 'Califica el local con 1 a 5 estrellas');
  const comment = parseComment(data.comment, 500);

  const inOrder = new Set(order.items.map((item) => item.product_id).filter(Boolean));
  const sent = data.products === undefined || data.products === null ? [] : data.products;

  if (!Array.isArray(sent)) {
    throw serviceError(400, 'INVALID_PRODUCTS', 'Los productos calificados son inválidos');
  }

  const seen = new Set();
  const products = sent.map((product) => {
    if (!inOrder.has(product?.product_id) || seen.has(product.product_id)) {
      throw serviceError(400, 'INVALID_PRODUCTS', 'Un producto calificado no pertenece a tu pedido o está repetido');
    }
    seen.add(product.product_id);

    return {
      product_id: product.product_id,
      rating: parseRating(product.rating, 'Califica cada producto con 1 a 5 estrellas'),
      comment: parseComment(product.comment, 300)
    };
  });

  const review = await reviewRepository.create(
    { store_rating: storeRating, comment, order_id: order.id, diner_id: dinerId, store_id: order.store_id },
    products
  );

  return toView(review);
};

/**
 * Calificaciones públicas de un local, con resumen
 */
export const fetchStoreReviews = async (storeId) => {
  const reviews = (await reviewRepository.findAllByStore(storeId)).map((review) => toView(review));

  return { summary: summarize(reviews), reviews };
};

/**
 * Calificaciones que hizo el comensal, con la respuesta del local si la hay
 */
export const fetchMyReviews = async (dinerId) => {
  return (await reviewRepository.findAllByDiner(dinerId)).map((review) => toView(review, { forDiner: true }));
};

/**
 * Calificaciones del local en sesión (con el código del pedido y su respuesta)
 */
export const fetchMyStoreReviews = async (storeId) => {
  const reviews = (await reviewRepository.findAllByStore(storeId)).map((review) => toView(review, { forStore: true }));

  return { summary: summarize(reviews), reviews };
};

/**
 * El local responde (o corrige su respuesta a) una calificación
 */
export const replyReview = async (storeId, reviewId, data = {}) => {
  const review = await reviewRepository.findByIdAndStore(reviewId, storeId);

  if (!review) {
    throw serviceError(404, 'REVIEW_NOT_FOUND', 'Calificación no encontrada');
  }

  const reply = typeof data.reply === 'string' ? data.reply.trim() : '';

  if (!reply || reply.length > 500) {
    throw serviceError(400, 'INVALID_REPLY', 'La respuesta es obligatoria (máximo 500 caracteres)');
  }

  await reviewRepository.setReply(review, reply);

  return toView(await reviewRepository.findByIdAndStore(reviewId, storeId), { forStore: true });
};

/**
 * Promedio y cantidad de calificaciones de todos los locales (para la lista de locales)
 */
export const fetchRatingsByStore = async () => reviewRepository.ratingsByStore();
