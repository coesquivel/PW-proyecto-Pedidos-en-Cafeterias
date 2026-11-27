import registrationRepository from '../repositories/registration_repository.js';
import roleRepository from '../repositories/roles_repository.js';
import { saveImage, removeImage } from './images_services.js';
import { serviceError } from './errors.js';

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const text = (value) => (typeof value === 'string' ? value.trim() : '');

const parseEmail = (value) => {
  const email = text(value).toLowerCase();

  if (!EMAIL_FORMAT.test(email) || email.length > 60) {
    throw serviceError(400, 'INVALID_EMAIL', 'Escribe un correo válido (máximo 60 caracteres)');
  }

  return email;
};

// Mismas reglas que muestra el formulario: 8 caracteres, una mayúscula y un número
const parsePassword = (value, confirmation) => {
  if (typeof value !== 'string' || value.length < 8 || value.length > 100
    || !/[A-Z]/.test(value) || !/\d/.test(value)) {
    throw serviceError(400, 'INVALID_PASSWORD', 'La contraseña debe tener mínimo 8 caracteres, con una mayúscula y un número');
  }

  if (value !== confirmation) {
    throw serviceError(400, 'PASSWORD_MISMATCH', 'Las contraseñas no coinciden');
  }

  return value;
};

// Acepta "987 654 321", "+51 987 654 321", "987-654-321"; se guarda sin espacios ni guiones
export const parsePhone = (value, required) => {
  const raw = text(value);

  if (!raw) {
    if (required) throw serviceError(400, 'INVALID_PHONE', 'El teléfono es obligatorio');
    return null;
  }

  const phone = raw.replace(/[\s\-()]/g, '');

  if (!/^\+?\d{7,14}$/.test(phone)) {
    throw serviceError(400, 'INVALID_PHONE', 'Escribe un teléfono válido');
  }

  return phone;
};

const parseName = (value, label) => {
  const name = text(value);

  if (!name || name.length > 50) {
    throw serviceError(400, 'INVALID_NAME', `${label} es obligatorio (máximo 50 caracteres)`);
  }

  return name;
};

const ensureEmailFree = async (email) => {
  if (await registrationRepository.findUserByEmail(email)) {
    throw serviceError(409, 'EMAIL_TAKEN', 'Ese correo ya está registrado');
  }
};

// Si dos registros llegan a la vez, la base rechaza el duplicado: se responde igual que arriba
const translateUniqueError = (error) => {
  if (error.name !== 'SequelizeUniqueConstraintError') return error;

  const field = error.errors?.[0]?.path;

  return field === 'ruc'
    ? serviceError(409, 'RUC_TAKEN', 'Ya existe una solicitud con ese RUC')
    : serviceError(409, 'EMAIL_TAKEN', 'Ese correo ya está registrado');
};

/**
 * Registro de un comensal. Devuelve el usuario para iniciar sesión de inmediato.
 */
export const registerDiner = async (data = {}) => {
  const firstName = parseName(data.first_name, 'Los nombres son');
  const lastName = parseName(data.last_name, 'Los apellidos son');
  const email = parseEmail(data.email);
  const password = parsePassword(data.password, data.confirm_password);
  const phone = parsePhone(data.phone, false);

  if (data.accepted_terms !== true) {
    throw serviceError(400, 'TERMS_REQUIRED', 'Debes aceptar los términos del servicio');
  }

  await ensureEmailFree(email);

  const role = await roleRepository.findByName('comensal');

  try {
    const id = await registrationRepository.createDiner({
      user: { email, phone, password, status: 'activo', role_id: role.id },
      diner: { first_name: firstName, last_name: lastName }
    });

    return { id, email, role: 'comensal' };
  } catch (error) {
    await removeImage(logoUrl);
    throw translateUniqueError(error);
  }
};

/**
 * Solicitud de registro de un local. Queda pendiente: no puede iniciar sesión
 * ni aparecer a los comensales hasta que el owner la apruebe.
 */
export const registerStore = async (data = {}) => {
  const commercialName = text(data.commercial_name);
  const location = text(data.campus_location);
  const campus = text(data.campus);
  const ruc = text(data.ruc);

  if (!commercialName || commercialName.length > 60) {
    throw serviceError(400, 'INVALID_NAME', 'El nombre comercial es obligatorio (máximo 60 caracteres)');
  }

  if (!/^\d{11}$/.test(ruc)) {
    throw serviceError(400, 'INVALID_RUC', 'El RUC debe tener 11 dígitos');
  }

  if (!campus || campus.length > 30) {
    throw serviceError(400, 'INVALID_CAMPUS', 'Elige la sede')
  }

  if (!location || location.length > 100) {
    throw serviceError(400, 'INVALID_LOCATION', 'La ubicación en el campus es obligatoria (máximo 100 caracteres)');
  }

  const email = parseEmail(data.email);
  const phone = parsePhone(data.phone, true);
  const password = parsePassword(data.password, data.confirm_password);

  if (data.authorization !== true) {
    throw serviceError(400, 'AUTHORIZATION_REQUIRED', 'Debes declarar que cuentas con la autorización de la Universidad');
  }

  await ensureEmailFree(email);

  if (await registrationRepository.findStoreByRuc(ruc)) {
    throw serviceError(409, 'RUC_TAKEN', 'Ya existe una solicitud con ese RUC');
  }

  const role = await roleRepository.findByName('enterprises');

  // Logo opcional (data URL). Se guarda solo cuando el resto de datos ya es válido
  const logoUrl = data.logo ? await saveImage(data.logo, 'stores') : null;

  try {
    await registrationRepository.createStore({
      user: { email, phone, password, status: 'pendiente', role_id: role.id },
      store: {
        commercial_name: commercialName,
        campus_location: location,
        campus,
        ruc,
        logo_url: logoUrl,
        operative_status: 'pendiente'
      }
    });

    return { email, status: 'pendiente' };
  } catch (error) {
    throw translateUniqueError(error);
  }
};
