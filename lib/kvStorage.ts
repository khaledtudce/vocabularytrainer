import { createClient } from 'redis';
import { WordList } from '@/data/wordlists';

const VOCABULARY_KEY = 'vocabulary:master';
const USER_WORDLIST_PREFIX = 'user:wordlist:';

export interface UserWordlists {
  known: number[];
  hard: number[];
  unknown: number[];
}

let redisClient: any = null;
let connectionPromise: Promise<any> | null = null;

// Initialize Redis client (connection pooling)
async function getRedisClient(): Promise<any> {
  // If connection is in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }
  
  // If we have a working client, use it
  if (redisClient && redisClient.isOpen) {
    console.log('[Redis] Reusing existing connection');
    return redisClient;
  }

  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error('Missing REDIS_URL in environment variables');
  }

  try {
    console.log('[Redis] Creating new connection...');
    
    // Create connection promise to prevent race conditions
    connectionPromise = (async () => {
      const client = createClient({ 
        url,
        socket: {
          reconnectStrategy: (retries: number) => Math.min(retries * 50, 500),
          connectTimeout: 10000,
        },
      } as any);
      
      client.on('error', (err: any) => {
        console.error('[Redis] Client error:', err);
        redisClient = null;
      });
      
      client.on('connect', () => {
        console.log('[Redis] Connected');
      });
      
      await client.connect();
      console.log('[Redis] ✅ Connected successfully');
      redisClient = client;
      connectionPromise = null;
      return client;
    })();
    
    return await connectionPromise;
  } catch (error) {
    console.error('[Redis] Connection error:', error);
    connectionPromise = null;
    redisClient = null;
    throw error;
  }
}

/**
 * Initialize/seed vocabulary in Redis if it doesn't exist
 */
export async function initializeVocabulary() {
  try {
    const client = await getRedisClient();
    const existing = await client.get(VOCABULARY_KEY);
    
    if (existing) {
      console.log('[Redis] Vocabulary already seeded');
      return;
    }

    console.log('[Redis] Seeding vocabulary from wordlists.js...');
    await client.set(VOCABULARY_KEY, JSON.stringify(WordList));
    console.log(`[Redis] ✅ Vocabulary seeded with ${WordList.length} words`);
  } catch (error) {
    console.error('[Redis] Error initializing vocabulary:', error);
    throw error;
  }
}

/**
 * Get all vocabulary words
 */
export async function getVocabulary() {
  try {
    await initializeVocabulary();
    const client = await getRedisClient();
    const data = await client.get(VOCABULARY_KEY);
    
    if (!data) {
      console.warn('[Redis] No vocabulary found after init');
      return WordList;
    }
    
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    console.error('[Redis] Error getting vocabulary:', error);
    // Fallback to local wordlist.js
    return WordList;
  }
}

/**
 * Add a new word to vocabulary
 */
export async function addWordToVocabulary(wordData: any) {
  try {
    console.log('[Redis] Adding word:', wordData);
    const vocabulary = await getVocabulary();
    
    // Find max ID and add 1
    const maxId = Math.max(...vocabulary.map((w: any) => w.id || 0));
    const newWord = { ...wordData, id: maxId + 1 };
    
    vocabulary.push(newWord);
    const client = await getRedisClient();
    await client.set(VOCABULARY_KEY, JSON.stringify(vocabulary));
    console.log('[Redis] ✅ Word added with ID:', newWord.id);
    
    return newWord;
  } catch (error) {
    console.error('[Redis] Error adding word:', error);
    throw error;
  }
}

/**
 * Get user's wordlists (known, hard, unknown)
 */
export async function getUserWordlists(userId: string): Promise<UserWordlists> {
  try {
    const client = await getRedisClient();
    const key = `${USER_WORDLIST_PREFIX}${userId}`;
    const data = await client.get(key);
    
    if (!data) {
      console.log('[Redis] No wordlists found for user, returning empty');
      return { known: [], hard: [], unknown: [] };
    }
    
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    return {
      known: parsed.known || [],
      hard: parsed.hard || [],
      unknown: parsed.unknown || [],
    };
  } catch (error) {
    console.error('[Redis] Error getting user wordlists:', error);
    return { known: [], hard: [], unknown: [] };
  }
}

/**
 * Update user's wordlists
 */
export async function updateUserWordlists(
  userId: string,
  wordlists: UserWordlists
): Promise<UserWordlists> {
  try {
    console.log(`[Redis] Updating wordlists for userId: ${userId}`);
    console.log(
      `[Redis] Received data - known: ${wordlists.known?.length || 0}, hard: ${
        wordlists.hard?.length || 0
      }, unknown: ${wordlists.unknown?.length || 0}`
    );
    
    const client = await getRedisClient();
    const key = `${USER_WORDLIST_PREFIX}${userId}`;
    const sanitized = {
      known: Array.isArray(wordlists.known) ? wordlists.known : [],
      hard: Array.isArray(wordlists.hard) ? wordlists.hard : [],
      unknown: Array.isArray(wordlists.unknown) ? wordlists.unknown : [],
    };
    
    await client.set(key, JSON.stringify(sanitized));
    console.log('[Redis] ✅ Wordlists saved successfully');
    
    return sanitized;
  } catch (error) {
    console.error('[Redis] Error updating user wordlists:', error);
    throw error;
  }
}

/**
 * Initialize user's wordlists with all vocabulary as unknown
 */
export async function initializeUserWordlists(userId: string): Promise<UserWordlists> {
  try {
    console.log(`[Redis] Initializing wordlists for new user: ${userId}`);
    const vocabulary = await getVocabulary();
    const allWordIds = vocabulary.map((w: any) => w.id).sort((a: number, b: number) => a - b);
    
    const wordlists: UserWordlists = {
      known: [],
      hard: [],
      unknown: allWordIds,
    };
    
    return updateUserWordlists(userId, wordlists);
  } catch (error) {
    console.error('[Redis] Error initializing user wordlists:', error);
    throw error;
  }
}

/**
 * Store user registration data
 */
export async function storeUser(userData: any) {
  try {
    const client = await getRedisClient();
    const key = `user:account:${userData.id}`;
    await client.set(key, JSON.stringify(userData));
    console.log(`[Redis] ✅ User stored: ${userData.id}`);
    return userData;
  } catch (error) {
    console.error('[Redis] Error storing user:', error);
    throw error;
  }
}

/**
 * Get user by ID
 */
export async function getUser(userId: string) {
  try {
    const client = await getRedisClient();
    const key = `user:account:${userId}`;
    const data = await client.get(key);
    return data ? (typeof data === 'string' ? JSON.parse(data) : data) : null;
  } catch (error) {
    console.error('[Redis] Error getting user:', error);
    return null;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  try {
    const client = await getRedisClient();
    const key = `user:email:${email}`;
    const userId = await client.get(key);
    if (!userId) return null;
    return getUser(userId);
  } catch (error) {
    console.error('[Redis] Error getting user by email:', error);
    return null;
  }
}

/**
 * Register email to userId mapping
 */
export async function registerEmailMapping(email: string, userId: string) {
  try {
    const client = await getRedisClient();
    const key = `user:email:${email}`;
    await client.set(key, userId);
  } catch (error) {
    console.error('[Redis] Error registering email mapping:', error);
    throw error;
  }
}
