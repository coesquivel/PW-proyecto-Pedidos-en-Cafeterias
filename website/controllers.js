// website/controllers.js
import { authenticate } from '../admin/services/auth_services.js';
import { fetchAllActive, fetchActiveById } from '../admin/services/stores_services.js';
import { fetchStoreReviews } from '../admin/services/reviews_services.js';
import storeProfileRepository from '../admin/repositories/store_profile_repository.js';
import { nowInLima, isoWeekday } from '../admin/services/lima_time.js';

// ---- Datos reales de los locales para las páginas públicas ----
const IMAGEN_DEFECTO = '/assets/img/cafeteria-web.jpg';
const IMAGEN_POR_ID = {
  1: '/assets/img/cafeteriaCentral.png',
  2: '/assets/img/sangucheria.png',
  3: '/assets/img/cafeBiblioteca.png',
  4: '/assets/img/jugueria.png',
  5: '/assets/img/cafeteria-web.jpg'
};
const NOMBRE_DIA = { 1: 'lunes', 2: 'martes', 3: 'miércoles', 4: 'jueves', 5: 'viernes', 6: 'sábado', 7: 'domingo' };
// Máximo de calificaciones que se cargan en la ventana flotante del detalle (las más recientes)
const MAX_CALIFICACIONES_PUBLICAS = 30;

// Horario de hoy (hora de Lima) o cuándo abre de nuevo
const textoHorario = (store) => {
  const hoy = store.schedule.find((d) => d.day_of_week === isoWeekday(nowInLima().date));

  if (hoy && !hoy.is_closed) {
    return `${hoy.open_time} a ${hoy.close_time}`;
  }
  if (store.next_open) {
    const { days_ahead, day_of_week, time } = store.next_open;
    return days_ahead === 0 ? `abre ${time}` : `abre el ${NOMBRE_DIA[day_of_week]} ${time}`;
  }
  return 'Sin horario';
};

const localParaVista = (store) => ({
  id: store.id,
  nombre: store.commercial_name,
  imagen: store.logo_url || IMAGEN_POR_ID[store.id] || IMAGEN_DEFECTO,
  abierto: Boolean(store.open_now),
  ubicacion: store.campus_location || store.campus,
  campus: store.campus,
  horario: textoHorario(store),
  descripcion: store.description || 'Este local aún no agregó una descripción.',
  calificacion: store.rating_average,
  totalCalificaciones: store.rating_count
});

const cargarLocales = async () => (await fetchAllActive()).map(localParaVista);

export async function home(req, res) {
  let locales = [];
  try {
    locales = await cargarLocales();
  } catch (error) {
    console.error('Error al cargar los locales del home:', error);
  }

  return res.render('website/home', {
    title: 'Crear cuenta :)',
    currentPage: 'home',
    log_in_out: esta_logeado(req),
    locales: locales.slice(0, 4),
    totalLocales: locales.length,
    description:
      'Esta es una aplicación de ejemplo creada con Node.js, Express y EJS.'
  });
}

export function login(req, res) { 
  res.render('website/login', {
    title: 'Login',
    log_in_out: esta_logeado(req),
  });
}

export function registrarLocal(req, res) { 
  return res.render('website/registrarLocal', {
    title: 'registrarLocal',
    log_in_out: esta_logeado(req),
  });
}

export function comoFunciona(req, res) { 
  return res.render('website/comoFunciona', {
    title: 'comoFunciona',
    log_in_out: esta_logeado(req),
  });
}
export async function locales(req, res) {
  let lista = [];
  try {
    lista = await cargarLocales();
  } catch (error) {
    console.error('Error al cargar los locales:', error);
  }

  res.render('website/locales', {
    title: 'locales',
    log_in_out: esta_logeado(req),
    locales: lista
  });
}

export async function detalleLocal(req, res) {
  const localId = parseInt(req.params.id, 10);

  try {
    const store = Number.isInteger(localId) ? await fetchActiveById(localId) : null;
    if (!store) return res.redirect('/locales');

    const localData = localParaVista(store);

    // La primera foto del perfil, si el local subió alguna, reemplaza la imagen por defecto
    const perfil = await storeProfileRepository.findProfile(store.id);
    const foto = perfil?.photos?.[0]?.url;
    if (foto) localData.imagen = foto;

    // Solo las más recientes, para que la página no crezca sin límite
    const { summary, reviews } = await fetchStoreReviews(store.id);

    return res.render('website/local', {
      title: 'Detalle del Local',
      localId: store.id,
      localData,
      calificaciones: { summary, reviews: reviews.slice(0, MAX_CALIFICACIONES_PUBLICAS) },
      log_in_out: esta_logeado(req)
    });
  } catch (error) {
    console.error('Error al cargar el detalle del local:', error);
    return res.redirect('/locales');
  }
}
export function register(req, res) { 
  res.render('website/register', {
    title: 'register',
  });
}

export function logout(req, res) {
  req.session.destroy(err => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.redirect('/');
    }

    // Limpia la cookie de sesión (opcional pero recomendado)
    res.clearCookie('connect.sid');

    // Redirige al login
    res.redirect('/sign-in');
  });
}

export async function ingresar(req, res) {
  const { correo, password } = req.body;

  const renderError = (mensaje) =>
    res.render('website/login', {
      title: 'Login',
      mensaje,
      error: mensaje,
      correoIngresado: correo,
      log_in_out: esta_logeado(req)
    });

  let resultado;
  try {
    resultado = await authenticate(correo, password);
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return renderError('No se pudo iniciar sesión. Intenta de nuevo.');
  }

  if (!resultado.ok) {
    if (resultado.reason === 'ACCOUNT_PENDING') {
      return renderError('Tu solicitud de registro aún está en revisión. Te avisaremos cuando sea aprobada.');
    }
    if (resultado.reason === 'ACCOUNT_REJECTED') {
      return renderError('Tu solicitud de registro fue observada. Comunícate con la administración del campus.');
    }
    if (resultado.reason === 'ACCOUNT_BLOCKED') {
      return renderError('Tu cuenta está bloqueada o suspendida.');
    }
    return renderError('Correo o contraseña incorrectos. Te quedan 4 intentos.');
  }

  const { user } = resultado;
  req.session.correo = user.email;
  req.session.role = user.role;
  req.session.user = user;

  return req.session.save(() => {
    if (user.role === 'enterprises') return res.redirect('/enterprises');
    if (user.role === 'owner') return res.redirect('/owner');
    if (user.role === 'comensal' || user.role === 'comensales') {
      return res.redirect('/comensales');
    }
    return res.redirect('/');
  });
}
function esta_logeado(req) {
  const isAuthenticated = req.session && req.session.correo && req.session.role;
  let b = 'Cerrar sesión';
  if (!isAuthenticated) {
    req.session.role = null;
    b = 'Iniciar sesión';
  }
  return b;
}

export const RecuperarContrasena = (req, res) => {
  res.render('website/RecuperarContrasena');
};

export function Home_Cerrar_ses(req, res) {
  const isAuthenticated = req.session && req.session.correo && req.session.role;
  if (isAuthenticated){
    req.session.destroy((err) => {
      if (err) {
        console.error('Error al cerrar sesión:', err);
        return res.status(500).send('No se pudo cerrar la sesión');
      }
      res.clearCookie('connect.sid'); // nombre por defecto de la cookie
      res.redirect('/');
    });
  }else{
    res.redirect('/login');
  }
}
