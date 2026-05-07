"use client";

import { useState, useEffect } from "react";
import {
  BarChart3, Droplets, Moon, Activity, Scale,
  Plus, TrendingUp, Sparkles, Loader2, SmilePlus,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { wellnessApi } from "@/services/api";
import type { MoodEntry, WaterSummary, WeeklySummary } from "@/types";
import { clsx } from "clsx";
import { format } from "date-fns";

const MOOD_OPTIONS = [
  { score: 10, label: "great",    emoji: "😄", color: "bg-green-100 border-green-300 text-green-800" },
  { score: 7,  label: "good",     emoji: "🙂", color: "bg-teal-100 border-teal-300 text-teal-800" },
  { score: 5,  label: "okay",     emoji: "😐", color: "bg-yellow-100 border-yellow-300 text-yellow-800" },
  { score: 3,  label: "low",      emoji: "😔", color: "bg-orange-100 border-orange-300 text-orange-800" },
  { score: 1,  label: "terrible", emoji: "😢", color: "bg-red-100 border-red-300 text-red-800" },
];

const EMOTION_OPTIONS = [
  "Happy", "Calm", "Anxious", "Stressed", "Sad", "Angry",
  "Hopeful", "Tired", "Grateful", "Lonely", "Excited", "Overwhelmed",
];

const WATER_AMOUNTS = [150, 250, 350, 500];

export default function WellnessPage() {
  const [activeTab, setActiveTab] = useState<"checkin" | "water" | "sleep" | "activity" | "summary">("checkin");
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [water, setWater] = useState<WaterSummary | null>(null);
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mood check-in state
  const [selectedMood, setSelectedMood] = useState<typeof MOOD_OPTIONS[0] | null>(null);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [journalText, setJournalText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isSubmittingMood, setIsSubmittingMood] = useState(false);

  // Sleep state
  const [sleepStart, setSleepStart] = useState("");
  const [sleepEnd, setSleepEnd] = useState("");
  const [sleepQuality, setSleepQuality] = useState(3);

  // Activity state
  const [activityType, setActivityType] = useState("walking");
  const [steps, setSteps] = useState("");
  const [duration, setDuration] = useState("");

  // Weight state
  const [weight, setWeight] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [history, waterData] = await Promise.all([
        wellnessApi.getMoodHistory(7),
        wellnessApi.getWaterToday(),
      ]);
      setMoodHistory(history);
      setWater(waterData);
    } catch {
      // ignore
    }
  };

  const submitMoodCheckin = async () => {
    if (!selectedMood) return;
    setIsSubmittingMood(true);
    try {
      const entry = await wellnessApi.logMood({
        mood_score: selectedMood.score,
        mood_label: selectedMood.label,
        emotions: selectedEmotions,
        journal_text: journalText || undefined,
      });
      setAiResponse(entry.ai_response || "");
      toast.success("Mood logged! 🌟");
      await loadData();
    } catch {
      toast.error("Failed to log mood");
    } finally {
      setIsSubmittingMood(false);
    }
  };

  const logWater = async (amount: number) => {
    try {
      const result = await wellnessApi.logWater(amount);
      setWater({ total_ml: result.total_ml, goal_ml: result.goal_ml, percentage: result.percentage });
      toast.success(`+${amount}ml logged 💧`);
    } catch {
      toast.error("Failed to log water");
    }
  };

  const logSleep = async () => {
    if (!sleepStart || !sleepEnd) return;
    try {
      await wellnessApi.logSleep({
        sleep_start: new Date(sleepStart).toISOString(),
        sleep_end: new Date(sleepEnd).toISOString(),
        quality_score: sleepQuality,
      });
      toast.success("Sleep logged! 🌙");
      setSleepStart(""); setSleepEnd("");
    } catch {
      toast.error("Failed to log sleep");
    }
  };

  const logActivity = async () => {
    try {
      await wellnessApi.logActivity({
        activity_type: activityType,
        steps: steps ? parseInt(steps) : undefined,
        duration_minutes: duration ? parseInt(duration) : undefined,
      });
      toast.success("Activity logged! 🏃");
      setSteps(""); setDuration("");
    } catch {
      toast.error("Failed to log activity");
    }
  };

  const loadSummary = async () => {
    setIsLoading(true);
    try {
      const data = await wellnessApi.getWeeklySummary();
      setSummary(data);
    } catch {
      toast.error("Failed to load summary");
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = moodHistory
    .slice()
    .reverse()
    .map((e) => ({
      date: format(new Date(e.entry_date), "MMM d"),
      mood: e.mood_score,
    }));

  const tabs = [
    { id: "checkin", label: "Mood Check-in", icon: SmilePlus },
    { id: "water",   label: "Water",          icon: Droplets },
    { id: "sleep",   label: "Sleep",           icon: Moon },
    { id: "activity",label: "Activity",        icon: Activity },
    { id: "summary", label: "Summary",         icon: BarChart3 },
  ] as const;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-calm-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-teal-600" />
          Wellness Tracker
        </h1>
        <p className="text-calm-500 mt-1">Track your daily health metrics</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-calm-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); if (tab.id === "summary") loadSummary(); }}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
              activeTab === tab.id ? "bg-white text-calm-900 shadow-card" : "text-calm-500 hover:text-calm-700"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Mood Check-in ─────────────────────────────────────────────────── */}
      {activeTab === "checkin" && (
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-semibold text-calm-900 mb-4">How are you feeling today?</h2>
            <div className="flex gap-3 flex-wrap">
              {MOOD_OPTIONS.map((mood) => (
                <button
                  key={mood.label}
                  onClick={() => setSelectedMood(mood)}
                  className={clsx(
                    "flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-all",
                    selectedMood?.label === mood.label
                      ? `${mood.color} scale-105 shadow-card`
                      : "border-calm-200 hover:border-calm-300"
                  )}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-xs font-medium capitalize">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedMood && (
            <div className="card animate-slide-up space-y-4">
              <div>
                <label className="label">What emotions are you feeling?</label>
                <div className="flex flex-wrap gap-2">
                  {EMOTION_OPTIONS.map((emotion) => (
                    <button
                      key={emotion}
                      onClick={() =>
                        setSelectedEmotions((prev) =>
                          prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
                        )
                      }
                      className={clsx(
                        "px-3 py-1.5 rounded-full text-sm border transition-all",
                        selectedEmotions.includes(emotion)
                          ? "bg-primary-100 border-primary-300 text-primary-700"
                          : "border-calm-200 text-calm-600 hover:border-calm-300"
                      )}
                    >
                      {emotion}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Journal (optional)</label>
                <textarea
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  rows={3}
                  placeholder="What's on your mind today? Write freely..."
                  className="input resize-none"
                />
              </div>

              <button
                onClick={submitMoodCheckin}
                disabled={isSubmittingMood}
                className="btn-primary"
              >
                {isSubmittingMood ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Log Check-in
              </button>
            </div>
          )}

          {aiResponse && (
            <div className="card bg-gradient-to-r from-primary-50 to-teal-50 border-primary-100 animate-slide-up">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-primary-800 mb-1">MindCare AI Response</p>
                  <p className="text-sm text-primary-700 leading-relaxed">{aiResponse}</p>
                </div>
              </div>
            </div>
          )}

          {/* Mood Chart */}
          {chartData.length > 1 && (
            <div className="card">
              <h3 className="font-semibold text-calm-900 mb-4">7-Day Mood Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis domain={[1, 10]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: "#6366f1", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ── Water Tracker ─────────────────────────────────────────────────── */}
      {activeTab === "water" && (
        <div className="card space-y-6">
          <h2 className="font-semibold text-calm-900">Daily Water Intake</h2>
          {water && (
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-1">{water.total_ml}ml</div>
              <p className="text-calm-500 text-sm">of {water.goal_ml}ml daily goal</p>
              <div className="mt-4 bg-calm-100 rounded-full h-4 max-w-sm mx-auto">
                <div
                  className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(water.percentage, 100)}%` }}
                />
              </div>
              <p className="text-sm text-calm-500 mt-2">{water.percentage}% complete</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-calm-700 mb-3">Quick Add</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {WATER_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => logWater(amount)}
                  className="flex flex-col items-center gap-1 p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
                >
                  <Droplets className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold text-blue-700">{amount}ml</span>
                  <span className="text-xs text-blue-500">
                    {amount <= 150 ? "Small cup" : amount <= 250 ? "Cup" : amount <= 350 ? "Large cup" : "Bottle"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Sleep Tracker ─────────────────────────────────────────────────── */}
      {activeTab === "sleep" && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-calm-900">Log Sleep</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Bedtime</label>
              <input type="datetime-local" value={sleepStart} onChange={(e) => setSleepStart(e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Wake Time</label>
              <input type="datetime-local" value={sleepEnd} onChange={(e) => setSleepEnd(e.target.value)} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Sleep Quality: {sleepQuality}/5</label>
            <input
              type="range" min={1} max={5} value={sleepQuality}
              onChange={(e) => setSleepQuality(parseInt(e.target.value))}
              className="w-full accent-primary-600"
            />
            <div className="flex justify-between text-xs text-calm-400 mt-1">
              <span>Poor</span><span>Excellent</span>
            </div>
          </div>
          <button onClick={logSleep} disabled={!sleepStart || !sleepEnd} className="btn-primary">
            <Moon className="w-4 h-4" /> Log Sleep
          </button>
        </div>
      )}

      {/* ── Activity Tracker ──────────────────────────────────────────────── */}
      {activeTab === "activity" && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-calm-900">Log Activity</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Activity Type</label>
              <select value={activityType} onChange={(e) => setActivityType(e.target.value)} className="input">
                {["walking", "running", "cycling", "swimming", "yoga", "gym", "hiking", "other"].map((a) => (
                  <option key={a} value={a} className="capitalize">{a.charAt(0).toUpperCase() + a.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Steps (optional)</label>
              <input type="number" value={steps} onChange={(e) => setSteps(e.target.value)} placeholder="e.g., 8000" className="input" />
            </div>
            <div>
              <label className="label">Duration (minutes)</label>
              <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g., 30" className="input" />
            </div>
          </div>
          <button onClick={logActivity} className="btn-primary">
            <Activity className="w-4 h-4" /> Log Activity
          </button>
        </div>
      )}

      {/* ── Weekly Summary ────────────────────────────────────────────────── */}
      {activeTab === "summary" && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : summary ? (
            <>
              <div className="card bg-gradient-to-r from-primary-50 to-teal-50 border-primary-100">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-primary-800 mb-2">AI Weekly Summary</p>
                    <p className="text-sm text-primary-700 leading-relaxed whitespace-pre-line">{summary.summary_text}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Avg Mood", value: `${summary.stats.avg_mood}/10`, icon: "😊" },
                  { label: "Avg Sleep", value: `${summary.stats.avg_sleep}h`, icon: "🌙" },
                  { label: "Avg Water", value: `${summary.stats.avg_water_ml}ml`, icon: "💧" },
                  { label: "Med Adherence", value: `${summary.stats.medication_adherence_pct}%`, icon: "💊" },
                ].map((stat) => (
                  <div key={stat.label} className="card text-center">
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="text-xl font-bold text-calm-900">{stat.value}</div>
                    <div className="text-xs text-calm-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="card text-center py-12">
              <TrendingUp className="w-12 h-12 text-calm-300 mx-auto mb-3" />
              <p className="text-calm-500 mb-4">Generate your weekly wellness summary</p>
              <button onClick={loadSummary} className="btn-primary">
                <Sparkles className="w-4 h-4" /> Generate Summary
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
