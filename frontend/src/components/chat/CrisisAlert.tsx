import { AlertTriangle, Phone, MessageSquare, ExternalLink } from "lucide-react";

const CRISIS_RESOURCES = [
  {
    name: "988 Suicide & Crisis Lifeline",
    contact: "Call or text 988",
    icon: Phone,
    href: "tel:988",
  },
  {
    name: "Crisis Text Line",
    contact: "Text HOME to 741741",
    icon: MessageSquare,
    href: "sms:741741",
  },
  {
    name: "International Resources",
    contact: "iasp.info/resources",
    icon: ExternalLink,
    href: "https://www.iasp.info/resources/Crisis_Centres/",
  },
];

export function CrisisAlert() {
  return (
    <div
      className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 max-w-lg"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-red-600" aria-hidden />
        <h3 className="font-bold text-red-800">Immediate Support Available</h3>
      </div>
      <p className="text-sm text-red-700 mb-4">
        I'm concerned about what you've shared. You're not alone — please reach out
        to one of these free, confidential resources right now:
      </p>
      <div className="space-y-2">
        {CRISIS_RESOURCES.map((r) => (
          <a
            key={r.name}
            href={r.href}
            target={r.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
          >
            <r.icon className="w-4 h-4 text-red-600 flex-shrink-0" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-red-800">{r.name}</p>
              <p className="text-xs text-red-600">{r.contact}</p>
            </div>
          </a>
        ))}
      </div>
      <p className="text-xs text-red-500 mt-3">
        If you are in immediate danger, call <strong>911</strong> now.
      </p>
    </div>
  );
}
