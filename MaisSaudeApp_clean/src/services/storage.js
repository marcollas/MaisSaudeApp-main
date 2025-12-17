import { storage } from '@/firebase/config';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import * as FileSystem from 'expo-file-system';

export async function uploadBlob(path, blob, onProgress) {
  const storageRef = ref(storage, path);
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, blob);
    uploadTask.on('state_changed', (snapshot) => {
      if (onProgress && snapshot.totalBytes) {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      }
    }, (err) => reject(err), async () => {
      try {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      } catch (e) {
        reject(e);
      }
    });
  });
}

export async function uploadUri(path, uri, onProgress) {
  // Handle local (file:// or content://) URIs using expo-file-system
  try {
    if (typeof uri === 'string' && (uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('/'))) {
      const b64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const mime = 'image/jpeg';
      const dataUrl = `data:${mime};base64,${b64}`;
      const blob = await (await fetch(dataUrl)).blob();
      return await uploadBlob(path, blob, onProgress);
    }
  } catch (e) {
    // continue to network fetch fallback below
    console.warn('local file read failed, falling back to fetch:', e);
  }

  // Network/http(s) URIs: simple retry logic
  const maxAttempts = 3;
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(uri);
      if (!response.ok && response.status !== 0) throw new Error('Fetch failed: ' + response.status);
      const blob = await response.blob();
      return await uploadBlob(path, blob, onProgress);
    } catch (e) {
      lastErr = e;
      await new Promise(r => setTimeout(r, 500 * attempt));
    }
  }
  throw lastErr;
}
