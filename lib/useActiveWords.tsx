"use client";

import { useEffect, useState, useRef } from "react";
import { getCachedWords, getCacheMetadata, cacheAllWords, isCacheValid } from "./wordCache";

type Mode = "Custom" | "Known" | "Unknown" | "Hard";

export default function useActiveWords() {
  const [mode, setMode] = useState<Mode>("Custom");
  const [range, setRange] = useState({ from: 1, to: 5000 });
  const [words, setWords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const cacheRef = useRef<{ [key: string]: any[] }>({});
  const previousDataRef = useRef<any>(null);

  // Load all words from API and cache them
  const loadAndCacheAllWords = async () => {
    try {
      console.log('[useActiveWords] Loading and caching all words...');
      const res = await fetch('/api/vocabulary?from=1&to=100000'); // Load all words
      if (!res.ok) {
        console.error('[useActiveWords] Failed to fetch all words');
        return false;
      }
      
      const allWords = await res.json();
      if (!Array.isArray(allWords)) {
        console.warn('[useActiveWords] API returned non-array');
        return false;
      }
      
      console.log('[useActiveWords] ✅ Fetched', allWords.length, 'words, caching...');
      await cacheAllWords(allWords);
      return true;
    } catch (err) {
      console.error('[useActiveWords] Error loading and caching all words:', err);
      return false;
    }
  };

  // Refresh words based on mode and range
  const refreshWords = async (m: Mode, r: { from: number; to: number }) => {
    const cacheKey = `${m}:${r.from}-${r.to}`;
    
    // Check cache first
    if (cacheRef.current[cacheKey]) {
      console.log('[useActiveWords] Using in-memory cached words for', cacheKey);
      setWords(cacheRef.current[cacheKey]);
      return;
    }

    if (m === "Custom") {
      // Custom mode: try to get from IndexedDB cache first
      try {
        console.log('[useActiveWords] Fetching Custom mode range:', r.from, '-', r.to);
        
        // Try cache first
        let vocab = await getCachedWords(r.from, r.to);
        
        // If cache miss or empty, fetch from API
        if (!vocab || vocab.length === 0) {
          console.log('[useActiveWords] Cache miss, fetching from API');
          const res = await fetch(`/api/vocabulary?from=${r.from}&to=${r.to}`);
          if (res.ok) {
            vocab = await res.json();
          } else {
            console.error('[useActiveWords] API error:', res.status);
            setWords([]);
            return;
          }
        } else {
          console.log('[useActiveWords] ✅ Using cached', vocab.length, 'words');
        }
        
        if (!Array.isArray(vocab)) {
          console.warn('[useActiveWords] Returned non-array');
          vocab = [];
        }
        
        cacheRef.current[cacheKey] = vocab;
        setWords(vocab);
      } catch (err) {
        console.error('[useActiveWords] Error fetching Custom mode:', err);
        setWords([]);
      }
      return;
    }

    // Known/Unknown/Hard: try to fetch user-specific lists
    try {
      if (typeof window === "undefined") {
        setWords([]);
        return;
      }
      
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.log('[useActiveWords] No userId for', m, 'mode');
        setWords([]);
        return;
      }
      
      console.log('[useActiveWords] Fetching', m, 'mode for user:', userId);
      const res = await fetch(`/api/user/${userId}/wordlists`);
      if (!res.ok) {
        console.error('[useActiveWords] Failed to fetch wordlists:', res.status);
        setWords([]);
        return;
      }
      
      const data = await res.json();
      
      // Only update if data has changed
      if (previousDataRef.current) {
        const key = m.toLowerCase();
        const prevIds = previousDataRef.current[key] || [];
        const currIds = data?.[key] ?? [];
        if (JSON.stringify(prevIds) === JSON.stringify(currIds)) {
          console.log('[useActiveWords] No changes in', m, 'mode');
          return;
        }
      }
      
      previousDataRef.current = data;
      const key = m.toLowerCase();
      const ids: number[] = data?.[key] ?? [];
      
      // Filter IDs by range
      const filteredIds = ids.filter(id => id >= r.from && id <= r.to);
      console.log('[useActiveWords] ✅ Loaded', filteredIds.length, m, 'words in range');
      
      const wordObjects = filteredIds.map(id => ({ id }));
      cacheRef.current[cacheKey] = wordObjects;
      setWords(wordObjects);
    } catch (err) {
      console.error('[useActiveWords] Error fetching', m, 'mode:', err);
      setWords([]);
    }
  };

  // Update words when mode or range changes
  useEffect(() => {
    refreshWords(mode, range);
  }, [mode, range]);

  // Load and cache all words on mount (if not already cached)
  useEffect(() => {
    const initializeCache = async () => {
      try {
        const isValid = await isCacheValid();
        if (!isValid) {
          console.log('[useActiveWords] Cache is invalid, loading all words...');
          await loadAndCacheAllWords();
        } else {
          const metadata = await getCacheMetadata();
          console.log('[useActiveWords] Using existing cache with', metadata?.count, 'words');
        }
      } catch (err) {
        console.error('[useActiveWords] Error initializing cache:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeCache();
  }, []);

  useEffect(() => {
    // Load initial mode and range from localStorage
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("wordSource");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const m: Mode = parsed.mode || "Custom";
        const r = parsed.ranges?.[m] || { from: 1, to: 5000 };
        setMode(m);
        setRange(r);
      } catch {
        setMode("Custom");
        setRange({ from: 1, to: 5000 });
      }
    } else {
      setMode("Custom");
      setRange({ from: 1, to: 5000 });
    }

    const handler = (e: any) => {
      const detail = e?.detail || {};
      const m: Mode = detail.mode || "Custom";
      const r = detail.range || { from: 1, to: 5000 };
      setMode(m);
      setRange(r);
    };

    window.addEventListener("wordSourceUpdated", handler as EventListener);
    
    return () => {
      window.removeEventListener("wordSourceUpdated", handler as EventListener);
    };
  }, []);

  // Listen for cache refresh events (e.g., when word is added)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const handleCacheRefresh = (e: any) => {
      console.log('[useActiveWords] Cache refreshed, reloading words');
      // Clear in-memory cache and reload current range
      cacheRef.current = {};
      refreshWords(mode, range);
    };

    window.addEventListener("cacheRefreshed", handleCacheRefresh);
    
    return () => {
      window.removeEventListener("cacheRefreshed", handleCacheRefresh);
    };
  }, [mode, range]);

  return { words, mode, range, isLoading, refreshCache: loadAndCacheAllWords };
}
