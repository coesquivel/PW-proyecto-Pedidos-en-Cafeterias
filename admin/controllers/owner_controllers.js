// admin\controllers\owner_controllers.js

export function home(req, res) {
  return res.render('owner/tablero', {
    title: 'Bienvenido Owner',
    currentPage: 'home',
  });
}

export function ranking(req, res) {
  return res.render('owner/ranking', {
    title: 'Ranking de productos y locales',
    currentPage: 'ranking',
  });
}

export function ventas(req, res) {
  return res.render('owner/ventas', {
    title: 'Ranking de productos y locales',
    currentPage: 'ranking',
  });
}

export function tablero(req, res) {
  return res.render('owner/tablero', {
    title: 'Ranking de productos y locales',
    currentPage: 'ranking',
  });
}

export function comensales(req, res) {
  return res.render('owner/comensales', {
    title: 'Ranking de productos y locales',
    currentPage: 'ranking',
  });
}

export function solicitudes(req, res) {
  return res.render('owner/solicitudes', {
    title: 'Ranking de productos y locales',
    currentPage: 'ranking',
  });
}