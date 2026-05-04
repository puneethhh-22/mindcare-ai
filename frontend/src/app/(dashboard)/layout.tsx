"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageCircle,
  Stethoscope,
  Pill,
  BarChart3,
  User,
  LogOut,
  Heart,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { clsx } from "clsx";

const navItems = [
  { label: "Dashboard",       href: "/dashboard",   icon: LayoutDashboard },
  { label: "Chat",            href: "/chat",         icon: MessageCircle },
  { label: "Symptom Checker", href: "/symptoms",     icon: Stethoscope },
  { label: "Medications",     href: "/medications",  icon: Pill },
  { label: "Wellness",        href: "/wellness",     icon: BarChart3 },
  { label: "Profile",         href: "/profile",      icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, fetchProfile } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!user) {
      fetchProfile();
    }
  }, [isAuthenticated, user, router, fetchProfile]);

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully");
    router.push("/login");
  };

  if (!isAuthenticated) return null;

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white border-r border-calm-200 w-64">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-calm-200">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Heart className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-calm-900">MindCare AI</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={clsx(
                isActive ? "sidebar-item-active" : "sidebar-item"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-calm-200">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-primary-700 font-semibold text-sm">
              {user?.full_name?.[0] || user?.username?.[0] || "U"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-calm-900 truncate">
              {user?.full_name || user?.username}
            </p>
            <p className="text-xs text-calm-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-calm-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 flex flex-col w-64">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-calm-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-calm-100"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-calm-600" />
          </button>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary-600" />
            <span className="font-bold text-calm-900">MindCare AI</span>
          </div>
          <div className="w-9" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
