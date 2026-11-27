import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { serviceError } from './errors.js';

// Las imágenes subidas se guardan en public/assets/img/uploads/<carpeta>/ y se sirven como archivos estáticos
const UPLOADS_DIR = fileURLToPath(new URL('../../public/assets/img/uploads', import.meta.url));
const PUBLIC_PREFIX = '/assets/img/uploads/';
const FOLDERS = ['products', 'stores'];
const MAX_BYTES = 3 * 1024 * 1024;

// Los primeros bytes del archivo dicen qué es realmente (no basta con confiar en el tipo que declara el cliente)
const SIGNATURES = {
  png: (b) => b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  jpeg: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  webp: (b) => b.length > 12 && b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP'
};

const EXTENSIONS = { png: 'png', jpeg: 'jpg', webp: 'webp' };

/**
 * Guarda una imagen enviada como data URL (data:image/png;base64,...) y devuelve su URL pública.
 * Acepta PNG, JPG o WEBP de hasta 3 MB.
 */
export const saveImage = async (dataUrl, folder) => {
  if (!FOLDERS.includes(folder)) {
    throw new Error(`Carpeta de imágenes no permitida: ${folder}`);
  }

  const match = typeof dataUrl === 'string' ? /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl) : null;

  if (!match) {
    throw serviceError(400, 'INVALID_IMAGE', 'La imagen debe ser PNG, JPG o WEBP');
  }

  const [, type, base64] = match;
  const buffer = Buffer.from(base64, 'base64');

  if (buffer.length > MAX_BYTES) {
    throw serviceError(400, 'IMAGE_TOO_LARGE', 'La imagen debe pesar menos de 3 MB');
  }

  if (!SIGNATURES[type](buffer)) {
    throw serviceError(400, 'INVALID_IMAGE', 'El archivo no es una imagen válida');
  }

  const fileName = `${randomUUID()}.${EXTENSIONS[type]}`;
  const folderPath = path.join(UPLOADS_DIR, folder);

  await fs.mkdir(folderPath, { recursive: true });
  await fs.writeFile(path.join(folderPath, fileName), buffer);

  return `${PUBLIC_PREFIX}${folder}/${fileName}`;
};

/**
 * Borra una imagen subida. Solo toca archivos dentro de uploads; cualquier otra URL se ignora.
 */
export const removeImage = async (url) => {
  if (typeof url !== 'string' || !url.startsWith(PUBLIC_PREFIX)) return;

  const filePath = path.resolve(UPLOADS_DIR, url.slice(PUBLIC_PREFIX.length));

  if (!filePath.startsWith(UPLOADS_DIR + path.sep)) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
};
