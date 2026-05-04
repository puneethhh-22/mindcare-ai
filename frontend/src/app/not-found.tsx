import Link from "next/link";
import { Heart, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-calm-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Heart className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-4xl font-bold text-calm-900 mb-2">404</h1>
        <p className="text-calm-500 mb-6">This page doesn't exist.</p>
        <Link href="/" className="btn-primary">
          <Home className="w-4 h-4" />
          Go Home
        </Link>
      </div>
    </div>
  );
}
