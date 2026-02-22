"use client";

import { useEffect, useState, useRef } from "react";
import { WordList } from "@/data/wordlists";

type Mode = "Custom" | "Known" | "Unknown" | "Hard";

export default function useActiveWords() {
  const [mode, setMode] = useState<Mode>("Custom");
  const [range, setRange] = useState({ from: 1, to: 30 });
  const [words, setWords] = useState<any[]>(WordList.slice(0, 30));
  const previousDataRef = useRef<any>(null);

  // helper: map id array to WordList entries (preserve order, ignore missing)
  const mapIdsToWords = (ids: number[]) => {
    const idSet = new Set(ids);
    const mapped = ids.map((id) => WordList.find((w) => w?.id === id)).filter(Boolean) as any[];
    return mapped;
  };

  const refreshWords = async (m: Mode, r: { from: number; to: number }, skipCompare: boolean = false) => {
    if (m === "Custom") {
      // Custom mode: show WordList slice based on range
      setWords(WordList.slice(r.from - 1, r.to));
      return;
    }

    // Known/Unknown/Hard: try to fetch user-specific lists (based on localStorage userId)
    try {
      const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
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
    // initial load from localStorage
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("wordSource");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const m: Mode = parsed.mode || "Custom";
        const r = parsed.ranges?.[m] || { from: 1, to: 30 };
        setMode(m);
        setRange(r);
        refreshWords(m, r, true); // skipCompare = true on initial load
      } catch {
        setMode("Custom");
        setRange({ from: 1, to: 30 });
        refreshWords("Custom", { from: 1, to: 30 }, true);
      }
    } else {
      refreshWords("Custom", { from: 1, to: 30 }, true);
    }

    const handler = (e: any) => {
      const detail = e?.detail || {};
      const m: Mode = detail.mode || "Custom";
      const r = detail.range || { from: 1, to: 30 };
      setMode(m);
      setRange(r);
      refreshWords(m, r, true); // skipCompare = true on explicit event
    };

    window.addEventListener("wordSourceUpdated", handler as EventListener);
    
    return () => {
      window.removeEventListener("wordSourceUpdated", handler as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { words, mode, range };
}
