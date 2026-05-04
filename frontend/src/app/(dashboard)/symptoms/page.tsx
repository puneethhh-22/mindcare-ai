"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Phone,
  Loader2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { symptomsApi } from "@/services/api";
import type { SymptomAnalysis } from "@/types";
import { clsx } from "clsx";

const symptomSchema = z.object({
  symptoms: z.string().min(10, "Please describe your symptoms in more detail"),
  duration: z.string().optional(),
  additional_context: z.string().optional(),
});

type SymptomForm = z.infer<typeof symptomSchema>;

const URGENCY_CONFIG = {
  home_care: {
    label: "Home Care",
    icon: CheckCircle2,
    color: "text-green-700 bg-green-50 border-green-200",
    iconColor: "text-green-600",
    description: "These symptoms can likely be managed at home.",
  },
  doctor_consultation: {
    label: "See a Doctor",
    icon: Clock,
    color: "text-yellow-700 bg-yellow-50 border-yellow-200",
    iconColor: "text-yellow-600",
    description: "Schedule an appointment with your doctor within 1-3 days.",
  },
  urgent_care: {
    label: "Urgent Care",
    icon: AlertTriangle,
    color: "text-orange-700 bg-orange-50 border-orange-200",
    iconColor: "text-orange-600",
    description: "Seek medical attention within a few hours.",
  },
  emergency: {
    label: "Emergency – Call 911",
    icon: Phone,
    color: "text-red-700 bg-red-50 border-red-300",
    iconColor: "text-red-600",
    description: "Call 911 or go to the nearest emergency room immediately.",
  },
};

const FAQ_QUESTIONS = [
  "What is the difference between a cold and the flu?",
  "How do I know if I have high blood pressure?",
  "What are the symptoms of diabetes?",
  "When should I go to the ER vs urgent care?",
  "What causes chronic fatigue?",
];

export default function SymptomsPage() {
  const [result, setResult] = useState<SymptomAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [isFaqLoading, setIsFaqLoading] = useState(false);
  const [showFaq, setShowFaq] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SymptomForm>({ resolver: zodResolver(symptomSchema) });

  const onSubmit = async (data: SymptomForm) => {
    setIsAnalyzing(true);
    setResult(null);
    try {
      const analysis = await symptomsApi.analyze(data);
      setResult(analysis);
    } catch {
      toast.error("Failed to analyze symptoms. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const askFaq = async (question: string) => {
    setFaqQuestion(question);
    setIsFaqLoading(true);
    setFaqAnswer("");
    try {
      const res = await symptomsApi.faq(question);
      setFaqAnswer(res.answer);
    } catch {
      toast.error("Failed to get answer. Please try again.");
    } finally {
      setIsFaqLoading(false);
    }
  };

  const urgencyConfig = result ? URGENCY_CONFIG[result.urgency_level] : null;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-calm-900 flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-blue-600" />
          Symptom Checker
        </h1>
        <p className="text-calm-500 mt-1">
          Describe your symptoms and get urgency guidance.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          <strong>Important:</strong> This tool provides general health information only.
          It does NOT diagnose conditions or replace professional medical advice.
          For emergencies, call <strong>911</strong> immediately.
        </p>
      </div>

      {/* Symptom Form */}
      <div className="card">
        <h2 className="font-semibold text-calm-900 mb-4">Describe Your Symptoms</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">What symptoms are you experiencing?</label>
            <textarea
              {...register("symptoms")}
              rows={4}
              placeholder="e.g., I have a headache, sore throat, and mild fever for the past 2 days..."
              className={clsx("input resize-none", errors.symptoms && "input-error")}
            />
            {errors.symptoms && (
              <p className="text-red-500 text-xs mt-1">{errors.symptoms.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">How long have you had these symptoms?</label>
              <input
                {...register("duration")}
                placeholder="e.g., 2 days, 1 week"
                className="input"
              />
            </div>
            <div>
              <label className="label">Any additional context?</label>
              <input
                {...register("additional_context")}
                placeholder="e.g., recent travel, known allergies"
                className="input"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={isAnalyzing} className="btn-primary">
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Stethoscope className="w-4 h-4" />
                  Analyze Symptoms
                </>
              )}
            </button>
            {result && (
              <button
                type="button"
                onClick={() => { setResult(null); reset(); }}
                className="btn-secondary"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Results */}
      {result && urgencyConfig && (
        <div className="space-y-4 animate-slide-up">
          {/* Urgency Banner */}
          <div className={clsx("border-2 rounded-2xl p-5", urgencyConfig.color)}>
            <div className="flex items-center gap-3 mb-2">
              <urgencyConfig.icon className={clsx("w-6 h-6", urgencyConfig.iconColor)} />
              <h3 className="font-bold text-lg">{urgencyConfig.label}</h3>
            </div>
            <p className="text-sm">{urgencyConfig.description}</p>
            <p className="text-sm mt-1 font-medium">{result.urgency_explanation}</p>
          </div>

          {/* Possible Conditions */}
          {result.possible_conditions.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-calm-900 mb-3">Possible Common Conditions</h3>
              <p className="text-xs text-calm-400 mb-3">
                These are general possibilities, NOT a diagnosis. Many conditions share similar symptoms.
              </p>
              <div className="flex flex-wrap gap-2">
                {result.possible_conditions.map((condition) => (
                  <span key={condition} className="badge badge-info">{condition}</span>
                ))}
              </div>
            </div>
          )}

          {/* Self-Care Tips */}
          {result.self_care_tips.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-calm-900 mb-3">Self-Care Suggestions</h3>
              <ul className="space-y-2">
                {result.self_care_tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-calm-700">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Red Flags */}
          {result.red_flags.length > 0 && (
            <div className="card border-orange-200 bg-orange-50">
              <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Warning Signs – Seek Immediate Care If:
              </h3>
              <ul className="space-y-2">
                {result.red_flags.map((flag, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-orange-800">
                    <span className="text-orange-500 font-bold">•</span>
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-calm-400 text-center px-4">{result.disclaimer}</p>
        </div>
      )}

      {/* Medical FAQ */}
      <div className="card">
        <button
          onClick={() => setShowFaq(!showFaq)}
          className="flex items-center justify-between w-full"
        >
          <h2 className="font-semibold text-calm-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-500" />
            Medical FAQ
          </h2>
          {showFaq ? <ChevronUp className="w-4 h-4 text-calm-400" /> : <ChevronDown className="w-4 h-4 text-calm-400" />}
        </button>

        {showFaq && (
          <div className="mt-4 space-y-4 animate-fade-in">
            <div className="flex gap-2">
              <input
                value={faqQuestion}
                onChange={(e) => setFaqQuestion(e.target.value)}
                placeholder="Ask a health question..."
                className="input flex-1"
                onKeyDown={(e) => e.key === "Enter" && faqQuestion && askFaq(faqQuestion)}
              />
              <button
                onClick={() => faqQuestion && askFaq(faqQuestion)}
                disabled={!faqQuestion || isFaqLoading}
                className="btn-primary"
              >
                {isFaqLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ask"}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {FAQ_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => askFaq(q)}
                  className="text-xs px-3 py-1.5 bg-calm-100 hover:bg-calm-200 text-calm-700 rounded-full transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {faqAnswer && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 animate-fade-in">
                <p className="text-sm font-medium text-blue-900 mb-2">{faqQuestion}</p>
                <p className="text-sm text-blue-800 leading-relaxed">{faqAnswer}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
