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
  res.render('website/login', {
    title: 'Login',
    log_in_out: esta_logeado(req),
  });
}

export function registrarLocal(req, res) { 
  return res.render('website/registrarLocal', {
    title: 'registrarLocal',
    log_in_out: esta_logeado(req),
  });
}

export function comoFunciona(req, res) { 
  return res.render('website/comoFunciona', {
    title: 'comoFunciona',
    log_in_out: esta_logeado(req),
  });
}
export function locales(req, res) { 
  res.render('website/locales', {
    title: 'locales',
    log_in_out: esta_logeado(req),
  });
}

export function detalleLocal(req, res) {
  const localId = parseInt(req.params.id, 10);
  
  res.render('website/local', {
    title: 'Detalle del Local',
    localId: localId
  });
}
export function register(req, res) { 
  res.render('website/register', {
    title: 'register',
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
    { correo: 'comensal@comensal', password: '123', role: 'comensal' } 
  ]

  let userEncontrado = null;

  for(let i=0; i<usuarios.length;i++){
    if (usuarios[i].correo == correo && usuarios[i].password == password) {
      userEncontrado = usuarios[i];
    }
  }

  if (userEncontrado) {
    req.session.correo = userEncontrado.correo;
    req.session.role = userEncontrado.role;

    return req.session.save(() => {
      // Mapeo explícito de ruta según el rol del usuario
      if (req.session.role === 'enterprises') {
        return res.redirect('/enterprises');
      } else if (req.session.role === 'owner') {
        return res.redirect('/owner');
      } else if (req.session.role === 'comensal' || req.session.role === 'comensales') {
        return res.redirect('/comensales');
      } else {
        return res.redirect('/');
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

export const RecuperarContrasena = (req, res) => {
  res.render('website/RecuperarContrasena');
};

export function Home_Cerrar_ses(req, res) {
  const isAuthenticated = req.session && req.session.correo && req.session.role;
  if (isAuthenticated){
    req.session.destroy((err) => {
      if (err) {
        console.error('Error al cerrar sesión:', err);
        return res.status(500).send('No se pudo cerrar la sesión');
      }
      res.clearCookie('connect.sid'); // nombre por defecto de la cookie
      res.redirect('/');
    });
  }else{
    res.redirect('/login');
  }
}
