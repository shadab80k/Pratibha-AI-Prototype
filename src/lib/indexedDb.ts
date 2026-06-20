const DB_NAME = 'PratibhaOfflineDB';
const DB_VERSION = 1;

export interface OfflineMedia {
  id: string; // e.g. 'media-obs-id'
  blob: Blob;
  mimeType: string;
}

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('media')) {
        db.createObjectStore('media', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('observations')) {
        db.createObjectStore('observations', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };

    request.onerror = (event: any) => {
      reject(event.target.error);
    };
  });
}

export async function saveMedia(id: string, blob: Blob, mimeType: string): Promise<void> {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction('media', 'readwrite');
    const store = transaction.objectStore('media');
    const request = store.put({ id, blob, mimeType });

    request.onsuccess = () => resolve();
    request.onerror = (event: any) => reject(event.target.error);
  });
}

export async function getMedia(id: string): Promise<OfflineMedia | null> {
  const db = await initDB();
  return new Promise<OfflineMedia | null>((resolve, reject) => {
    const transaction = db.transaction('media', 'readonly');
    const store = transaction.objectStore('media');
    const request = store.get(id);

    request.onsuccess = (event: any) => resolve(event.target.result || null);
    request.onerror = (event: any) => reject(event.target.error);
  });
}
