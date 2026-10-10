// website/controllers.js
export function home(req, res) { 
  return res.render('website/home', {
    title: 'Crear cuenta :)',
    currentPage: 'home',
    log_in_out: esta_logeado(req),
    description:
      'Esta es una aplicación de ejemplo creada con Node.js, Express y EJS.'
  });
}

export function login(req, res) { 
  return res.render('website/login', {
    title: 'Login',
    
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

export async function ingresar(req, res){
  const { correo, password} = req.body;
  const principal = 'enterprises';
  const usuarios = [
    {correo : 'admin@admin', password: '123', role: principal},
    {correo : 'x@x', password: '123', role: 'owner'},
  ]

  let userEncontrado = null;

  for(let i=0; i<usuarios.length;i++){
    if (usuarios[i].correo == correo && usuarios[i].password == password) {
      userEncontrado = usuarios[i];
    }
  }

  if (userEncontrado != null) {
    req.session.correo = userEncontrado.correo;
    req.session.role = userEncontrado.role;
    return req.session.save(() => {
      if (req.session.role == principal) {
        res.redirect(`/${principal}`);
      } else {
        res.redirect('/owner');
      }
    });
  }

//return res.send(`usuario: ${correo} contraseña: ${password}`);
return res.render('website/login', {
    title: 'Login',
    mensaje: 'No encontrado',
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