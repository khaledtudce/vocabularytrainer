"use client";

import { useEffect, useState, useRef } from "react";

type Mode = "Custom" | "Known" | "Unknown" | "Hard";

export default function useActiveWords() {
  const [mode, setMode] = useState<Mode>("Custom");
  const [range, setRange] = useState({ from: 1, to: 5000 });
  const [words, setWords] = useState<any[]>([]);
  const [allVocabulary, setAllVocabulary] = useState<any[]>([]);
  const previousDataRef = useRef<any>(null);

  // Load all vocabulary on component mount
  useEffect(() => {
    const loadVocabulary = async () => {
      try {
        const res = await fetch('/api/vocabulary');
        if (res.ok) {
          const vocab = await res.json();
          setAllVocabulary(vocab);
        }
      } catch (err) {
        console.error("[useActiveWords] Error fetching vocabulary:", err);
      }
    };
    loadVocabulary();
  }, []);

  // Refresh words when vocab is loaded (Custom mode trigger)
  useEffect(() => {
    if (allVocabulary.length > 0 && mode && range) {
      refreshWords(mode, range, true);
    }
  }, [allVocabulary.length, mode, range]);

  // helper: map id array to vocabulary entries (preserve order, ignore missing)
  const mapIdsToWords = (ids: number[]) => {
    const mapped = ids
      .map((id) => allVocabulary.find((w) => w?.id === id))
      .filter(Boolean) as any[];
    return mapped;
  };

  const refreshWords = async (m: Mode, r: { from: number; to: number }, skipCompare: boolean = false) => {
    if (m === "Custom") {
      // Custom mode: show vocabulary slice based on range
      if (allVocabulary.length === 0) {
        return;
      }
      const sliced = allVocabulary.filter(word => word.id >= r.from && word.id <= r.to);
      setWords(sliced);
      return;
    }

    // Known/Unknown/Hard: try to fetch user-specific lists (based on localStorage userId)
    try {
      if (typeof window === "undefined") {
        setWords([]);
        return;
      }
      
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setWords([]);
        return;
      }
      const res = await fetch(`/api/user/${userId}/wordlists`);
      if (!res.ok) {
        setWords([]);
        return;
      }
      const data = await res.json();
      
      // Only update if data has changed or skipCompare is true
      if (!skipCompare && previousDataRef.current) {
        const key = m.toLowerCase();
        const prevIds = previousDataRef.current[key] || [];
        const currIds = data?.[key] ?? [];
        // Compare arrays - if they're the same, don't update state
        if (JSON.stringify(prevIds) === JSON.stringify(currIds)) {
          return; // No change, skip update to avoid resetting index
        }
      }
      
      previousDataRef.current = data;
      const key = m.toLowerCase();
      const ids: number[] = data?.[key] ?? [];
      const mapped = mapIdsToWords(ids);
      // Filter by ID range instead of array slice (r.from and r.to are actual word IDs now)
      const sliced = mapped.filter(word => word.id >= r.from && word.id <= r.to);
      setWords(sliced);
    } catch (err) {
      console.error("Error fetching user wordlists:", err);
      setWords([]);
    }
  };

  useEffect(() => {
    // initial load from localStorage - only set mode and range, don't call refreshWords yet
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("wordSource");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const m: Mode = parsed.mode || "Custom";
        const r = parsed.ranges?.[m] || { from: 1, to: 5000 }; // Allow viewing all words up to 5000
        setMode(m);
        setRange(r);
      } catch {
        setMode("Custom");
        setRange({ from: 1, to: 5000 }); // Allow viewing all words
      }
    } else {
      setMode("Custom");
      setRange({ from: 1, to: 5000 }); // Allow viewing all words
    }

    const handler = (e: any) => {
      const detail = e?.detail || {};
      const m: Mode = detail.mode || "Custom";
      const r = detail.range || { from: 1, to: 5000 };
      setMode(m);
      setRange(r);
      if (allVocabulary.length > 0) {
        refreshWords(m, r, true);
      }
    };

    window.addEventListener("wordSourceUpdated", handler as EventListener);
    
    return () => {
      window.removeEventListener("wordSourceUpdated", handler as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { words, mode, range };
}
