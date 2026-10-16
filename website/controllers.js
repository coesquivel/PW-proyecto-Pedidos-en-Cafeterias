// website/controllers.js
export function home(req, res) { 
  return res.render('website/home', {
    title: 'Crear cuenta :)',
    currentPage: 'home',
    description:
      'Esta es una aplicación de ejemplo creada con Node.js, Express y EJS.'
  });
}

export function login(req, res) { 
  return res.render('website/login', {
    title: 'Login',
    
  });
}

export function registrarLocal(req, res) { 
  return res.render('website/registrarLocal', {
    title: 'registrarLocal',
    
  });
}

export function comoFunciona(req, res) { 
  return res.render('website/comoFunciona', {
    title: 'comoFunciona',
    
  });
}