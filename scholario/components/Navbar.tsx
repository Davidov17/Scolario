"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{ firstName: string; email: string; isAdmin?: boolean } | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const profile = localStorage.getItem("scholarioProfile");
    if (profile) {
      const p = JSON.parse(profile);
      if (p.firstName) setProfileName(p.firstName);
    }

    const onStorage = () => {
      const s = localStorage.getItem("user");
      setUser(s ? JSON.parse(s) : null);
      const prof = localStorage.getItem("scholarioProfile");
      if (prof) {
        const p = JSON.parse(prof);
        setProfileName(p.firstName || null);
      } else {
        setProfileName(null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function handleLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    router.push("/");
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm tracking-tight">S</span>
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">Scholario</span>
        </Link>

        {/* Nav */}
        <div className="flex items-center gap-1 text-sm font-medium">
          <Link href="/" className="px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
            Home
          </Link>
          <Link href="/scholarships" className="px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
            Scholarships
          </Link>

          {user ? (
            <>
              <Link
                href="/user"
                className="px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-semibold"
              >
                Hi, {profileName || user.firstName}
              </Link>
              {user.isAdmin && (
                <Link
                  href="/admin"
                  className="px-3 py-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="ml-1 px-4 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/signup" className="px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                Sign Up
              </Link>
              <Link
                href="/login"
                className="ml-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Log In
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
