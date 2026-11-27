// src/api/resenas.js
// Calificaciones: el comensal califica pedidos entregados; el local las ve y responde.
import axios from 'axios';

const api = axios.create({ baseURL: '/api/v1', withCredentials: true });

const datos = (respuesta) => respuesta.data.data;

// { summary: { average, total, distribution }, reviews: [...] } de un local (vista del comensal)
export const obtenerResenasLocal = async (idLocal) => datos(await api.get(`/stores/${idLocal}/reviews`));

// body: { store_rating, comment, products: [{ product_id, rating, comment }] }
export const enviarCalificacion = async (idPedido, body) =>
  datos(await api.post(`/my-orders/${idPedido}/review`, body));

// Calificaciones que hizo el comensal en sesión (con la respuesta del local)
export const obtenerMisCalificaciones = async () => datos(await api.get('/my-reviews'));

// Calificaciones del local en sesión (con el código del pedido y su respuesta)
export const obtenerMisResenas = async () => datos(await api.get('/my-store/reviews'));

export const responderResena = async (idResena, reply) =>
  datos(await api.patch(`/my-store/reviews/${idResena}/reply`, { reply }));
