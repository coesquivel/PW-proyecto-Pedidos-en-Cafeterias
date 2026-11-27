import { randomUUID } from 'node:crypto';
import orderRepository from '../repositories/orders_repository.js';
import cartRepository from '../repositories/carts_repository.js';
import scheduleRepository from '../repositories/schedules_repository.js';
import { nowInLima, addDays, toMinutes } from './lima_time.js';
import { normalizeSchedule, isValidSlot } from './schedule_rules.js';
import { serviceError } from './errors.js';
import { assertDinerCanOrder } from './diners_services.js';

// Estado actual -> estados a los que puede pasar el local
const TRANSITIONS = {
  recibido: ['preparacion', 'rechazado'],
  preparacion: ['listo'],
  listo: ['entregado']
};

const redondear = (n) => Math.round(n * 100) / 100;

export const todayInLima = () => nowInLima().date;

/**
 * Pedido de la base -> formato que usa el front
 */
const toView = (order) => {
  const items = order.items.map((item) => ({
    id: item.id,
    name: item.product_name,
    product_id: item.product_id,
    unit_price: item.unit_price,
    quantity: item.quantity,
    subtotal: item.subtotal,
    notes: item.notes,
    options: item.options.map((option) => ({
      name: option.option_name,
      additional_price: option.additional_price
    }))
  }));

  return {
    id: order.id,
    code: order.code,
    status: order.status.name,
    reviewed: Boolean(order.review),
    pickup_date: order.pickup_date,
    pickup_time: String(order.pickup_time).slice(0, 5),
    total: order.total_amount,
    created: order.created,
    store: {
      id: order.store.id,
      name: order.store.commercial_name,
      campus_location: order.store.campus_location
    },
    diner: {
      id: order.diner.id,
      name: `${order.diner.first_name} ${order.diner.last_name}`
    },
    items,
    items_count: items.reduce((sum, item) => sum + item.quantity, 0)
  };
};

/**
 * Convierte el carrito del comensal en un pedido
 */
export const createFromCart = async (dinerId, data = {}) => {
  await assertDinerCanOrder(dinerId);

  const pickupTime = typeof data.pickup_time === 'string' ? data.pickup_time : '';

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(pickupTime)) {
    throw serviceError(400, 'INVALID_PICKUP_TIME', 'La hora de recojo debe tener el formato HH:MM');
  }

  const now = nowInLima();
  const pickupDate = data.pickup_date === undefined ? now.date : data.pickup_date;

  if (pickupDate !== now.date && pickupDate !== addDays(now.date, 1)) {
    throw serviceError(400, 'INVALID_PICKUP_DATE', 'Solo puedes programar para hoy o mañana');
  }

  const cart = await cartRepository.findByDiner(dinerId);

  if (!cart || cart.items.length === 0) {
    throw serviceError(400, 'CART_EMPTY', 'Tu carrito está vacío');
  }

  if (cart.store.operative_status !== 'activo') {
    throw serviceError(409, 'STORE_NOT_ACTIVE', 'El local no está recibiendo pedidos');
  }

  if (cart.store.reception_status !== 'abierto') {
    throw serviceError(409, 'STORE_NOT_RECEIVING', 'El local no está recibiendo pedidos en este momento');
  }

  const unavailable = cart.items.filter((item) => !item.product.available);

  if (unavailable.length > 0) {
    const names = unavailable.map((item) => item.product.name).join(', ');
    throw serviceError(409, 'PRODUCT_UNAVAILABLE', `Estos productos se agotaron: ${names}. Quítalos del carrito para continuar`);
  }

  // La hora de recojo debe ser una franja del horario del local ese día
  const schedule = normalizeSchedule(
    (await scheduleRepository.findByStore(cart.store_id)).map((row) => row.toJSON())
  );

  if (!isValidSlot(schedule, pickupDate, pickupTime)) {
    throw serviceError(400, 'PICKUP_OUTSIDE_HOURS', 'El local no atiende en esa hora. Elige una franja de su horario');
  }

  // La hora de recojo debe alcanzar para preparar el producto más lento
  const prep = Math.max(0, ...cart.items.map((item) => item.product.preparation_time || 0));

  if (pickupDate === now.date && toMinutes(pickupTime) < now.minutes + prep) {
    throw serviceError(400, 'PICKUP_TOO_SOON', 'Esa hora ya no alcanza para preparar tu pedido. Elige una más tarde');
  }

  const status = await orderRepository.findStatusByName('recibido');

  // El precio unitario incluye las opciones elegidas; cada opción se copia con su nombre y precio de hoy
  const items = cart.items.map((item) => {
    const options = item.chosen.map((choice) => ({
      option_name: choice.option.name,
      additional_price: choice.option.additional_price
    }));
    const unitPrice = redondear(item.product.price + options.reduce((sum, option) => sum + option.additional_price, 0));

    return {
      product_name: item.product.name,
      unit_price: unitPrice,
      quantity: item.quantity,
      subtotal: redondear(unitPrice * item.quantity),
      notes: item.notes,
      product_id: item.product_id,
      options
    };
  });

  const orderId = await orderRepository.createFromCart({
    order: {
      // código provisorio; el repositorio lo cambia por PED-000N con el id
      code: randomUUID().replaceAll('-', '').slice(0, 10),
      pickup_date: pickupDate,
      pickup_time: pickupTime,
      total_amount: redondear(items.reduce((sum, item) => sum + item.subtotal, 0)),
      diner_id: dinerId,
      store_id: cart.store_id,
      status_id: status.id
    },
    items,
    cartId: cart.id
  });

  return toView(await orderRepository.findByIdAndDiner(orderId, dinerId));
};

/**
 * Pedidos del comensal
 */
export const fetchByDiner = async (dinerId) => {
  const orders = await orderRepository.findAllByDiner(dinerId);

  return orders.map(toView);
};

/**
 * Pedidos del local (hoy en adelante + pendientes anteriores)
 */
export const fetchByStore = async (storeId) => {
  const orders = await orderRepository.findAllByStore(storeId, todayInLima());

  return orders.map(toView);
};

/**
 * Pedidos del local con recojo en una fecha (YYYY-MM-DD); sin fecha, los de hoy (hora de Lima)
 */
export const fetchDayByStore = async (storeId, rawDate) => {
  const date = rawDate === undefined || rawDate === '' ? todayInLima() : String(rawDate);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
    throw serviceError(400, 'INVALID_DATE', 'La fecha debe tener el formato AAAA-MM-DD');
  }

  const orders = await orderRepository.findAllByStoreAndDate(storeId, date);

  return { date, orders: orders.map(toView) };
};

/**
 * Buscar un pedido del local por su código ("PED-0012" o solo "12" / "0012")
 */
export const fetchByCode = async (storeId, rawCode) => {
  const text = String(rawCode || '').trim().toUpperCase();
  const digits = text.replace(/\D/g, '');

  if (!digits || digits.length > 6) {
    throw serviceError(400, 'INVALID_CODE', 'Escribe el código del pedido');
  }

  const order = await orderRepository.findByCodeAndStore(`PED-${digits.padStart(4, '0')}`, storeId);

  if (!order) {
    throw serviceError(404, 'ORDER_NOT_FOUND', `No hay ningún pedido con el código ${text}`);
  }

  return toView(order);
};

/**
 * El local cambia el estado de un pedido suyo (solo transiciones permitidas)
 */
export const changeStatus = async (storeId, orderId, newStatus) => {
  const order = await orderRepository.findByIdAndStore(orderId, storeId);

  if (!order) {
    throw serviceError(404, 'ORDER_NOT_FOUND', 'Pedido no encontrado');
  }

  const allowed = TRANSITIONS[order.status.name] || [];

  if (!allowed.includes(newStatus)) {
    throw serviceError(409, 'INVALID_TRANSITION', `Un pedido "${order.status.name}" no puede pasar a "${newStatus}"`);
  }

  const status = await orderRepository.findStatusByName(newStatus);

  await orderRepository.updateStatus(order, status.id);

  return toView(await orderRepository.findByIdAndStore(orderId, storeId));
};
