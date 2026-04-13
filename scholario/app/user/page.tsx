"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";

export default function UserPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(stored));
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("user");
    router.push("/");
  }

  if (!user) return null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Dashboard</h1>
              <p className="text-gray-500 mt-1">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm transition"
            >
              Log Out
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border text-center">
              <p className="text-3xl font-bold text-indigo-600">0</p>
              <p className="text-gray-500 text-sm mt-1">Saved Scholarships</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border text-center">
              <p className="text-3xl font-bold text-indigo-600">0</p>
              <p className="text-gray-500 text-sm mt-1">Applications</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border text-center">
              <p className="text-3xl font-bold text-indigo-600">0</p>
              <p className="text-gray-500 text-sm mt-1">Deadlines Soon</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Link
              href="/scholarships"
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl p-6 shadow-sm transition"
            >
              <h2 className="text-xl font-semibold mb-1">Browse Scholarships</h2>
              <p className="text-indigo-200 text-sm">Discover new opportunities</p>
            </Link>
            <Link
              href="/profile"
              className="bg-white hover:shadow-md rounded-2xl p-6 shadow-sm border transition"
            >
              <h2 className="text-xl font-semibold mb-1">My Profile</h2>
              <p className="text-gray-500 text-sm">Update your academic info</p>
            </Link>
          </div>

          {/* Saved Scholarships */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Saved Scholarships</h2>
            <p className="text-gray-400 text-center py-8">
              No saved scholarships yet.{" "}
              <Link href="/scholarships" className="text-indigo-600 hover:underline">
                Browse scholarships
              </Link>{" "}
              to get started.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
