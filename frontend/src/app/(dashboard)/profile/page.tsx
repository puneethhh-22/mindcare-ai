"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Shield, Bell, Save, Loader2, Heart } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

const profileSchema = z.object({
  full_name: z.string().min(2).optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  age: z.number().min(1).max(120).optional().or(z.literal("")),
  gender: z.string().optional(),
  height_cm: z.number().min(50).max(300).optional().or(z.literal("")),
  weight_kg: z.number().min(10).max(500).optional().or(z.literal("")),
  blood_type: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"personal" | "health" | "privacy">("personal");

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || "",
      timezone: user?.timezone || "UTC",
      language: user?.language || "en",
      age: user?.health_profile?.age || "",
      gender: user?.health_profile?.gender || "",
      height_cm: user?.health_profile?.height_cm || "",
      weight_kg: user?.health_profile?.weight_kg || "",
      blood_type: user?.health_profile?.blood_type || "",
      emergency_contact_name: user?.health_profile?.emergency_contact_name || "",
      emergency_contact_phone: user?.health_profile?.emergency_contact_phone || "",
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    setIsSubmitting(true);
    try {
      const updated = await authApi.updateProfile({
        full_name: data.full_name,
        timezone: data.timezone,
        language: data.language,
        health_profile: {
          age: data.age ? Number(data.age) : undefined,
          gender: data.gender,
          height_cm: data.height_cm ? Number(data.height_cm) : undefined,
          weight_kg: data.weight_kg ? Number(data.weight_kg) : undefined,
          blood_type: data.blood_type,
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_phone: data.emergency_contact_phone,
          allergies: user?.health_profile?.allergies || [],
          chronic_conditions: user?.health_profile?.chronic_conditions || [],
        },
      } as any);
      setUser(updated);
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "health",   label: "Health Profile", icon: Heart },
    { id: "privacy",  label: "Privacy & Security", icon: Shield },
  ] as const;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-calm-900 flex items-center gap-2">
          <User className="w-6 h-6 text-primary-600" />
          Profile Settings
        </h1>
        <p className="text-calm-500 mt-1">Manage your account and health information</p>
      </div>

      {/* Avatar */}
      <div className="card flex items-center gap-4">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-bold text-primary-700">
            {user?.full_name?.[0] || user?.username?.[0] || "U"}
          </span>
        </div>
        <div>
          <h2 className="font-semibold text-calm-900">{user?.full_name || user?.username}</h2>
          <p className="text-sm text-calm-500">{user?.email}</p>
          <p className="text-xs text-calm-400 mt-0.5">
            Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-calm-100 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
              activeTab === tab.id ? "bg-white text-calm-900 shadow-card" : "text-calm-500 hover:text-calm-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Personal Info */}
        {activeTab === "personal" && (
          <div className="card space-y-4">
            <h2 className="font-semibold text-calm-900">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input {...register("full_name")} className="input" placeholder="Your full name" />
              </div>
              <div>
                <label className="label">Username</label>
                <input value={user?.username || ""} disabled className="input opacity-60 cursor-not-allowed" />
              </div>
              <div>
                <label className="label">Email</label>
                <input value={user?.email || ""} disabled className="input opacity-60 cursor-not-allowed" />
              </div>
              <div>
                <label className="label">Timezone</label>
                <select {...register("timezone")} className="input">
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Asia/Kolkata">India</option>
                </select>
              </div>
              <div>
                <label className="label">Language</label>
                <select {...register("language")} className="input">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="pt">Portuguese</option>
                  <option value="ar">Arabic</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Health Profile */}
        {activeTab === "health" && (
          <div className="card space-y-4">
            <h2 className="font-semibold text-calm-900">Health Profile</h2>
            <p className="text-xs text-calm-400">
              This information helps personalize your symptom analysis and wellness recommendations.
              It is stored securely and never shared.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Age</label>
                <input {...register("age", { valueAsNumber: true })} type="number" className="input" placeholder="Your age" />
              </div>
              <div>
                <label className="label">Gender</label>
                <select {...register("gender")} className="input">
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Height (cm)</label>
                <input {...register("height_cm", { valueAsNumber: true })} type="number" className="input" placeholder="e.g., 170" />
              </div>
              <div>
                <label className="label">Weight (kg)</label>
                <input {...register("weight_kg", { valueAsNumber: true })} type="number" className="input" placeholder="e.g., 70" />
              </div>
              <div>
                <label className="label">Blood Type</label>
                <select {...register("blood_type")} className="input">
                  <option value="">Unknown</option>
                  {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="border-t border-calm-200 pt-4">
              <h3 className="font-medium text-calm-900 mb-3">Emergency Contact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Contact Name</label>
                  <input {...register("emergency_contact_name")} className="input" placeholder="Full name" />
                </div>
                <div>
                  <label className="label">Contact Phone</label>
                  <input {...register("emergency_contact_phone")} className="input" placeholder="+1 (555) 000-0000" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy */}
        {activeTab === "privacy" && (
          <div className="card space-y-4">
            <h2 className="font-semibold text-calm-900">Privacy & Security</h2>
            <div className="space-y-3">
              {[
                { title: "Data Encryption", desc: "All your health data is encrypted at rest using AES-256.", status: "Active" },
                { title: "Secure Transmission", desc: "All data is transmitted over HTTPS/TLS.", status: "Active" },
                { title: "No Data Selling", desc: "Your personal health data is never sold to third parties.", status: "Guaranteed" },
                { title: "HIPAA-Inspired Practices", desc: "We follow HIPAA-inspired data handling practices.", status: "Active" },
                { title: "GDPR Compliance", desc: "You can request data export or deletion at any time.", status: "Active" },
              ].map((item) => (
                <div key={item.title} className="flex items-start justify-between p-4 bg-calm-50 rounded-xl">
                  <div>
                    <p className="font-medium text-calm-900 text-sm">{item.title}</p>
                    <p className="text-xs text-calm-500 mt-0.5">{item.desc}</p>
                  </div>
                  <span className="badge badge-success flex-shrink-0 ml-3">{item.status}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-calm-200 pt-4">
              <p className="text-xs text-calm-400">
                For data export or deletion requests, contact privacy@mindcare.ai
              </p>
            </div>
          </div>
        )}

        {activeTab !== "privacy" && (
          <div className="mt-4">
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
