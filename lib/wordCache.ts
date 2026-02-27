// IndexedDB-based caching for vocabulary words
const DB_NAME = 'VocabularyTrainer';
const STORE_NAME = 'words';
const VERSION = 1;

let db: IDBDatabase | null = null;

async function initDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('id', 'id', { unique: true });
      }
    };
  });
}

export async function cacheAllWords(words: any[]): Promise<void> {
  console.log('[wordCache] Caching', words.length, 'words to IndexedDB');
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Clear existing cache
    store.clear();

    // Add all words
    for (const word of words) {
      store.add(word);
    }

    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => {
      console.log('[wordCache] ✅ Cached all words successfully');
      // Store metadata about cache
      localStorage.setItem('wordCache.timestamp', Date.now().toString());
      localStorage.setItem('wordCache.count', words.length.toString());
      // Emit event to notify listeners that cache was updated
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cacheRefreshed', { detail: { count: words.length } }));
      }
      resolve();
    };
  });
}

export async function getCachedWords(from: number, to: number): Promise<any[] | null> {
  try {
    const database = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('id');
      const range = IDBKeyRange.bound(from, to);
      const request = index.getAll(range);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const results = request.result;
        if (results && results.length > 0) {
          console.log('[wordCache] ✅ Found', results.length, 'cached words for range', from, '-', to);
          resolve(results);
        } else {
          console.log('[wordCache] No cached words for range', from, '-', to);
          resolve(null);
        }
      };
    });
  } catch (err) {
    console.error('[wordCache] Error getting cached words:', err);
    return null;
  }
}

export async function getCacheMetadata(): Promise<{ count: number; timestamp: number } | null> {
  const count = localStorage.getItem('wordCache.count');
  const timestamp = localStorage.getItem('wordCache.timestamp');
  
  if (count && timestamp) {
    return {
      count: parseInt(count),
      timestamp: parseInt(timestamp),
    };
  }
  return null;
}

export async function clearCache(): Promise<void> {
  console.log('[wordCache] Clearing cache');
  try {
    const database = await initDB();
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      store.clear();
      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => {
        localStorage.removeItem('wordCache.timestamp');
        localStorage.removeItem('wordCache.count');
        console.log('[wordCache] ✅ Cache cleared');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cacheRefreshed', { detail: { count: 0 } }));
        }
        resolve();
      };
    });
  } catch (err) {
    console.error('[wordCache] Error clearing cache:', err);
  }
}

export async function isCacheValid(): Promise<boolean> {
  const metadata = await getCacheMetadata();
  if (!metadata || metadata.count === 0) {
    console.log('[wordCache] Cache is invalid or empty');
    return false;
  }
  console.log('[wordCache] Cache is valid, contains', metadata.count, 'words');
  return true;
}
