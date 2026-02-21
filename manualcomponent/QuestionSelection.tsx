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
  const [userCounts, setUserCounts] = useState({ Known: 0, Unknown: 0, Hard: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    let mounted = true;
    fetch(`/api/user/${userId}/wordlists`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setUserCounts({ Known: (data?.known || []).length, Unknown: (data?.unknown || []).length, Hard: (data?.hard || []).length });
        // clamp existing ranges to available counts, but cap per-mode lists at 30
        setRanges((prev: any) => {
          const next = { ...prev };
          for (const key of ["Known", "Unknown", "Hard"]) {
            const rawMax = (data?.[key.toLowerCase()] || []).length || 0;
            const max = Math.min(rawMax, 30);
            if (next[key].from > max) next[key].from = max > 0 ? 1 : 0;
            if (next[key].to > max) next[key].to = max;
            if (next[key].from < 1 && max > 0) next[key].from = 1;
          }
          return next;
        });
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
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
                  const total = mode === "Custom" ? WordList.length : Math.min((userCounts as any)[mode] || 0, 30);
                  if (total <= 0) return <option value={0}>0</option>;
                  return Array.from({ length: total }, (_, i) => i + 1).map((num) => num <= ranges[mode].to && (
                    <option className="bg-green-500 text-white hover:bg-green-700" key={num} value={num}>{num}</option>
                  ));
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
                  const total = mode === "Custom" ? WordList.length : Math.min((userCounts as any)[mode] || 0, 30);
                  if (total <= 0) return <option value={0}>0</option>;
                  return Array.from({ length: total }, (_, i) => i + 1).map((num) => num >= ranges[mode].from && (
                    <option className="bg-green-500 text-white hover:bg-green-700" key={num} value={num}>{num}</option>
                  ));
                })()}
              </select>
            </div>
          </span>
        </div>
      )}
    </div>
  );
}
