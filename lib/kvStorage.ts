import { kv } from '@vercel/kv';
import { WordList } from '@/data/wordlists';

const VOCABULARY_KEY = 'vocabulary:master';
const USER_WORDLIST_PREFIX = 'user:wordlist:';

export interface UserWordlists {
  known: number[];
  hard: number[];
  unknown: number[];
}

/**
 * Initialize/seed vocabulary in KV if it doesn't exist
 */
export async function initializeVocabulary() {
  try {
    const existing = await kv.get(VOCABULARY_KEY);
    if (existing) {
      console.log('[KV] Vocabulary already seeded');
      return;
    }

    console.log('[KV] Seeding vocabulary from wordlists.js...');
    await kv.set(VOCABULARY_KEY, JSON.stringify(WordList));
    console.log(`[KV] ✅ Vocabulary seeded with ${WordList.length} words`);
  } catch (error) {
    console.error('[KV] Error initializing vocabulary:', error);
    throw error;
  }
}

/**
 * Get all vocabulary words
 */
export async function getVocabulary() {
  try {
    await initializeVocabulary();
    const data = await kv.get(VOCABULARY_KEY);
    if (!data) {
      console.warn('[KV] No vocabulary found after init');
      return WordList;
    }
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    console.error('[KV] Error getting vocabulary:', error);
    // Fallback to local wordlist.js
    return WordList;
  }
}

/**
 * Add a new word to vocabulary
 */
export async function addWordToVocabulary(wordData: any) {
  try {
    console.log('[KV] Adding word:', wordData);
    const vocabulary = await getVocabulary();
    
    // Find max ID and add 1
    const maxId = Math.max(...vocabulary.map((w: any) => w.id || 0));
    const newWord = { ...wordData, id: maxId + 1 };
    
    vocabulary.push(newWord);
    await kv.set(VOCABULARY_KEY, JSON.stringify(vocabulary));
    console.log('[KV] ✅ Word added with ID:', newWord.id);
    
    return newWord;
  } catch (error) {
    console.error('[KV] Error adding word:', error);
    throw error;
  }
}

/**
 * Get user's wordlists (known, hard, unknown)
 */
export async function getUserWordlists(userId: string): Promise<UserWordlists> {
  try {
    const key = `${USER_WORDLIST_PREFIX}${userId}`;
    const data = await kv.get(key);
    
    if (!data) {
      console.log('[KV] No wordlists found for user, returning empty');
      return { known: [], hard: [], unknown: [] };
    }
    
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    return {
      known: parsed.known || [],
      hard: parsed.hard || [],
      unknown: parsed.unknown || [],
    };
  } catch (error) {
    console.error('[KV] Error getting user wordlists:', error);
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
    console.log(`[KV] Updating wordlists for userId: ${userId}`);
    console.log(
      `[KV] Received data - known: ${wordlists.known?.length || 0}, hard: ${
        wordlists.hard?.length || 0
      }, unknown: ${wordlists.unknown?.length || 0}`
    );
    
    const key = `${USER_WORDLIST_PREFIX}${userId}`;
    const sanitized = {
      known: Array.isArray(wordlists.known) ? wordlists.known : [],
      hard: Array.isArray(wordlists.hard) ? wordlists.hard : [],
      unknown: Array.isArray(wordlists.unknown) ? wordlists.unknown : [],
    };
    
    await kv.set(key, JSON.stringify(sanitized));
    console.log('[KV] ✅ Wordlists saved successfully');
    
    return sanitized;
  } catch (error) {
    console.error('[KV] Error updating user wordlists:', error);
    throw error;
  }
}

/**
 * Initialize user's wordlists with all vocabulary as unknown
 */
export async function initializeUserWordlists(userId: string): Promise<UserWordlists> {
  try {
    console.log(`[KV] Initializing wordlists for new user: ${userId}`);
    const vocabulary = await getVocabulary();
    const allWordIds = vocabulary.map((w: any) => w.id).sort((a: number, b: number) => a - b);
    
    const wordlists: UserWordlists = {
      known: [],
      hard: [],
      unknown: allWordIds,
    };
    
    return updateUserWordlists(userId, wordlists);
  } catch (error) {
    console.error('[KV] Error initializing user wordlists:', error);
    throw error;
  }
}

/**
 * Store user registration data
 */
export async function storeUser(userData: any) {
  try {
    const key = `user:account:${userData.id}`;
    await kv.set(key, JSON.stringify(userData));
    console.log(`[KV] ✅ User stored: ${userData.id}`);
    return userData;
  } catch (error) {
    console.error('[KV] Error storing user:', error);
    throw error;
  }
}

/**
 * Get user by ID
 */
export async function getUser(userId: string) {
  try {
    const key = `user:account:${userId}`;
    const data = await kv.get(key);
    return data ? (typeof data === 'string' ? JSON.parse(data) : data) : null;
  } catch (error) {
    console.error('[KV] Error getting user:', error);
    return null;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  try {
    const key = `user:email:${email}`;
    const userId = await kv.get(key);
    if (!userId) return null;
    return getUser(userId as string);
  } catch (error) {
    console.error('[KV] Error getting user by email:', error);
    return null;
  }
}

/**
 * Register email to userId mapping
 */
export async function registerEmailMapping(email: string, userId: string) {
  try {
    const key = `user:email:${email}`;
    await kv.set(key, userId);
  } catch (error) {
    console.error('[KV] Error registering email mapping:', error);
    throw error;
  }
}
