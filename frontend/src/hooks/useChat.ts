/**
 * Custom hook for chat state management.
 * Encapsulates message sending, session handling, and typing state.
 */
import { useState, useCallback, useRef } from "react";
import { chatApi } from "@/services/api";
import type { ChatMessage, ChatSession } from "@/types";

interface UseChatReturn {
  messages: ChatMessage[];
  sessions: ChatSession[];
  activeSessionId: string | undefined;
  isTyping: boolean;
  isLoadingHistory: boolean;
  sendMessage: (text: string) => Promise<void>;
  loadHistory: (sessionId: string) => Promise<void>;
  loadSessions: () => Promise<void>;
  startNewChat: () => void;
  deleteSession: (sessionId: string) => Promise<void>;
  error: string | null;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>();
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      const data = await chatApi.getSessions();
      setSessions(data);
    } catch {
      // Non-critical – silently fail
    }
  }, []);

  const loadHistory = useCallback(async (sessionId: string) => {
    setIsLoadingHistory(true);
    setError(null);
    try {
      const history = await chatApi.getHistory(sessionId);
      setMessages(history);
      setActiveSessionId(sessionId);
    } catch {
      setError("Failed to load conversation history.");
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const startNewChat = useCallback(() => {
    setActiveSessionId(undefined);
    setMessages([]);
    setError(null);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isTyping) return;

      const tempId = `temp-${Date.now()}`;
      const userMsg: ChatMessage = {
        id: tempId,
        role: "user",
        content: text.trim(),
        crisis_detected: false,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);
      setError(null);

      try {
        const response = await chatApi.sendMessage(text.trim(), activeSessionId);

        if (!activeSessionId) {
          setActiveSessionId(response.session_id);
          await loadSessions();
        }

        const aiMsg: ChatMessage = {
          id: response.message_id,
          role: "assistant",
          content: response.response,
          crisis_detected: response.crisis_detected,
          sentiment_score: response.sentiment_score,
          created_at: response.timestamp,
          message_type: response.message_type,
        };

        setMessages((prev) => [...prev, aiMsg]);
      } catch {
        setError("Failed to send message. Please try again.");
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } finally {
        setIsTyping(false);
      }
    },
    [activeSessionId, isTyping, loadSessions]
  );

  const deleteSession = useCallback(
    async (sessionId: string) => {
      await chatApi.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) startNewChat();
    },
    [activeSessionId, startNewChat]
  );

  return {
    messages,
    sessions,
    activeSessionId,
    isTyping,
    isLoadingHistory,
    sendMessage,
    loadHistory,
    loadSessions,
    startNewChat,
    deleteSession,
    error,
  };
}
