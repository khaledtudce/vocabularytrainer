"use client";

import { useEffect, useState } from "react";

export default function DifficultySelector() {
  const [difficulty, setDifficulty] = useState("Custom");
  const [range, setRange] = useState(() => {
    if (typeof window !== "undefined") {
      const storedRange = localStorage.getItem("wordRange");
      return storedRange ? JSON.parse(storedRange) : { from: 1, to: 30 };
    }
    return { from: 1, to: 30 };
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("wordRange", JSON.stringify(range));
      window.dispatchEvent(
        new CustomEvent("wordRangeUpdated", { detail: range })
      );
    }
  }, [range]);

  return (
    <div className="flex items-center gap-2 p-2">
      {/* Difficulty Selection */}
      <div className="relative">
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg bg-transparent text-white appearance-none focus:ring-2 focus:ring-green-300 hover:bg-green-700"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option
            className="bg-green-500 text-white hover:bg-green-700"
            value="Medium"
          >
            Medium
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

      {/* Custom Range Selection */}
      {difficulty === "Custom" && (
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="text-white text-sm">from:</span>
            <div className="relative">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg bg-transparent text-white text-center appearance-none focus:ring-2 focus:ring-green-300 hover:bg-green-700"
                value={range.from}
                onChange={(e) => {
                  const newFrom = Number(e.target.value);
                  setRange((prev) => ({ ...prev, from: newFrom }));
                }}
              >
                {Array.from({ length: 1999 }, (_, i) => i + 1).map(
                  (num) =>
                    num <= range.to && (
                      <option
                        className="bg-green-500 text-white hover:bg-green-700"
                        key={num}
                        value={num}
                      >
                        {num}
                      </option>
                    )
                )}
              </select>
            </div>
          </span>

          <span className="flex items-center gap-1">
            <span className="text-white text-sm">to:</span>
            <div className="relative">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg bg-transparent text-white text-center appearance-none focus:ring-2 focus:ring-green-300 hover:bg-green-700"
                value={range.to}
                onChange={(e) => {
                  const newTo = Number(e.target.value);
                  setRange((prev) => ({ ...prev, to: newTo }));
                }}
              >
                {Array.from({ length: 1999 }, (_, i) => i + 1).map(
                  (num) =>
                    num >= range.from && (
                      <option
                        className="bg-green-500 text-white hover:bg-green-700"
                        key={num}
                        value={num}
                      >
                        {num}
                      </option>
                    )
                )}
              </select>
            </div>
          </span>
        </div>
      )}
    </div>
  );
}
