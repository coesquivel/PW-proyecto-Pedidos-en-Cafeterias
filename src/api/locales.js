// src/api/locales.js
// Llamadas a la API pública de locales y cartas (la usa el comensal)
// y conversión al formato que esperan las pantallas.
import axios from 'axios';

const api = axios.create({ baseURL: '/api/v1', withCredentials: true });

const datos = (respuesta) => respuesta.data.data;

/* ---------- Llamadas ---------- */
// Local del usuario en sesión (panel del local)
export const obtenerMiLocal = async () => datos(await api.get('/my-store'));

// Estado de recepción del local: 'abierto' | 'suspendido' | 'cerrado'.
// Avisa a las demás partes de la pantalla (encabezado y Agotados) para que no se desfasen.
export const cambiarEstadoLocal = async (status) => {
  const local = datos(await api.put('/my-store/status', { status }));
  window.dispatchEvent(new CustomEvent('estado-local', { detail: local.reception_status }));
  return local;
};

export const obtenerLocales = async () => datos(await api.get('/stores'));

// Un local con su horario (la pantalla de confirmación lo usa para armar las franjas)
export const obtenerLocal = async (idLocal) => datos(await api.get(`/stores/${idLocal}`));

export const obtenerCartaLocal = async (idLocal) =>
  datos(await api.get(`/stores/${idLocal}/products`));

/* ---------- Conversiones ---------- */

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

// { days_ahead, day_of_week, time } -> "hoy a las 07:00" / "mañana a las 07:00" / "el lunes a las 07:00"
const textoApertura = (proxima) => {
  if (!proxima) return '';
  if (proxima.days_ahead === 0) return `hoy a las ${proxima.time}`;
  if (proxima.days_ahead === 1) return `mañana a las ${proxima.time}`;
  return `el ${DIAS_SEMANA[proxima.day_of_week % 7]} a las ${proxima.time}`;
};

// Local de la base de datos -> tarjeta de "Locales del campus".
// El estado sale del horario del local (hora de Lima) y de lo que elige el dueño (Suspendido / Cerrado).
// Aún no hay reseñas en la base, por eso sin tiempo/calificación.
export const localALista = (local) => ({
  id: local.id,
  nombre: local.commercial_name,
  estado:
    local.reception_status === 'suspendido' ? 'Suspendido' : local.open_now ? 'Abierto' : 'Cerrado',
  ubicacion: local.campus_location || '',
  tiempoPrep: '',
  calificacion: local.rating_average ?? null,
  logo: local.logo_url || null,
  aperturaProx: textoApertura(local.next_open),
});

// Producto de la base de datos -> producto de la carta del comensal
export const productoAComensal = (producto) => ({
  id: producto.id,
  nombre: producto.name,
  descripcion: producto.description || '',
  precio: Number(producto.price),
  categoria: producto.category ? producto.category.name : 'Otros',
  categoriaOrden: producto.category ? producto.category.display_order : 0,
  categoriaId: producto.category_id,
  agotado: !producto.available,
  imagen: producto.picture_url || null,
  tiempoPrep: producto.preparation_time,
  // Grupos de opciones y agregados que el comensal puede elegir
  grupos: (producto.option_groups || []).map((g) => ({
    id: g.id,
    nombre: g.name,
    seleccion: g.selection_type,
    obligatorio: g.is_required,
    alternativas: g.options.map((o) => ({ id: o.id, nombre: o.name, precio: o.additional_price })),
  })),
});

// Nombres de categoría sin repetir, en el orden definido por el local
export const categoriasDeCarta = (productos) => {
  const vistas = new Map();
  productos.forEach((p) => {
    if (!vistas.has(p.categoria)) {
      vistas.set(p.categoria, { orden: p.categoriaOrden, id: p.categoriaId });
    }
  });

  return [...vistas.entries()]
    .sort((a, b) => a[1].orden - b[1].orden || a[1].id - b[1].id)
    .map(([nombre]) => nombre);
};

/* ---------- Cuenta en sesión ---------- */
// { name, initials, role, ... } del usuario que inició sesión.
export const obtenerMiPerfil = async () => datos(await api.get('/me'));
