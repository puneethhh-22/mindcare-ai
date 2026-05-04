"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  Stethoscope,
  Pill,
  BarChart3,
  Shield,
  Heart,
  ArrowRight,
  Star,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Mental Health Support",
    description:
      "CBT-inspired coping strategies, breathing exercises, and mood tracking with compassionate AI support.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Stethoscope,
    title: "Symptom Checker",
    description:
      "Describe your symptoms in plain language and get urgency recommendations with medical FAQs.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Pill,
    title: "Medication Reminders",
    description:
      "Never miss a dose. Track medications, set reminders, and monitor adherence over time.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: BarChart3,
    title: "Wellness Dashboard",
    description:
      "Track sleep, water intake, activity, and weight with AI-powered weekly health summaries.",
    color: "bg-teal-50 text-teal-600",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "HIPAA/GDPR-inspired data handling. Your health data is encrypted and never sold.",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: Heart,
    title: "Crisis Support",
    description:
      "Automatic crisis detection with immediate links to emergency mental health resources.",
    color: "bg-red-50 text-red-600",
  },
];

const stats = [
  { value: "24/7", label: "AI Support" },
  { value: "100%", label: "Private & Secure" },
  { value: "5+", label: "Wellness Trackers" },
  { value: "Free", label: "To Get Started" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 via-white to-primary-50">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-calm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-calm-900">MindCare AI</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="btn-ghost text-sm">
                Sign In
              </Link>
              <Link href="/register" className="btn-primary text-sm">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-primary-200">
            <Star className="w-3.5 h-3.5" />
            AI-Powered Healthcare & Wellness
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-calm-900 mb-6 leading-tight text-balance">
            Your Intelligent{" "}
            <span className="text-primary-600">Healthcare</span> &{" "}
            <span className="text-teal-600">Wellness</span> Companion
          </h1>

          <p className="text-xl text-calm-500 max-w-2xl mx-auto mb-8 text-balance">
            Mental health support, symptom checking, medication reminders, and wellness
            tracking — all in one compassionate AI platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="btn-primary text-base px-6 py-3">
              Start Your Wellness Journey
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="btn-secondary text-base px-6 py-3">
              Sign In to Dashboard
            </Link>
          </div>

          {/* Disclaimer */}
          <p className="mt-6 text-xs text-calm-400 max-w-lg mx-auto">
            ⚠️ MindCare AI is not a replacement for professional medical advice.
            Always consult a qualified healthcare professional for medical concerns.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 max-w-2xl mx-auto"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary-600">{stat.value}</div>
              <div className="text-sm text-calm-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-calm-900 mb-4">
            Everything You Need for Better Health
          </h2>
          <p className="text-calm-500 max-w-xl mx-auto">
            A comprehensive platform designed with your wellbeing at the center.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="card hover:shadow-card-hover transition-shadow duration-200"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-calm-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-calm-500 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-primary-600 to-teal-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Start Your Wellness Journey Today
          </h2>
          <p className="text-primary-100 mb-8 max-w-lg mx-auto">
            Join thousands of users taking control of their mental and physical health
            with AI-powered support.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-calm-200 py-8 text-center text-sm text-calm-400">
        <p>© 2024 MindCare AI. Built with ❤️ for better health.</p>
        <p className="mt-2 text-xs max-w-lg mx-auto">
          ⚠️ This platform is for informational purposes only and does not provide
          medical advice, diagnosis, or treatment. If you are experiencing a medical
          emergency, call 911 immediately.
        </p>
      </footer>
    </div>
  );
}
