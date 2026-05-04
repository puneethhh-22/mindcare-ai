import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "MindCare AI – Intelligent Healthcare & Wellness Assistant",
  description:
    "AI-powered mental health support, symptom checker, medication reminders, and wellness tracking. Not a replacement for professional medical advice.",
  keywords: ["mental health", "wellness", "AI chatbot", "symptom checker", "medication reminder"],
  authors: [{ name: "MindCare AI" }],
  openGraph: {
    title: "MindCare AI",
    description: "Your intelligent healthcare & wellness companion",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-calm-50 text-calm-900 antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1e293b",
              color: "#f8fafc",
              borderRadius: "12px",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
