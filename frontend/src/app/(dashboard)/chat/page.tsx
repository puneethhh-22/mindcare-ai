"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Plus, Loader2, AlertTriangle, Brain, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import { chatApi } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import type { ChatMessage, ChatSession } from "@/types";
import { clsx } from "clsx";
import { format } from "date-fns";

const SUGGESTED_PROMPTS = [
  "I'm feeling anxious and overwhelmed today",
  "Can you teach me a breathing exercise?",
  "I need help with negative thoughts",
  "Give me a grounding technique",
  "I'm struggling with burnout at work",
  "Help me with a journaling prompt",
];

export default function ChatPage() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await chatApi.getSessions();
      setSessions(data);
    } catch {
      // ignore
    }
  };

  const loadHistory = async (sessionId: string) => {
    setIsLoadingHistory(true);
    try {
      const history = await chatApi.getHistory(sessionId);
      setMessages(history);
      setActiveSessionId(sessionId);
    } catch {
      toast.error("Failed to load conversation");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const startNewChat = () => {
    setActiveSessionId(undefined);
    setMessages([]);
    inputRef.current?.focus();
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text.trim(),
      crisis_detected: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

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
      toast.error("Failed to send message. Please try again.");
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
    } finally {
      setIsTyping(false);
    }
  }, [activeSessionId, isTyping]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await chatApi.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) startNewChat();
      toast.success("Conversation deleted");
    } catch {
      toast.error("Failed to delete conversation");
    }
  };

  return (
    <div className="flex h-full">
      {/* ── Sidebar: Sessions ──────────────────────────────────────────────── */}
      <div className="hidden md:flex flex-col w-64 border-r border-calm-200 bg-white">
        <div className="p-4 border-b border-calm-200">
          <button onClick={startNewChat} className="btn-primary w-full text-sm">
            <Plus className="w-4 h-4" />
            New Conversation
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.length === 0 && (
            <p className="text-xs text-calm-400 text-center py-4">No conversations yet</p>
          )}
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => loadHistory(session.id)}
              className={clsx(
                "group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors",
                activeSessionId === session.id
                  ? "bg-primary-50 text-primary-700"
                  : "hover:bg-calm-50 text-calm-700"
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{session.title}</p>
                <p className="text-xs text-calm-400">
                  {format(new Date(session.updated_at), "MMM d")}
                </p>
              </div>
              <button
                onClick={(e) => deleteSession(session.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                aria-label="Delete conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Chat Area ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-calm-200 bg-white">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <h2 className="font-semibold text-calm-900">Mental Health Support</h2>
            <p className="text-xs text-calm-400">AI-powered, compassionate support</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {isLoadingHistory && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          )}

          {/* Welcome state */}
          {messages.length === 0 && !isLoadingHistory && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-lg font-semibold text-calm-900 mb-2">
                Hi {user?.full_name?.split(" ")[0] || user?.username}! 👋
              </h3>
              <p className="text-calm-500 text-sm max-w-sm mb-6">
                I'm here to support your mental wellbeing. Share what's on your mind,
                and I'll offer coping strategies, breathing exercises, and a listening ear.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-left text-sm px-4 py-2.5 bg-white border border-calm-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-colors text-calm-700"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <p className="text-xs text-calm-400 mt-6 max-w-sm">
                ⚠️ Not a replacement for professional mental health care.
                In crisis? Call <strong>988</strong> (Suicide & Crisis Lifeline).
              </p>
            </div>
          )}

          {/* Message list */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={clsx(
                "flex animate-fade-in",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                  <Brain className="w-3.5 h-3.5 text-primary-600" />
                </div>
              )}
              <div
                className={clsx(
                  msg.crisis_detected
                    ? "chat-bubble-crisis"
                    : msg.role === "user"
                    ? "chat-bubble-user"
                    : "chat-bubble-ai"
                )}
              >
                {msg.crisis_detected && (
                  <div className="flex items-center gap-2 mb-2 text-red-700 font-semibold text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    Crisis Support Resources
                  </div>
                )}
                <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                <p className="text-xs opacity-50 mt-1.5">
                  {format(new Date(msg.created_at), "h:mm a")}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-primary-600" />
              </div>
              <div className="chat-bubble-ai py-3 px-4">
                <div className="flex gap-1">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t border-calm-200 bg-white">
          <div className="flex items-end gap-3 max-w-4xl mx-auto">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share what's on your mind... (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="input flex-1 resize-none min-h-[44px] max-h-32 py-3"
              style={{ height: "auto" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              className="btn-primary p-3 flex-shrink-0"
              aria-label="Send message"
            >
              {isTyping ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-calm-400 text-center mt-2">
            In crisis? Call <strong>988</strong> or text HOME to <strong>741741</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
