// admin/controllers/owner_controllers.js

// Todas las pantallas del panel del propietario son React: el servidor solo entrega
// la vista base (owner/home.ejs) y React Router muestra la pantalla
// que corresponde a la URL.
export function panel(req, res) {
  return res.render('owner/home', {
    title: 'Bienvenido Owner',
  });
}
