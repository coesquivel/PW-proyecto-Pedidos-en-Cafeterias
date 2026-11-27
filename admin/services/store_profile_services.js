import storeProfileRepository from '../repositories/store_profile_repository.js';
import { saveImage, removeImage } from './images_services.js';
import { parsePhone } from './registration_services.js';
import { serviceError } from './errors.js';

const MAX_PHOTOS = 6;

const toView = (store) => ({
  id: store.id,
  commercial_name: store.commercial_name,
  campus_location: store.campus_location,
  campus: store.campus,
  ruc: store.ruc,
  description: store.description,
  logo_url: store.logo_url,
  email: store.user.email,
  phone: store.user.phone,
  photos: store.photos.map((photo) => ({ id: photo.id, url: photo.url }))
});

/**
 * Perfil del local en sesión: datos, contacto, logo y galería
 */
export const fetchProfile = async (storeId) => {
  return toView(await storeProfileRepository.findProfile(storeId));
};

/**
 * Edita nombre comercial, ubicación, descripción y teléfono.
 * El correo no se cambia aquí porque es el usuario con el que se inicia sesión.
 */
export const updateProfile = async (store, data = {}) => {
  const commercialName = typeof data.commercial_name === 'string' ? data.commercial_name.trim() : '';
  const location = typeof data.campus_location === 'string' ? data.campus_location.trim() : '';

  if (!commercialName || commercialName.length > 60) {
    throw serviceError(400, 'INVALID_NAME', 'El nombre comercial es obligatorio (máximo 60 caracteres)');
  }

  if (!location || location.length > 100) {
    throw serviceError(400, 'INVALID_LOCATION', 'La ubicación en el campus es obligatoria (máximo 100 caracteres)');
  }

  let description = null;
  if (data.description !== undefined && data.description !== null) {
    description = String(data.description).trim();
    if (description.length > 240) {
      throw serviceError(400, 'INVALID_DESCRIPTION', 'La descripción admite máximo 240 caracteres');
    }
    description = description === '' ? null : description;
  }

  const phone = parsePhone(data.phone, true);

  await storeProfileRepository.updateProfile(
    store,
    { commercial_name: commercialName, campus_location: location, description },
    phone
  );

  return await fetchProfile(store.id);
};

export const addPhoto = async (store, image) => {
  if ((await storeProfileRepository.countPhotos(store.id)) >= MAX_PHOTOS) {
    throw serviceError(409, 'TOO_MANY_PHOTOS', `La galería admite máximo ${MAX_PHOTOS} fotografías`);
  }

  const url = await saveImage(image, 'stores');

  try {
    const photo = await storeProfileRepository.createPhoto({ url, store_id: store.id });
    return { id: photo.id, url: photo.url };
  } catch (error) {
    await removeImage(url);
    throw error;
  }
};

export const removePhoto = async (store, photoId) => {
  const photo = await storeProfileRepository.findPhoto(photoId, store.id);

  if (!photo) {
    throw serviceError(404, 'PHOTO_NOT_FOUND', 'Fotografía no encontrada');
  }

  await storeProfileRepository.deletePhoto(photo);
  await removeImage(photo.url);

  return true;
};
