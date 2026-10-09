// admin\controllers\enterprise_controllers.js

export function home(req, res) {
  return res.render('enterprises/home', {
    title: 'Bienvenido Empresa',
    currentPage: 'home',
  });
}

export function bandeja(req, res) {
  return res.render('enterprises/bandeja', {
    title: 'Bienvenido Empresa',
    currentPage: 'bandeja',
  });
}

export function resumenDia(req, res) {
  return res.render('enterprises/resumenDia', {
    title: 'Bienvenido Empresa',
    currentPage: 'resumenDia',
  });
}

export function entrega(req, res) {
  return res.render('enterprises/entrega', {
    title: 'Bienvenido Empresa',
    currentPage: 'entrega',
  });
}
export function opcionesAgregados(req, res) {
  return res.render('enterprises/opcionesAgregados', {
    title: 'Bienvenido Empresa',
    currentPage: 'opcionesAgregados',
  });
}
export function agotados(req, res) {
  return res.render('enterprises/agotados', {
    title: 'Bienvenido Empresa',
    currentPage: 'agotados',
  });
}
export function perfil(req, res) {
  return res.render('enterprises/perfil', {
    title: 'Bienvenido Empresa',
    currentPage: 'perfil',
  });
}
export function horario(req, res) {
  return res.render('enterprises/horario', {
    title: 'Bienvenido Empresa',
    currentPage: 'horario',
  });
}

export function Micarta(req, res) {
  return res.render('enterprises/Micarta', {
    title: 'Bienvenido Empresa',
    currentPage: 'Micarta',
  });
} 