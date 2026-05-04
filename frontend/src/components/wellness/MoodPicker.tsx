"use client";

import { clsx } from "clsx";

export const MOOD_OPTIONS = [
  { score: 10, label: "great",    emoji: "😄", color: "border-green-300 bg-green-50 text-green-800" },
  { score: 7,  label: "good",     emoji: "🙂", color: "border-teal-300 bg-teal-50 text-teal-800" },
  { score: 5,  label: "okay",     emoji: "😐", color: "border-yellow-300 bg-yellow-50 text-yellow-800" },
  { score: 3,  label: "low",      emoji: "😔", color: "border-orange-300 bg-orange-50 text-orange-800" },
  { score: 1,  label: "terrible", emoji: "😢", color: "border-red-300 bg-red-50 text-red-800" },
] as const;

export type MoodOption = (typeof MOOD_OPTIONS)[number];

interface Props {
  selected: MoodOption | null;
  onSelect: (mood: MoodOption) => void;
}

export function MoodPicker({ selected, onSelect }: Props) {
  return (
    <div className="flex gap-3 flex-wrap" role="radiogroup" aria-label="Select your mood">
      {MOOD_OPTIONS.map((mood) => (
        <button
          key={mood.label}
          type="button"
          role="radio"
          aria-checked={selected?.label === mood.label}
          onClick={() => onSelect(mood)}
          className={clsx(
            "flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500",
            selected?.label === mood.label
              ? `${mood.color} scale-105 shadow-card`
              : "border-calm-200 hover:border-calm-300 bg-white"
          )}
        >
          <span className="text-2xl" aria-hidden>{mood.emoji}</span>
          <span className="text-xs font-medium capitalize">{mood.label}</span>
        </button>
      ))}
    </div>
  );
}
