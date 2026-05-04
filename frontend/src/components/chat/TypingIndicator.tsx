import { Brain } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 animate-fade-in" aria-label="AI is typing">
      <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
        <Brain className="w-3.5 h-3.5 text-primary-600" aria-hidden />
      </div>
      <div className="chat-bubble-ai py-3 px-4">
        <div className="flex gap-1" role="status">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  );
}
