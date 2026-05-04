import { Loader2 } from "lucide-react";
import { clsx } from "clsx";

interface Props {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeMap = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" };

export function LoadingSpinner({ size = "md", className, label }: Props) {
  return (
    <div className={clsx("flex flex-col items-center justify-center gap-2", className)}>
      <Loader2 className={clsx("animate-spin text-primary-500", sizeMap[size])} />
      {label && <p className="text-sm text-calm-500">{label}</p>}
    </div>
  );
}
