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

export function PerfilVistaPrevia(req, res) {
  return res.render('enterprises/PerfilVistaPrevia', {
    title: 'Bienvenido Empresa',
    currentPage: 'PerfilVistaPrevia',
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
export function NuevoProducto(req, res) {
  return res.render('enterprises/NuevoProducto', {
    title: 'Bienvenido Empresa',
    currentPage: 'NuevoProducto',
  });
} 
export function resenas(req, res) {
  return res.render('enterprises/resenas', {
    title: 'Bienvenido Empresa',
    currentPage: 'resenas',
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