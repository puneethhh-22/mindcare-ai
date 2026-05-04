"use client";

import { Droplets } from "lucide-react";
import { clsx } from "clsx";

const QUICK_AMOUNTS = [
  { ml: 150, label: "Small cup" },
  { ml: 250, label: "Cup" },
  { ml: 350, label: "Large cup" },
  { ml: 500, label: "Bottle" },
];

interface Props {
  totalMl: number;
  goalMl: number;
  percentage: number;
  onLog: (amount: number) => void;
}

export function WaterTracker({ totalMl, goalMl, percentage, onLog }: Props) {
  const pct = Math.min(percentage, 100);

  return (
    <div className="space-y-6">
      {/* Progress display */}
      <div className="text-center">
        <div className="text-5xl font-bold text-blue-600 mb-1">{totalMl}ml</div>
        <p className="text-calm-500 text-sm">of {goalMl}ml daily goal</p>
        <div
          className="mt-4 bg-calm-100 rounded-full h-4 max-w-sm mx-auto overflow-hidden"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Water intake: ${pct}% of daily goal`}
        >
          <div
            className={clsx(
              "h-4 rounded-full transition-all duration-500",
              pct >= 100 ? "bg-green-500" : "bg-blue-500"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-sm text-calm-500 mt-2">
          {pct >= 100 ? "🎉 Goal reached!" : `${pct}% complete`}
        </p>
      </div>

      {/* Quick add buttons */}
      <div>
        <p className="text-sm font-medium text-calm-700 mb-3">Quick Add</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_AMOUNTS.map(({ ml, label }) => (
            <button
              key={ml}
              onClick={() => onLog(ml)}
              className="flex flex-col items-center gap-1 p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label={`Add ${ml}ml of water`}
            >
              <Droplets className="w-5 h-5 text-blue-500" aria-hidden />
              <span className="font-semibold text-blue-700">{ml}ml</span>
              <span className="text-xs text-blue-500">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
