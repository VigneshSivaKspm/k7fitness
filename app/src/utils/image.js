import { AppError } from './errors';

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_SOURCE_BYTES = 15 * 1024 * 1024; // before compression
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // enforced by storage.rules

export function validateImageFile(file) {
  if (!file) throw new AppError('Please choose an image.');
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) throw new AppError('Only JPG, PNG or WebP images are supported.');
  if (file.size > MAX_SOURCE_BYTES) throw new AppError('Image is too large. Please choose a file under 15 MB.');
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function loadBitmap(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      /* fall through to <img> */
    }
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new AppError('This image could not be read. Try a different file.'));
    };
    img.src = url;
  });
}

/**
 * Resizes to `maxSize` on the longest edge and re-encodes as WebP (JPEG
 * fallback). Typical phone photos go from 4–8 MB to 150–400 KB.
 */
export async function compressImage(file, { maxSize = 1920, quality = 0.82 } = {}) {
  validateImageFile(file);
  const bitmap = await loadBitmap(file);
  const width = bitmap.width;
  const height = bitmap.height;
  const scale = Math.min(1, maxSize / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();

  let blob = await canvasToBlob(canvas, 'image/webp', quality);
  if (!blob || blob.type !== 'image/webp') blob = await canvasToBlob(canvas, 'image/jpeg', quality);
  // Keep the original if re-encoding made it bigger (already-optimised files).
  if (!blob || (blob.size > file.size && scale === 1 && file.size <= MAX_UPLOAD_BYTES)) blob = file;
  if (blob.size > MAX_UPLOAD_BYTES) throw new AppError('Image is still too large after compression. Try a smaller image.');
  return blob;
}
