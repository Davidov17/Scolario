"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;
    const user = JSON.parse(stored);
    if (user.isAdmin) router.replace("/admin");
    else router.replace("/user");
  }, [router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        // Unverified account — redirect to signup verification step
        if (data.needsVerification) {
          router.push(`/signup?verify=1&email=${encodeURIComponent(data.email || formData.email)}`);
          return;
        }
        setError(data.error || "Login failed.");
        return;
      }
      if (data.user.isAdmin) {
        setError("Admin accounts must sign in through the admin portal.");
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.removeItem("scholarioProfile");
      router.push("/user");
    } catch {
      setError("Could not connect to server. Please try again.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)" }}>

      {/* Soft background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />

      {/* Card */}
      <div className="relative w-full max-w-sm mx-4 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl px-8 py-10">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">Scholario</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 text-center mb-1">Welcome back</h1>
        <p className="text-slate-400 text-sm text-center mb-8">Sign in to your account</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:border-transparent placeholder:text-slate-300"
              style={{ "--tw-ring-color": "#667eea" } as React.CSSProperties}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:border-transparent placeholder:text-slate-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
              Forgot password?
            </Link>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-xl hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: "#667eea" }}>
            Sign up free
          </Link>
        </p>

        <div className="text-center mt-4">
          <Link href="/admin/login" className="text-xs text-slate-300 hover:text-slate-400 transition-colors">
            Admin portal →
          </Link>
        </div>
      </div>
    </main>
  );
}
