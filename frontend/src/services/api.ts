/**
 * Centralized API client using Axios.
 * Handles auth headers, token refresh, and error normalization.
 */
import axios, { AxiosInstance, AxiosError } from "axios";
import Cookies from "js-cookie";
import type {
  AuthTokens,
  User,
  ChatMessage,
  ChatSession,
  SendMessageResponse,
  MoodEntry,
  WaterSummary,
  WeeklySummary,
  Medication,
  AdherenceStats,
  SymptomAnalysis,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// ── Axios Instance ────────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// Request interceptor – attach JWT
api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor – handle 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: async (data: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
  }): Promise<AuthTokens> => {
    const res = await api.post("/auth/register", data);
    return res.data;
  },

  login: async (email: string, password: string): Promise<AuthTokens> => {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
  },

  getProfile: async (): Promise<User> => {
    const res = await api.get("/auth/me");
    return res.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const res = await api.put("/auth/me", data);
    return res.data;
  },
};

// ── Chat ──────────────────────────────────────────────────────────────────────
export const chatApi = {
  sendMessage: async (
    message: string,
    sessionId?: string,
    sessionType = "mental_health"
  ): Promise<SendMessageResponse> => {
    const res = await api.post("/chat/message", {
      message,
      session_id: sessionId,
      session_type: sessionType,
    });
    return res.data;
  },

  getSessions: async (): Promise<ChatSession[]> => {
    const res = await api.get("/chat/sessions");
    return res.data;
  },

  getHistory: async (sessionId: string): Promise<ChatMessage[]> => {
    const res = await api.get(`/chat/sessions/${sessionId}/history`);
    return res.data;
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    await api.delete(`/chat/sessions/${sessionId}`);
  },
};

// ── Symptoms ──────────────────────────────────────────────────────────────────
export const symptomsApi = {
  analyze: async (data: {
    symptoms: string;
    duration?: string;
    additional_context?: string;
  }): Promise<SymptomAnalysis> => {
    const res = await api.post("/symptoms/analyze", data);
    return res.data;
  },

  faq: async (question: string): Promise<{ question: string; answer: string; disclaimer: string }> => {
    const res = await api.post("/symptoms/faq", { question });
    return res.data;
  },
};

// ── Wellness ──────────────────────────────────────────────────────────────────
export const wellnessApi = {
  logMood: async (data: {
    mood_score: number;
    mood_label: string;
    emotions: string[];
    journal_text?: string;
    triggers?: string[];
    activities?: string[];
  }): Promise<MoodEntry> => {
    const res = await api.post("/wellness/mood", data);
    return res.data;
  },

  getMoodHistory: async (days = 7): Promise<MoodEntry[]> => {
    const res = await api.get(`/wellness/mood?days=${days}`);
    return res.data;
  },

  getMoodTrend: async () => {
    const res = await api.get("/wellness/mood/trend");
    return res.data;
  },

  logWater: async (amount_ml: number): Promise<WaterSummary & { logged_ml: number }> => {
    const res = await api.post("/wellness/water", { amount_ml });
    return res.data;
  },

  getWaterToday: async (): Promise<WaterSummary> => {
    const res = await api.get("/wellness/water/today");
    return res.data;
  },

  logSleep: async (data: {
    sleep_start: string;
    sleep_end: string;
    quality_score: number;
    notes?: string;
  }) => {
    const res = await api.post("/wellness/sleep", data);
    return res.data;
  },

  logActivity: async (data: {
    activity_type: string;
    steps?: number;
    duration_minutes?: number;
    calories_burned?: number;
    distance_km?: number;
  }) => {
    const res = await api.post("/wellness/activity", data);
    return res.data;
  },

  logWeight: async (weight_kg: number, notes?: string) => {
    const res = await api.post("/wellness/weight", { weight_kg, notes });
    return res.data;
  },

  getWeeklySummary: async (): Promise<WeeklySummary> => {
    const res = await api.get("/wellness/summary");
    return res.data;
  },

  getWellnessTip: async (): Promise<{ tip: string }> => {
    const res = await api.get("/wellness/tip");
    return res.data;
  },
};

// ── Medications ───────────────────────────────────────────────────────────────
export const medicationsApi = {
  list: async (): Promise<Medication[]> => {
    const res = await api.get("/medications");
    return res.data;
  },

  add: async (data: Omit<Medication, "id" | "is_active">): Promise<Medication> => {
    const res = await api.post("/medications", data);
    return res.data;
  },

  update: async (id: string, data: Partial<Medication>): Promise<Medication> => {
    const res = await api.put(`/medications/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/medications/${id}`);
  },

  logTaken: async (medication_id: string, status: "taken" | "skipped", notes?: string) => {
    const res = await api.post("/medications/log", { medication_id, status, notes });
    return res.data;
  },

  getAdherence: async (): Promise<AdherenceStats[]> => {
    const res = await api.get("/medications/adherence");
    return res.data;
  },
};

export default api;
