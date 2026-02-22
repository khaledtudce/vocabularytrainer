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
          "#10b981", // emerald green
          "#64748b", // slate gray
          "#ef4444", // red
          "#d1d5db"  // light gray
        ],
        borderColor: [
          "#059669",
          "#475569",
          "#dc2626",
          "#9ca3af"
        ],
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          font: {
            size: 14,
            weight: "500"
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: "circle"
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center h-full">
      <div className="w-full h-full flex items-center justify-center">
        <Pie data={data} options={options} />
      </div>
      <div className="mt-6 text-center text-sm text-gray-600">
        <p className="font-semibold">Total words: <span className="text-lg font-bold text-gray-800">{total}</span></p>
      </div>
    </div>
  );
}
