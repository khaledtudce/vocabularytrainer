"use client";

import { useEffect, useState } from "react";
import { WordList } from "@/data/wordlists";

export default function DifficultySelector() {
  const defaultRanges = { from: 1, to: 5000 }; // Allow viewing all words
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
    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 p-2">
      {/* Difficulty Selection */}
      <div className="w-full sm:w-auto relative">
        <select
          className="w-full px-3 sm:px-4 py-2 border-2 border-indigo-400 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-xs sm:text-sm appearance-none focus:ring-2 focus:ring-white focus:ring-opacity-50 hover:border-white hover:border-opacity-50 transition-all font-medium shadow-lg"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option className="bg-indigo-700 text-white" value="Known">
            📚 Known
          </option>
          <option className="bg-indigo-700 text-white" value="Unknown">
            ❓ Unknown
          </option>
          <option className="bg-indigo-700 text-white" value="Hard">
            ⚡ Hard
          </option>
          <option className="bg-indigo-700 text-white" value="Custom">
            ✏️ Custom
          </option>
        </select>
      </div>

      {/* Range Selection for active mode */}
      {mode && (
        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          <span className="w-full sm:w-auto flex items-center gap-1">
            <span className="text-white text-xs sm:text-sm font-medium whitespace-nowrap">from:</span>
            <div className="flex-1 sm:flex-none relative">
              <select
                className="w-full px-3 sm:px-4 py-2 border-2 border-indigo-400 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-xs sm:text-sm text-center appearance-none focus:ring-2 focus:ring-white focus:ring-opacity-50 hover:border-white hover:border-opacity-50 transition-all font-medium shadow-lg"
                value={ranges[mode].from}
                onChange={(e) => {
                  const newFrom = Number(e.target.value);
                  setRanges((prev: any) => ({ ...prev, [mode]: { ...prev[mode], from: newFrom } }));
                }}
              >
                {(() => {
                  if (mode === "Custom") {
                    return Array.from({ length: WordList.length }, (_, i) => i + 1).map((num) => num <= ranges[mode].to && (
                      <option className="bg-indigo-600 text-white" key={num} value={num}>{num}</option>
                    ));
                  } else {
                    const ids = (userIds as any)[mode] || [];
                    if (ids.length === 0) return <option value={0}>0</option>;
                    return ids.map((id: number) => id <= ranges[mode].to && (
                      <option className="bg-indigo-600 text-white" key={id} value={id}>{id}</option>
                    ));
                  }
                })()}
              </select>
            </div>
          </span>

          <span className="w-full sm:w-auto flex items-center gap-1">
            <span className="text-white text-xs sm:text-sm font-medium whitespace-nowrap">to:</span>
            <div className="flex-1 sm:flex-none relative">
              <select
                className="w-full px-3 sm:px-4 py-2 border-2 border-indigo-400 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-xs sm:text-sm text-center appearance-none focus:ring-2 focus:ring-white focus:ring-opacity-50 hover:border-white hover:border-opacity-50 transition-all font-medium shadow-lg"
                value={ranges[mode].to}
                onChange={(e) => {
                  const newTo = Number(e.target.value);
                  setRanges((prev: any) => ({ ...prev, [mode]: { ...prev[mode], to: newTo } }));
                }}
              >
                {(() => {
                  if (mode === "Custom") {
                    return Array.from({ length: WordList.length }, (_, i) => i + 1).map((num) => num >= ranges[mode].from && (
                      <option className="bg-indigo-600 text-white" key={num} value={num}>{num}</option>
                    ));
                  } else {
                    const ids = (userIds as any)[mode] || [];
                    if (ids.length === 0) return <option value={0}>0</option>;
                    return ids.map((id: number) => id >= ranges[mode].from && (
                      <option className="bg-indigo-600 text-white" key={id} value={id}>{id}</option>
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
