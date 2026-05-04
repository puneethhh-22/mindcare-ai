// ── Auth ──────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  health_profile: HealthProfile;
  timezone: string;
  language: string;
  created_at: string;
}

export interface HealthProfile {
  age?: number;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  blood_type?: string;
  allergies: string[];
  chronic_conditions: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: string;
  username: string;
  email: string;
}

// ── Chat ──────────────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  sentiment_score?: number;
  crisis_detected: boolean;
  created_at: string;
  message_type?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  session_type: string;
  message_count: number;
  updated_at: string;
}

export interface SendMessageResponse {
  session_id: string;
  message_id: string;
  response: string;
  crisis_detected: boolean;
  sentiment_score: number;
  sentiment_label: string;
  message_type: string;
  timestamp: string;
}

// ── Wellness ──────────────────────────────────────────────────────────────────
export type MoodLabel = "great" | "good" | "okay" | "low" | "terrible";

export interface MoodEntry {
  id: string;
  mood_score: number;
  mood_label: MoodLabel;
  emotions: string[];
  journal_text?: string;
  ai_response?: string;
  entry_date: string;
  created_at: string;
}

export interface WaterSummary {
  total_ml: number;
  goal_ml: number;
  percentage: number;
}

export interface SleepEntry {
  duration_hours: number;
  quality_score: number;
}

export interface WeeklySummary {
  summary_text: string;
  stats: {
    avg_mood: number;
    avg_sleep: number;
    avg_water_ml: number;
    medication_adherence_pct: number;
    mood_trend: string;
  };
}

// ── Medications ───────────────────────────────────────────────────────────────
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  start_date: string;
  end_date?: string;
  instructions?: string;
  color: string;
  is_active: boolean;
  reminder_enabled: boolean;
}

export interface AdherenceStats {
  medication_id: string;
  medication_name: string;
  total_scheduled: number;
  taken: number;
  skipped: number;
  missed: number;
  adherence_percentage: number;
}

// ── Symptoms ──────────────────────────────────────────────────────────────────
export interface SymptomAnalysis {
  possible_conditions: string[];
  urgency_level: "home_care" | "doctor_consultation" | "urgent_care" | "emergency";
  urgency_explanation: string;
  self_care_tips: string[];
  red_flags: string[];
  when_to_call_911: string;
  disclaimer: string;
  emergency_alert: boolean;
}

// ── UI ────────────────────────────────────────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
