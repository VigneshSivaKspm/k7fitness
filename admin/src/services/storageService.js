import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../firebase/config';
import { compressImage } from '../utils/image';
import { uid } from '../utils/format';

/**
 * Compresses then uploads an image.
 * @param {File} file
 * @param {string} folder e.g. "public/gallery" or "private/trainees"
 * @returns {Promise<{ url: string, path: string }>}
 */
export async function uploadImage(file, folder, { onProgress, maxSize = 1920 } = {}) {
  const blob = await compressImage(file, { maxSize });
  const ext = blob.type === 'image/webp' ? 'webp' : blob.type === 'image/png' ? 'png' : 'jpg';
  const path = `${folder}/${Date.now()}-${uid()}.${ext}`;
  const task = uploadBytesResumable(ref(storage, path), blob, {
    contentType: blob.type,
    cacheControl: 'public, max-age=31536000, immutable',
  });
  await new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (s) => onProgress?.(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
      reject,
      resolve,
    );
  });
  const url = await getDownloadURL(task.snapshot.ref);
  return { url, path };
}

/** Deletes a stored file; silently ignores files that are already gone. */
export async function deleteFile(path) {
  if (!path) return;
  try {
    await deleteObject(ref(storage, path));
  } catch (err) {
    if (err?.code !== 'storage/object-not-found') throw err;
  }
}
