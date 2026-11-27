// src/api/pedidos.js
// Carrito y pedidos del comensal, y bandeja/entrega del local.
// La API responde { success, message, data, error }.
import axios from 'axios';

const api = axios.create({ baseURL: '/api/v1', withCredentials: true });

const datos = (respuesta) => respuesta.data.data;

/* ---------- Carrito del comensal ---------- */
export const CARRITO_VACIO = { id: null, store: null, items: [], total: 0, count: 0 };

export const obtenerCarrito = async () => datos(await api.get('/my-cart'));

export const agregarAlCarrito = async ({ product_id, quantity, notes, options }) =>
  datos(await api.post('/my-cart/items', { product_id, quantity, notes, options }));

export const cambiarCantidadCarrito = async (idItem, quantity) =>
  datos(await api.patch(`/my-cart/items/${idItem}`, { quantity }));

export const quitarDelCarrito = async (idItem) => datos(await api.delete(`/my-cart/items/${idItem}`));

// Vuelve a agregar al carrito los productos de un pedido anterior.
// Devuelve { cart, skipped }; con replace=true vacía antes el carrito.
export const repetirPedido = async (idPedido, replace = false) =>
  datos(await api.post(`/my-orders/${idPedido}/repeat`, { replace }));

export const vaciarCarrito = async () => datos(await api.delete('/my-cart'));

/* ---------- Pedidos del comensal ---------- */
export const confirmarPedido = async ({ pickup_time, pickup_date }) =>
  datos(await api.post('/my-orders', { pickup_time, pickup_date }));

export const obtenerMisPedidos = async () => datos(await api.get('/my-orders'));

/* ---------- Pedidos del local ---------- */
export const obtenerPedidosLocal = async () => datos(await api.get('/my-store/orders'));

// Pedidos con recojo en una fecha 'YYYY-MM-DD' (Resumen del día): { date, orders }
export const obtenerPedidosDelDia = async (fecha) =>
  datos(await api.get('/my-store/orders/day', { params: { date: fecha } }));

export const buscarPedidoPorCodigo = async (codigo) =>
  datos(await api.get(`/my-store/orders/by-code/${encodeURIComponent(codigo)}`));

export const cambiarEstadoPedido = async (idPedido, status) =>
  datos(await api.patch(`/my-store/orders/${idPedido}/status`, { status }));

/* ---------- Fechas y horas (siempre en hora de Lima) ---------- */
const ZONA = 'America/Lima';

// { fecha: 'YYYY-MM-DD', minutos: minutos desde las 00:00 } de ahora en Lima
export const ahoraEnLima = () => {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: ZONA,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(new Date()).map((p) => [p.type, p.value])
  );
  return {
    fecha: `${partes.year}-${partes.month}-${partes.day}`,
    minutos: (Number(partes.hour) % 24) * 60 + Number(partes.minute),
  };
};

export const sumarDias = (fecha, dias) => {
  const [a, m, d] = fecha.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10);
};

// 1 = lunes ... 7 = domingo (igual que day_of_week en la base)
export const diaDeSemana = (fecha) => {
  const dia = new Date(`${fecha}T00:00:00Z`).getUTCDay();
  return dia === 0 ? 7 : dia;
};

// '2026-11-24' -> '24/11/2026'
export const fechaCorta = (fecha) => fecha.split('-').reverse().join('/');

export const horaAMinutos = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/* ---------- Estados ---------- */
export const ETIQUETA_ESTADO = {
  recibido: 'Recibido',
  preparacion: 'En preparación',
  listo: 'Listo para recoger',
  entregado: 'Entregado',
  rechazado: 'Rechazado',
};

export const minutosAHora = (minutos) =>
  `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;

export const ESTADOS_EN_CURSO = ['recibido', 'preparacion', 'listo'];
