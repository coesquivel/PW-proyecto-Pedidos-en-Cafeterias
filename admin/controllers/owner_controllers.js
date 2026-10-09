// admin\controllers\owner_controllers.js

export function home(req, res) {
  return res.render('owner/home', {
    title: 'Bienvenido Owner',
    currentPage: 'home',
  });
}