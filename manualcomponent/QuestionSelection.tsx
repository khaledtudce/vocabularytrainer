"use client";

import { useEffect, useState } from "react";
import { WordList } from "@/data/wordlists";

export default function DifficultySelector() {
  const defaultRanges = { from: 1, to: 30 };
  const [mode, setMode] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("wordSource");
      if (stored) {
        try {
          return JSON.parse(stored).mode || "Custom";
        } catch {
          return "Custom";
        }
      }
    }
    return "Custom";
  });

  const [ranges, setRanges] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("wordSource");
      if (stored) {
        try {
          return JSON.parse(stored).ranges || {
            Custom: defaultRanges,
            Known: defaultRanges,
            Unknown: defaultRanges,
            Hard: defaultRanges,
          };
        } catch {
          /* fallthrough */
        }
      }
      const legacy = localStorage.getItem("wordRange");
      if (legacy) return { Custom: JSON.parse(legacy), Known: defaultRanges, Unknown: defaultRanges, Hard: defaultRanges };
    }
    return { Custom: defaultRanges, Known: defaultRanges, Unknown: defaultRanges, Hard: defaultRanges };
  });

  // Persist and broadcast whenever mode or ranges change
  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload = { mode, ranges };
    localStorage.setItem("wordSource", JSON.stringify(payload));
    const currentRange = ranges[mode] || defaultRanges;
    window.dispatchEvent(new CustomEvent("wordSourceUpdated", { detail: { mode, range: currentRange } }));
  }, [mode, ranges]);

  // Track per-user counts for Known/Unknown/Hard so selects reflect actual sizes
  // Also track the actual IDs in each array for range selection
  const [userCounts, setUserCounts] = useState({ Known: 0, Unknown: 0, Hard: 0 });
  const [userIds, setUserIds] = useState({ Known: [] as number[], Unknown: [] as number[], Hard: [] as number[] });

  const fetchWordlists = (userId: string) => {
    fetch(`/api/user/${userId}/wordlists`)
      .then((r) => r.json())
      .then((data) => {
        const knownIds = (data?.known || []) as number[];
        const unknownIds = (data?.unknown || []) as number[];
        const hardIds = (data?.hard || []) as number[];

        setUserCounts({ 
          Known: knownIds.length, 
          Unknown: unknownIds.length, 
          Hard: hardIds.length 
        });

        // Store the actual IDs for range selection
        setUserIds({ Known: knownIds, Unknown: unknownIds, Hard: hardIds });

        // Set ranges based on actual IDs in arrays
        setRanges((prev: any) => {
          const next = { ...prev };
          const arrays = { Known: knownIds, Unknown: unknownIds, Hard: hardIds };

          for (const key of ["Known", "Unknown", "Hard"]) {
            const ids = (arrays as any)[key];
            if (ids && ids.length > 0) {
              const minId = Math.min(...ids);
              // If more than 30 items, use the 30th item's ID as max; otherwise use actual max
              const maxId = ids.length > 30 ? ids[29] : Math.max(...ids);
              next[key] = { from: minId, to: maxId };
            } else {
              next[key] = { from: 0, to: 0 };
            }
          }
          return next;
        });
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    
    // Fetch only on mount
    fetchWordlists(userId);
  }, []);

  return (
    <div className="flex items-center gap-2 p-2">
      {/* Difficulty Selection */}
      <div className="relative">
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg bg-transparent text-white appearance-none focus:ring-2 focus:ring-green-300 hover:bg-green-700"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option
            className="bg-green-500 text-white hover:bg-green-700"
            value="Known"
          >
            Known
          </option>
          <option
            className="bg-green-500 text-white hover:bg-green-700"
            value="Unknown"
          >
            Unknown
          </option>
          <option
            className="bg-green-500 text-white hover:bg-green-700"
            value="Hard"
          >
            Hard
          </option>
          <option
            className="bg-green-500 text-white hover:bg-green-700"
            value="Custom"
          >
            Custom
          </option>
        </select>
      </div>

      {/* Range Selection for active mode */}
      {mode && (
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="text-white text-sm">from:</span>
            <div className="relative">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg bg-transparent text-white text-center appearance-none focus:ring-2 focus:ring-green-300 hover:bg-green-700"
                value={ranges[mode].from}
                onChange={(e) => {
                  const newFrom = Number(e.target.value);
                  setRanges((prev: any) => ({ ...prev, [mode]: { ...prev[mode], from: newFrom } }));
                }}
              >
                {(() => {
                  if (mode === "Custom") {
                    return Array.from({ length: WordList.length }, (_, i) => i + 1).map((num) => num <= ranges[mode].to && (
                      <option className="bg-green-500 text-white hover:bg-green-700" key={num} value={num}>{num}</option>
                    ));
                  } else {
                    const ids = (userIds as any)[mode] || [];
                    if (ids.length === 0) return <option value={0}>0</option>;
                    return ids.map((id: number) => id <= ranges[mode].to && (
                      <option className="bg-green-500 text-white hover:bg-green-700" key={id} value={id}>{id}</option>
                    ));
                  }
                })()}
              </select>
            </div>
          </span>

          <span className="flex items-center gap-1">
            <span className="text-white text-sm">to:</span>
            <div className="relative">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg bg-transparent text-white text-center appearance-none focus:ring-2 focus:ring-green-300 hover:bg-green-700"
                value={ranges[mode].to}
                onChange={(e) => {
                  const newTo = Number(e.target.value);
                  setRanges((prev: any) => ({ ...prev, [mode]: { ...prev[mode], to: newTo } }));
                }}
              >
                {(() => {
                  if (mode === "Custom") {
                    return Array.from({ length: WordList.length }, (_, i) => i + 1).map((num) => num >= ranges[mode].from && (
                      <option className="bg-green-500 text-white hover:bg-green-700" key={num} value={num}>{num}</option>
                    ));
                  } else {
                    const ids = (userIds as any)[mode] || [];
                    if (ids.length === 0) return <option value={0}>0</option>;
                    return ids.map((id: number) => id >= ranges[mode].from && (
                      <option className="bg-green-500 text-white hover:bg-green-700" key={id} value={id}>{id}</option>
                    ));
                  }
                })()}
              </select>
            </div>
          </span>
        </div>
      )}
    </div>
  );
}
