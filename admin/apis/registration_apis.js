import * as registrationService from '../services/registration_services.js';
import { ok, fail } from './responses.js';

/**
 * Registro de comensal: crea la cuenta e inicia sesión.
 */
export const registerDiner = async (req, res) => {
  try {
    const user = await registrationService.registerDiner(req.body);

    req.session.correo = user.email;
    req.session.role = user.role;
    req.session.user = user;

    return req.session.save(() =>
      ok(res, 'Cuenta creada correctamente', { redirect: '/comensales' }, 201)
    );
  } catch (error) {
    return fail(res, error, 'Error al crear la cuenta');
  }
};

/**
 * Solicitud de registro de un local (queda pendiente de aprobación).
 */
export const registerStore = async (req, res) => {
  try {
    const result = await registrationService.registerStore(req.body);

    return ok(res, 'Solicitud enviada correctamente', result, 201);
  } catch (error) {
    return fail(res, error, 'Error al enviar la solicitud');
  }
};
