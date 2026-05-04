"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Brain,
  Stethoscope,
  Pill,
  BarChart3,
  Droplets,
  Moon,
  TrendingUp,
  ArrowRight,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { wellnessApi, medicationsApi } from "@/services/api";
import type { WaterSummary, WeeklySummary, MoodEntry } from "@/types";

const MOOD_EMOJI: Record<string, string> = {
  great: "😄",
  good: "🙂",
  okay: "😐",
  low: "😔",
  terrible: "😢",
};

const URGENCY_COLOR: Record<string, string> = {
  home_care: "text-green-600 bg-green-50",
  doctor_consultation: "text-yellow-600 bg-yellow-50",
  urgent_care: "text-orange-600 bg-orange-50",
  emergency: "text-red-600 bg-red-50",
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [water, setWater] = useState<WaterSummary | null>(null);
  const [recentMood, setRecentMood] = useState<MoodEntry | null>(null);
  const [tip, setTip] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [waterData, moodHistory, tipData] = await Promise.all([
          wellnessApi.getWaterToday(),
          wellnessApi.getMoodHistory(1),
          wellnessApi.getWellnessTip(),
        ]);
        setWater(waterData);
        setRecentMood(moodHistory[0] || null);
        setTip(tipData.tip);
      } catch {
        // Silently handle – user may have no data yet
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const quickActions = [
    {
      title: "Chat with AI",
      description: "Mental health support & coping strategies",
      href: "/chat",
      icon: Brain,
      color: "bg-purple-50 text-purple-600 border-purple-100",
    },
    {
      title: "Check Symptoms",
      description: "Analyze symptoms & get urgency guidance",
      href: "/symptoms",
      icon: Stethoscope,
      color: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      title: "Medications",
      description: "Track doses & medication adherence",
      href: "/medications",
      icon: Pill,
      color: "bg-green-50 text-green-600 border-green-100",
    },
    {
      title: "Wellness Tracker",
      description: "Log mood, sleep, water & activity",
      href: "/wellness",
      icon: BarChart3,
      color: "bg-teal-50 text-teal-600 border-teal-100",
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-calm-900">
            {greeting()}, {user?.full_name?.split(" ")[0] || user?.username} 👋
          </h1>
          <p className="text-calm-500 mt-1">How are you feeling today?</p>
        </div>
        <Link href="/wellness" className="btn-primary text-sm hidden sm:flex">
          Log Mood
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* ── Disclaimer Banner ───────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          <strong>Medical Disclaimer:</strong> MindCare AI provides general wellness
          information only. It is NOT a substitute for professional medical advice,
          diagnosis, or treatment. Always consult a qualified healthcare provider.
        </p>
      </div>

      {/* ── Today's Stats ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mood */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-medium text-calm-500 uppercase tracking-wide">Today's Mood</span>
          </div>
          {recentMood ? (
            <>
              <div className="text-3xl mb-1">{MOOD_EMOJI[recentMood.mood_label] || "😐"}</div>
              <p className="text-sm font-medium text-calm-700 capitalize">{recentMood.mood_label}</p>
              <p className="text-xs text-calm-400">{recentMood.mood_score}/10</p>
            </>
          ) : (
            <p className="text-sm text-calm-400">Not logged yet</p>
          )}
        </div>

        {/* Water */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-calm-500 uppercase tracking-wide">Water</span>
          </div>
          {water ? (
            <>
              <p className="text-2xl font-bold text-calm-900">{water.total_ml}ml</p>
              <div className="mt-2 bg-calm-100 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(water.percentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-calm-400 mt-1">{water.percentage}% of daily goal</p>
            </>
          ) : (
            <p className="text-sm text-calm-400">Not logged yet</p>
          )}
        </div>

        {/* Sleep placeholder */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Moon className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-medium text-calm-500 uppercase tracking-wide">Sleep</span>
          </div>
          <p className="text-sm text-calm-400">Log last night's sleep</p>
          <Link href="/wellness" className="text-xs text-primary-600 font-medium mt-2 inline-block hover:underline">
            Add entry →
          </Link>
        </div>

        {/* Trend */}
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-calm-500 uppercase tracking-wide">Trend</span>
          </div>
          <p className="text-sm text-calm-400">Check your weekly wellness summary</p>
          <Link href="/wellness" className="text-xs text-primary-600 font-medium mt-2 inline-block hover:underline">
            View summary →
          </Link>
        </div>
      </div>

      {/* ── AI Wellness Tip ─────────────────────────────────────────────────── */}
      {tip && (
        <div className="card bg-gradient-to-r from-primary-50 to-teal-50 border-primary-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary-800 mb-1">Today's Wellness Tip</p>
              <p className="text-sm text-primary-700 leading-relaxed">{tip}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Actions ───────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-calm-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`card-hover border ${action.color} group`}
            >
              <action.icon className="w-8 h-8 mb-3" />
              <h3 className="font-semibold text-calm-900 mb-1 group-hover:text-primary-700 transition-colors">
                {action.title}
              </h3>
              <p className="text-xs text-calm-500 leading-relaxed">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
