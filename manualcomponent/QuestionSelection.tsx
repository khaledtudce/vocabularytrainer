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
  const [difficulty, setDifficulty] = useState("Medium");
  const [range, setRange] = useState({ from: 1, to: 30 });

  return (
    <div
      className={`p-4 flex bg-gray-100 rounded-lg shadow-md ${
        difficulty === "Custom" ? "w-72" : "w-44"
      }`}
    >
      <select
        className="w-full rounded border"
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
      >
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
        <option value="Custom">Select range</option>
      </select>

      {difficulty === "Custom" && (
        <>
          <div className="flex pl-2 pt-2 w-full">
            <span>from</span>
            <select
              className="w-full rounded border"
              value={range.from}
              onChange={(e) => {
                setRange({ ...range, from: Number(e.target.value) });
                onSelectWordIdFrom(Number(e.target.value));
              }}
            >
              {Array.from({ length: 1999 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            <span>to</span>
            <select
              className="w-full rounded border"
              value={range.to}
              onChange={(e) => {
                setRange({ ...range, to: Number(e.target.value) });
                onSelectWordIdTo(Number(e.target.value));
              }}
            >
              {Array.from({ length: 1999 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
}
