"use client";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

export default function ProgressPieChart({ known, unknown, hard, total }: { known: number; unknown: number; hard: number; total: number }) {
  const remaining = Math.max(total - known - unknown - hard, 0);
  const data = {
    labels: ["Known", "Unknown", "Hard", "Unclassified"],
    datasets: [
      {
        data: [known, unknown, hard, remaining],
        backgroundColor: [
          "#22c55e", // green
          "#000000", // black
          "#ef4444", // red
          "#a3a3a3"  // gray
        ],
        borderWidth: 1,
      },
    ],
  };
  return (
    <div className="w-full flex flex-col items-center">
      <Pie data={data} options={{ plugins: { legend: { position: "bottom" } } }} />
      <div className="mt-2 text-xs text-gray-500">Total words: {total}</div>
    </div>
  );
}
