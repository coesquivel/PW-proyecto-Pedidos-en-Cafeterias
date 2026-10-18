// admin/controllers/comensal_controllers.js

export function home(req, res) {
  return res.render('comensales/home', {
    title: 'Inicio - Comensal',
    currentPage: 'home',
  });
}

export function localescomensal(req, res) {
  return res.render('comensales/localescomensal', {
    title: 'Locales - Comensal',
    currentPage: 'localescomensal',
  });
}

export function pedidos(req, res) {
  return res.render('comensales/pedidos', {
    title: 'Mis Pedidos - Comensal',
    currentPage: 'pedidos',
  });
}

export function calificaciones(req, res) {
  return res.render('comensales/calificaciones', {
    title: 'Mis Calificaciones - Comensal',
    currentPage: 'calificaciones',
  });
}

export function micuenta(req, res) {
  return res.render('comensales/micuenta', {
    title: 'Mi Cuenta - Comensal',
    currentPage: 'micuenta',
  });
}

export function carrito(req, res) {
  return res.render('comensales/carrito', {
    title: 'Carrito - Comensal',
    currentPage: 'carrito',
  });
}