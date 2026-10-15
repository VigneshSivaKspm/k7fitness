/**
 * DEMO BUILD ONLY — stand-in for `firebase/storage` (see firestore.js).
 * Uploaded images are kept inline as data URLs inside the saved record.
 */
export const getStorage = () => ({ demo: true });
export const connectStorageEmulator = () => {};
export const ref = (_storage, path) => ({ fullPath: path, name: String(path).split('/').pop() });

function toDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

const urls = new Map();

export function uploadBytesResumable(fileRef, blob) {
  const total = blob.size || 1;
  const snapshot = { ref: fileRef, bytesTransferred: 0, totalBytes: total };
  const done = toDataUrl(blob).then((url) => {
    urls.set(fileRef.fullPath, url);
    snapshot.bytesTransferred = total;
  });
  return {
    snapshot,
    on(_event, onProgress, onError, onComplete) {
      done.then(() => {
        onProgress?.(snapshot);
        onComplete?.();
      }, onError);
    },
  };
}

export async function getDownloadURL(fileRef) {
  const url = urls.get(fileRef.fullPath);
  if (!url) {
    const err = new Error('File not found');
    err.code = 'storage/object-not-found';
    throw err;
  }
  return url;
}

export async function deleteObject(fileRef) {
  urls.delete(fileRef.fullPath);
}
