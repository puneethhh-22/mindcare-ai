import { LucideIcon } from "lucide-react";
import { clsx } from "clsx";

interface Props {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: "up" | "down" | "stable";
  progress?: number; // 0-100
}

export function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  iconColor = "text-primary-500",
  trend,
  progress,
}: Props) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={clsx("w-4 h-4", iconColor)} aria-hidden />
        <span className="text-xs font-medium text-calm-500 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold text-calm-900">{value}</p>
      {subtext && <p className="text-xs text-calm-400 mt-0.5">{subtext}</p>}
      {progress !== undefined && (
        <div className="mt-3 bg-calm-100 rounded-full h-1.5">
          <div
            className="bg-primary-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
