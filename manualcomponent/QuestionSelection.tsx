"use client";

import { useState } from "react";

type DifficultySelectorType = {
  onSelectWordIdFrom: (selectedWordIdFrom: number) => void;
  onSelectWordIdTo: (selectedWordIdTo: number) => void;
};

export default function DifficultySelector({
  onSelectWordIdFrom,
  onSelectWordIdTo,
}: DifficultySelectorType) {
  const [difficulty, setDifficulty] = useState("Custom");
  const [range, setRange] = useState({ from: 1, to: 7 });

  return (
    <div className="flex items-center gap-3 p-2">
      {/* Difficulty Selection */}
      <div className="relative">
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg bg-transparent text-black appearance-none focus:ring-2 focus:ring-green-300 hover:bg-green-700"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option className="bg-green-500 text-white hover:bg-green-700" value="Medium">
            Medium
          </option>
          <option className="bg-green-500 text-white hover:bg-green-700" value="Hard">
            Hard
          </option>
          <option className="bg-green-500 text-white hover:bg-green-700" value="Custom">
            Custom
          </option>
        </select>
      </div>

      {/* Custom Range Selection */}
      {difficulty === "Custom" && (
        <div className="flex items-center gap-2">
          <span className="text-gray-600 text-sm">From</span>
          <div className="relative">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg bg-transparent text-black text-center appearance-none focus:ring-2 focus:ring-green-300 hover:bg-green-700"
              value={range.from}
              onChange={(e) => {
                const newFrom = Number(e.target.value);
                setRange((prev) => ({ ...prev, from: newFrom }));
                onSelectWordIdFrom(newFrom);
              }}
            >
              {Array.from({ length: 1999 }, (_, i) => i + 1).map((num) => (
                <option className="bg-green-500 text-white hover:bg-green-700" key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <span className="text-gray-600 text-sm">To</span>
          <div className="relative">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg bg-transparent text-black text-center appearance-none focus:ring-2 focus:ring-green-300 hover:bg-green-700"
              value={range.to}
              onChange={(e) => {
                const newTo = Number(e.target.value);
                setRange((prev) => ({ ...prev, to: newTo }));
                onSelectWordIdTo(newTo);
              }}
            >
              {Array.from({ length: 1999 }, (_, i) => i + 1).map((num) => (
                <option className="bg-green-500 text-white hover:bg-green-700" key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
