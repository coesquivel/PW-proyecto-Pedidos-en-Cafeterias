// src/api/owner.js
// Métricas del panel del owner (ventas, ranking, etc.)
import axios from 'axios';

const api = axios.create({ baseURL: '/api/v1', withCredentials: true });

const datos = (respuesta) => respuesta.data.data;

// Ventas por día y por local de los últimos N días: { from, to, stores, days }
export const obtenerVentasDiarias = async (dias = 60) =>
  datos(await api.get('/owner/sales-daily', { params: { days: dias } }));

// Calificaciones de los últimos N días por producto y por local: { from, to, products, stores }
export const obtenerRanking = async (dias = 30) =>
  datos(await api.get('/owner/ranking', { params: { days: dias } }));

// Ventas por producto y hora de recojo de los últimos N días: { from, to, stores, products, sales }
export const obtenerVentasPorProducto = async (dias = 30) =>
  datos(await api.get('/owner/product-sales', { params: { days: dias } }));

/* ---------- Comensales y locales (bloquear / suspender / reactivar) ---------- */
export const obtenerComensales = async () => datos(await api.get('/owner/diners'));

export const obtenerLocalesOwner = async () => datos(await api.get('/owner/stores'));

// status: 'bloqueado' (con motivo) | 'activo'
export const cambiarEstadoComensal = async (id, status, reason) =>
  datos(await api.patch(`/owner/diners/${id}/status`, { status, reason }));

// status: 'suspendido' (con motivo) | 'activo'
export const cambiarEstadoLocalOwner = async (id, status, reason) =>
  datos(await api.patch(`/owner/stores/${id}/status`, { status, reason }));
