// src/api/solicitudes.js
// Solicitudes de registro de locales (pantalla del owner).
import axios from 'axios';

const api = axios.create({ baseURL: '/api/v1', withCredentials: true });

const datos = (respuesta) => respuesta.data.data;

export const listarSolicitudes = async () => datos(await api.get('/store-requests', { params: { status: 'todos' } }));

// status: 'activo' (aprobar) | 'rechazado' (observar) | 'pendiente' (volver a revisión)
export const cambiarEstadoSolicitud = async (id, status) =>
  datos(await api.patch(`/store-requests/${id}/status`, { status }));
