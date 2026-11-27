import dinerRepository from '../repositories/diners_repository.js';

const iniciales = (texto) => {
  const partes = String(texto).trim().split(/\s+/).filter(Boolean);
  const letras = partes.length > 1
    ? partes[0][0] + partes[partes.length - 1][0]
    : String(texto).slice(0, 2);
  return letras.toUpperCase();
};

/**
 * Datos de la cuenta en sesión para mostrar en la cabecera.
 * Comensal: nombre y apellido del perfil diners. Otros roles: el correo.
 */
export const fetchSessionProfile = async (sessionUser) => {
  let name = sessionUser.email;
  let dinerId = null;

  if (sessionUser.role === 'comensal') {
    const diner = await dinerRepository.findByUserId(sessionUser.id);

    if (diner) {
      name = `${diner.first_name} ${diner.last_name}`;
      dinerId = diner.id;
    }
  }

  return {
    id: sessionUser.id,
    email: sessionUser.email,
    role: sessionUser.role,
    name,
    initials: iniciales(name),
    diner_id: dinerId
  };
};
