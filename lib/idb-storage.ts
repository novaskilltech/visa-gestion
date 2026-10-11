/**
 * IndexedDB Document Storage
 * Permet de stocker les gros fichiers PDF et images (plusieurs Mo)
 * sans JAMAIS dépasser le quota de 5MB du localStorage.
 */

const DB_NAME = 'visa_gestion_documents_db';
const DB_VERSION = 1;
const STORE_NAME = 'case_files';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB non supporté'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Cache mémoire instantané pour accès ultra-rapide et résilience aux bascules de page
const memoryFileCache = new Map<string, { fileDataUrl: string; fileName?: string }>();

export async function storeFileInIdb(id: string, fileDataUrl: string, fileName?: string): Promise<void> {
  if (id && fileDataUrl) {
    memoryFileCache.set(id, { fileDataUrl, fileName });
    if (fileName) {
      memoryFileCache.set(fileName.toLowerCase().trim(), { fileDataUrl, fileName });
    }
  }
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({ id, fileDataUrl, fileName, updated_at: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Erreur stockage IndexedDB:', err);
  }
}

export async function getFileFromIdb(id: string): Promise<string | null> {
  if (memoryFileCache.has(id)) {
    return memoryFileCache.get(id)!.fileDataUrl;
  }
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result && req.result.fileDataUrl) {
          memoryFileCache.set(id, { fileDataUrl: req.result.fileDataUrl, fileName: req.result.fileName });
          resolve(req.result.fileDataUrl);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Erreur lecture IndexedDB:', err);
    return null;
  }
}

export async function findFileInIdbByName(fileName: string): Promise<string | null> {
  const cleanTarget = (fileName || '').toLowerCase().trim();
  if (memoryFileCache.has(cleanTarget)) {
    return memoryFileCache.get(cleanTarget)!.fileDataUrl;
  }
  // Recherche mémoire approximative
  const entries = Array.from(memoryFileCache.entries());
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (entry) {
      const [key, val] = entry;
      if (key.includes(cleanTarget) || cleanTarget.includes(key) || (val.fileName && val.fileName.toLowerCase().includes(cleanTarget))) {
        return val.fileDataUrl;
      }
    }
  }

  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.openCursor();
      req.onsuccess = (event) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cursor = (event.target as any).result;
        if (cursor) {
          const item = cursor.value;
          if (item && item.fileDataUrl) {
            const currentName = (item.fileName || '').toLowerCase().trim();
            if (currentName === cleanTarget || currentName.includes(cleanTarget) || cleanTarget.includes(currentName)) {
              memoryFileCache.set(cleanTarget, { fileDataUrl: item.fileDataUrl, fileName: item.fileName });
              resolve(item.fileDataUrl);
              return;
            }
          }
          cursor.continue();
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function deleteFileFromIdb(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Erreur suppression IndexedDB:', err);
  }
}
