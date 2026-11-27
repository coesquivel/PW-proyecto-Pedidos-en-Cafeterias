import userRepository from '../repositories/users_repository.js';

/**
 * Compara la contraseña ingresada con la guardada.
 * AHORA: comparación directa (texto plano), solo para desarrollo.
 * Cuando se cifre, este es el ÚNICO lugar que se cambia.
 */
const verifyPassword = (plainPassword, storedPassword) => {
  return plainPassword === storedPassword;
};

/**
 * Valida correo y contraseña contra la base de datos.
 * Devuelve { ok: true, user } o { ok: false, reason }.
 * reason: 'INVALID_CREDENTIALS' | 'ACCOUNT_BLOCKED' | 'ACCOUNT_PENDING' | 'ACCOUNT_REJECTED'
 */
export const authenticate = async (email, password) => {
  if (!email || !password) {
    return { ok: false, reason: 'INVALID_CREDENTIALS' };
  }

  const user = await userRepository.findByEmailWithPassword(email.trim().toLowerCase());

  if (!user || !verifyPassword(password, user.password)) {
    return { ok: false, reason: 'INVALID_CREDENTIALS' };
  }

  if (user.status === 'pendiente') {
    return { ok: false, reason: 'ACCOUNT_PENDING' };
  }

  if (user.status === 'rechazado') {
    return { ok: false, reason: 'ACCOUNT_REJECTED' };
  }

  if (user.status !== 'activo') {
    return { ok: false, reason: 'ACCOUNT_BLOCKED' };
  }

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role.name
    }
  };
};
