// admin/controllers/comensal_controllers.js

export function home(req, res) {
  return res.render('comensales/home', {
    title: 'Inicio - Comensal',
    currentPage: 'home',
  });
}

export function localescomensal(req, res) {
  return res.render('comensales/LocalesComensal', {
    title: 'Locales - Comensal',
    currentPage: 'localescomensal',
  });
}

export function pedidos(req, res) {
  return res.render('comensales/PedidosComensal', {
    title: 'Mis Pedidos - Comensal',
    currentPage: 'pedidos',
  });
}

export function calificaciones(req, res) {
  return res.render('comensales/CalificacionesComensal', {
    title: 'Mis Calificaciones - Comensal',
    currentPage: 'calificaciones',
  });
}

export function micuenta(req, res) {
  return res.render('comensales/MiCuentaComensal', {
    title: 'Mi Cuenta - Comensal',
    currentPage: 'micuenta',
  });
}

export function carrito(req, res) {
  return res.render('comensales/CarritoComensal', {
    title: 'Carrito - Comensal',
    currentPage: 'carrito',
  });
}

export function salir(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.status(500).send('No se pudo cerrar la sesión');
    }
    res.clearCookie('connect.sid'); // nombre por defecto de la cookie
    res.redirect('/login');
  });
}