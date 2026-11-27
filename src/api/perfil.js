// src/api/perfil.js
// Perfil del local en sesión: datos, contacto, logo y galería de fotografías.
import axios from 'axios';
import { archivoADataUrl, subirLogoLocal } from './carta';

const api = axios.create({ baseURL: '/api/v1', withCredentials: true });

const datos = (respuesta) => respuesta.data.data;

export const obtenerPerfilLocal = async () => datos(await api.get('/my-store/profile'));

// { commercial_name, campus_location, description, phone }
export const guardarPerfilLocal = async (perfil) => datos(await api.put('/my-store/profile', perfil));

export const agregarFotoLocal = async (archivo) =>
  datos(await api.post('/my-store/photos', { image: await archivoADataUrl(archivo) }));

export const quitarFotoLocal = async (idFoto) => api.delete(`/my-store/photos/${idFoto}`);

export const cambiarLogoLocal = async (archivo) => subirLogoLocal(await archivoADataUrl(archivo));
