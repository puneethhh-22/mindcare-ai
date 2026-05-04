import { AlertTriangle } from "lucide-react";

interface Props {
  variant?: "default" | "compact";
}

export function DisclaimerBanner({ variant = "default" }: Props) {
  if (variant === "compact") {
    return (
      <p className="text-xs text-calm-400 text-center">
        ⚠️ Not a replacement for professional medical advice. In crisis? Call{" "}
        <strong>988</strong>.
      </p>
    );
  }

  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden />
      <p className="text-sm text-amber-800">
        <strong>Medical Disclaimer:</strong> MindCare AI provides general wellness
        information only. It is <strong>NOT</strong> a substitute for professional
        medical advice, diagnosis, or treatment. Always consult a qualified healthcare
        provider. For emergencies, call <strong>911</strong>.
      </p>
    </div>
  );
}
