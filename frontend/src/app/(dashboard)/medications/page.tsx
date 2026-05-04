"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Pill,
  Plus,
  Check,
  X,
  Trash2,
  Clock,
  BarChart3,
  Loader2,
  Bell,
  BellOff,
} from "lucide-react";
import toast from "react-hot-toast";
import { medicationsApi } from "@/services/api";
import type { Medication, AdherenceStats } from "@/types";
import { clsx } from "clsx";

const medSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  times: z.string().optional(),
  instructions: z.string().optional(),
  color: z.string().default("#4F46E5"),
  reminder_enabled: z.boolean().default(true),
});

type MedForm = z.infer<typeof medSchema>;

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Once daily" },
  { value: "twice_daily", label: "Twice daily" },
  { value: "three_times_daily", label: "Three times daily" },
  { value: "weekly", label: "Weekly" },
  { value: "as_needed", label: "As needed" },
];

const MED_COLORS = [
  "#4F46E5", "#0D9488", "#DC2626", "#D97706",
  "#7C3AED", "#059669", "#2563EB", "#DB2777",
];

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [adherence, setAdherence] = useState<AdherenceStats[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "adherence">("list");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MedForm>({ resolver: zodResolver(medSchema), defaultValues: { color: "#4F46E5", reminder_enabled: true } });

  const selectedColor = watch("color");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [meds, stats] = await Promise.all([
        medicationsApi.list(),
        medicationsApi.getAdherence(),
      ]);
      setMedications(meds);
      setAdherence(stats);
    } catch {
      toast.error("Failed to load medications");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: MedForm) => {
    setIsSubmitting(true);
    try {
      const times = data.times
        ? data.times.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
      await medicationsApi.add({
        name: data.name,
        dosage: data.dosage,
        frequency: data.frequency,
        times,
        instructions: data.instructions,
        color: data.color,
        reminder_enabled: data.reminder_enabled,
      } as any);
      toast.success("Medication added!");
      reset();
      setShowForm(false);
      await loadData();
    } catch {
      toast.error("Failed to add medication");
    } finally {
      setIsSubmitting(false);
    }
  };

  const logMedication = async (medId: string, status: "taken" | "skipped") => {
    try {
      await medicationsApi.logTaken(medId, status);
      toast.success(status === "taken" ? "✅ Marked as taken!" : "⏭️ Marked as skipped");
      await loadData();
    } catch {
      toast.error("Failed to log medication");
    }
  };

  const deleteMedication = async (medId: string) => {
    try {
      await medicationsApi.delete(medId);
      toast.success("Medication removed");
      await loadData();
    } catch {
      toast.error("Failed to remove medication");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-calm-900 flex items-center gap-2">
            <Pill className="w-6 h-6 text-green-600" />
            Medications
          </h1>
          <p className="text-calm-500 mt-1">Track your medications and adherence</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          <Plus className="w-4 h-4" />
          Add Medication
        </button>
      </div>

      {/* Add Medication Form */}
      {showForm && (
        <div className="card animate-slide-up">
          <h2 className="font-semibold text-calm-900 mb-4">Add New Medication</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Medication Name *</label>
                <input {...register("name")} placeholder="e.g., Metformin" className={errors.name ? "input-error" : "input"} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="label">Dosage *</label>
                <input {...register("dosage")} placeholder="e.g., 500mg" className={errors.dosage ? "input-error" : "input"} />
                {errors.dosage && <p className="text-red-500 text-xs mt-1">{errors.dosage.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Frequency *</label>
                <select {...register("frequency")} className="input">
                  <option value="">Select frequency</option>
                  {FREQUENCY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {errors.frequency && <p className="text-red-500 text-xs mt-1">{errors.frequency.message}</p>}
              </div>
              <div>
                <label className="label">Reminder Times</label>
                <input {...register("times")} placeholder="e.g., 08:00, 20:00" className="input" />
                <p className="text-xs text-calm-400 mt-1">Comma-separated times (24h format)</p>
              </div>
            </div>

            <div>
              <label className="label">Instructions</label>
              <input {...register("instructions")} placeholder="e.g., Take with food" className="input" />
            </div>

            <div>
              <label className="label">Color Tag</label>
              <div className="flex gap-2 flex-wrap">
                {MED_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setValue("color", color)}
                    className={clsx(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      selectedColor === color ? "border-calm-900 scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" {...register("reminder_enabled")} id="reminder" className="w-4 h-4 accent-primary-600" />
              <label htmlFor="reminder" className="text-sm text-calm-700">Enable reminders</label>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Medication
              </button>
              <button type="button" onClick={() => { setShowForm(false); reset(); }} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-calm-100 p-1 rounded-xl w-fit">
        {(["list", "adherence"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
              activeTab === tab ? "bg-white text-calm-900 shadow-card" : "text-calm-500 hover:text-calm-700"
            )}
          >
            {tab === "list" ? "My Medications" : "Adherence"}
          </button>
        ))}
      </div>

      {/* Medication List */}
      {activeTab === "list" && (
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : medications.length === 0 ? (
            <div className="card text-center py-12">
              <Pill className="w-12 h-12 text-calm-300 mx-auto mb-3" />
              <p className="text-calm-500">No medications added yet.</p>
              <button onClick={() => setShowForm(true)} className="btn-primary mt-4 text-sm">
                <Plus className="w-4 h-4" /> Add Your First Medication
              </button>
            </div>
          ) : (
            medications.map((med) => (
              <div key={med.id} className="card flex items-center gap-4">
                <div
                  className="w-3 h-12 rounded-full flex-shrink-0"
                  style={{ backgroundColor: med.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-calm-900">{med.name}</h3>
                    <span className="badge badge-info">{med.dosage}</span>
                    {med.reminder_enabled ? (
                      <Bell className="w-3.5 h-3.5 text-calm-400" />
                    ) : (
                      <BellOff className="w-3.5 h-3.5 text-calm-300" />
                    )}
                  </div>
                  <p className="text-sm text-calm-500 capitalize">
                    {FREQUENCY_OPTIONS.find((o) => o.value === med.frequency)?.label || med.frequency}
                    {med.times.length > 0 && ` · ${med.times.join(", ")}`}
                  </p>
                  {med.instructions && (
                    <p className="text-xs text-calm-400 mt-0.5">{med.instructions}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => logMedication(med.id, "taken")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> Taken
                  </button>
                  <button
                    onClick={() => logMedication(med.id, "skipped")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-calm-100 text-calm-600 hover:bg-calm-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Skip
                  </button>
                  <button
                    onClick={() => deleteMedication(med.id)}
                    className="p-1.5 text-calm-400 hover:text-red-500 transition-colors"
                    aria-label="Delete medication"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Adherence Stats */}
      {activeTab === "adherence" && (
        <div className="space-y-4">
          {adherence.length === 0 ? (
            <div className="card text-center py-12">
              <BarChart3 className="w-12 h-12 text-calm-300 mx-auto mb-3" />
              <p className="text-calm-500">No adherence data yet. Start logging your medications!</p>
            </div>
          ) : (
            adherence.map((stat) => (
              <div key={stat.medication_id} className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-calm-900">{stat.medication_name}</h3>
                  <span className={clsx(
                    "badge",
                    stat.adherence_percentage >= 80 ? "badge-success" :
                    stat.adherence_percentage >= 50 ? "badge-warning" : "badge-danger"
                  )}>
                    {stat.adherence_percentage}% adherence
                  </span>
                </div>
                <div className="bg-calm-100 rounded-full h-2 mb-3">
                  <div
                    className={clsx(
                      "h-2 rounded-full transition-all",
                      stat.adherence_percentage >= 80 ? "bg-green-500" :
                      stat.adherence_percentage >= 50 ? "bg-yellow-500" : "bg-red-500"
                    )}
                    style={{ width: `${stat.adherence_percentage}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-green-600">{stat.taken}</p>
                    <p className="text-xs text-calm-400">Taken</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-yellow-600">{stat.skipped}</p>
                    <p className="text-xs text-calm-400">Skipped</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-red-600">{stat.missed}</p>
                    <p className="text-xs text-calm-400">Missed</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
