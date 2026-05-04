"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Heart, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { authApi } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

const registerSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type RegisterForm = z.infer<typeof registerSchema>;

const benefits = [
  "AI-powered mental health support",
  "Symptom checker with urgency guidance",
  "Medication reminders & tracking",
  "Wellness dashboard & insights",
];

export default function RegisterPage() {
  const router = useRouter();
  const { setTokens, fetchProfile } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const tokens = await authApi.register({
        email: data.email,
        username: data.username,
        password: data.password,
        full_name: data.full_name,
      });
      setTokens(tokens);
      await fetchProfile();
      toast.success("Account created! Welcome to MindCare AI 🎉");
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left – Benefits */}
        <div className="hidden lg:block">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-calm-900">MindCare AI</span>
          </div>
          <h2 className="text-3xl font-bold text-calm-900 mb-4 leading-tight">
            Your health journey starts here
          </h2>
          <p className="text-calm-500 mb-8">
            Join thousands of users taking control of their mental and physical wellbeing
            with compassionate AI support.
          </p>
          <ul className="space-y-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3 text-calm-700">
                <CheckCircle2 className="w-5 h-5 text-primary-600 flex-shrink-0" />
                {b}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-xs text-calm-400">
            ⚠️ Not a replacement for professional medical advice.
          </p>
        </div>

        {/* Right – Form */}
        <div>
          <div className="text-center mb-6 lg:hidden">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 rounded-2xl mb-3">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-calm-900">Create your account</h1>
          </div>
          <div className="hidden lg:block mb-6">
            <h1 className="text-2xl font-bold text-calm-900">Create your account</h1>
            <p className="text-calm-500 mt-1">Free forever. No credit card required.</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name</label>
                  <input
                    {...register("full_name")}
                    placeholder="Jane Doe"
                    className={errors.full_name ? "input-error" : "input"}
                  />
                  {errors.full_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>
                  )}
                </div>
                <div>
                  <label className="label">Username</label>
                  <input
                    {...register("username")}
                    placeholder="janedoe"
                    className={errors.username ? "input-error" : "input"}
                  />
                  {errors.username && (
                    <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="label">Email address</label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className={errors.email ? "input-error" : "input"}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    className={`${errors.password ? "input-error" : "input"} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-calm-400 hover:text-calm-600"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="label">Confirm Password</label>
                <input
                  {...register("confirm_password")}
                  type="password"
                  placeholder="Repeat your password"
                  className={errors.confirm_password ? "input-error" : "input"}
                />
                {errors.confirm_password && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Free Account"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-calm-500 mt-5">
              Already have an account?{" "}
              <Link href="/login" className="text-primary-600 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
