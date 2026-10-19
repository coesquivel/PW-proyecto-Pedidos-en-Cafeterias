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