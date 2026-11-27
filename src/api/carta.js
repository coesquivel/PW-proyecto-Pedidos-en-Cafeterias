// src/api/carta.js
// Llamadas a la API de "Mi carta" (categorías y productos del local en sesión)
// y conversión entre el formato de la base de datos y el de las pantallas.
import axios from 'axios';

const api = axios.create({ baseURL: '/api/v1', withCredentials: true });

// Respuesta de la API: { success, message, data, error }
const datos = (respuesta) => respuesta.data.data;

// Mensaje legible para mostrar al usuario cuando una llamada falla
export const mensajeDeError = (error, porDefecto = 'Ocurrió un error. Intenta de nuevo.') =>
  error?.response?.data?.message || porDefecto;

/* ---------- Categorías ---------- */
export const obtenerCategorias = async () => datos(await api.get('/my-store/categories'));

export const crearCategoria = async (name, display_order = 0) =>
  datos(await api.post('/my-store/categories', { name, display_order }));

export const eliminarCategoria = async (id) => api.delete(`/my-store/categories/${id}`);

/* ---------- Productos ---------- */
export const obtenerProductos = async () => datos(await api.get('/my-store/products'));

export const crearProducto = async (producto) =>
  datos(await api.post('/my-store/products', producto));

export const actualizarProducto = async (id, producto) =>
  datos(await api.put(`/my-store/products/${id}`, producto));

export const eliminarProducto = async (id) => api.delete(`/my-store/products/${id}`);

/* ---------- Conversiones ---------- */

// 5 -> "5"  (el formulario ya muestra la unidad "min" aparte)
export const tiempoAFormulario = (minutos) =>
  minutos === null || minutos === undefined ? '' : String(minutos);

// "5" / "5 min" / "5 minutos" -> 5   (si no hay número -> null)
export const textoATiempo = (texto) => {
  const coincidencia = String(texto ?? '').match(/\d+/);
  return coincidencia ? parseInt(coincidencia[0], 10) : null;
};

// Producto de la base de datos -> tarjeta de "Mi carta"
export const productoACarta = (producto) => ({
  id: producto.id,
  name: producto.name,
  desc: [
    producto.description,
    producto.preparation_time !== null && producto.preparation_time !== undefined
      ? `${producto.preparation_time} min`
      : null,
  ]
    .filter(Boolean)
    .join(' · '),
  status: producto.available ? 'Disponible' : 'Agotado',
  price: Number(producto.price).toFixed(2),
  category_id: producto.category_id,
  picture_url: producto.picture_url,
  raw: producto,
});

// Formulario de "Nuevo producto" -> datos que espera la API
export const formularioAProducto = (form, categorias) => {
  const categoria = categorias.find((c) => c.name === form.categoria);

  return {
    name: String(form.nombre ?? '').trim(),
    description: String(form.descripcion ?? '').trim() || null,
    category_id: categoria ? categoria.id : null,
    price: Number(form.precio),
    preparation_time: textoATiempo(form.tiempo),
    available: form.disponibilidad === 'Disponible',
  };
};

/* ---------- Opciones y agregados de un producto ---------- */
export const obtenerGruposDeProducto = async (productoId) =>
  datos(await api.get(`/my-store/products/${productoId}/option-groups`));

export const crearGrupo = async (productoId, grupo) =>
  datos(await api.post(`/my-store/products/${productoId}/option-groups`, grupo));

export const actualizarGrupo = async (grupoId, grupo) =>
  datos(await api.put(`/my-store/option-groups/${grupoId}`, grupo));

export const eliminarGrupoApi = async (grupoId) => api.delete(`/my-store/option-groups/${grupoId}`);

/* ---------- Fotos (se guardan en public/assets/img/uploads) ---------- */
const TIPOS_IMAGEN = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_IMAGEN = 3 * 1024 * 1024;

// Valida el archivo elegido y lo convierte en data URL; lanza Error con un mensaje para mostrar
export const archivoADataUrl = (archivo) =>
  new Promise((resolve, reject) => {
    if (!TIPOS_IMAGEN.includes(archivo.type)) return reject(new Error('La imagen debe ser PNG, JPG o WEBP.'));
    if (archivo.size > MAX_IMAGEN) return reject(new Error('La imagen debe pesar menos de 3 MB.'));

    const lector = new FileReader();
    lector.onload = () => resolve(lector.result);
    lector.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    lector.readAsDataURL(archivo);
  });

export const subirFotoProducto = async (productoId, image) =>
  datos(await api.post(`/my-store/products/${productoId}/picture`, { image }));

export const quitarFotoProducto = async (productoId) =>
  datos(await api.delete(`/my-store/products/${productoId}/picture`));

export const subirLogoLocal = async (image) => datos(await api.put('/my-store/logo', { image }));

export const quitarLogoLocal = async () => datos(await api.delete('/my-store/logo'));
