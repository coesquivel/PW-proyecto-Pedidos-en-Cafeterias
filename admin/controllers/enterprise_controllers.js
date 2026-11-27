// admin/controllers/enterprise_controllers.js

// Todas las pantallas del panel de empresas son React: el servidor solo entrega
// la vista base (enterprises/home.ejs) y React Router muestra la pantalla
// que corresponde a la URL.
export function panel(req, res) {
  return res.render('enterprises/home', {
    title: 'Bienvenido Empresa',
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
