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
      if (!res.ok) { setError(data.error || "Login failed."); return; }
      if (data.user.isAdmin) {
        setError("Admin accounts must sign in through the admin portal.");
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/user");
    } catch {
      setError("Could not connect to server. Please try again.");
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 flex items-stretch">

        {/* Left photo panel */}
        <div className="hidden md:block md:w-1/2 relative">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80')" }}
          />
          <div className="absolute inset-0 bg-slate-900/65" />
          <div className="relative h-full flex flex-col justify-end p-12">
            <span className="inline-block px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white text-xs font-semibold uppercase tracking-widest mb-5">
              Welcome back
            </span>
            <h2 className="text-3xl font-bold text-white leading-tight mb-3">
              Your scholarship journey continues here.
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Access your personalized matches, saved scholarships, and deadlines all in one place.
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-16">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Log In</h2>
            <p className="text-slate-400 text-sm mb-8">Enter your credentials to continue</p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm"
              >
                Log In
              </button>
            </form>

            <div className="flex items-center justify-between mt-6 text-sm">
              <p className="text-slate-400">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-indigo-600 hover:text-indigo-800 font-semibold">
                  Sign up free
                </Link>
              </p>
              <Link href="/forgot-password" className="text-slate-400 hover:text-indigo-600 transition-colors">
                Forgot password?
              </Link>
            </div>

            <div className="border-t border-slate-100 mt-8 pt-5 text-center">
              <Link href="/admin/login" className="text-xs text-slate-300 hover:text-slate-500 transition-colors">
                Admin portal →
              </Link>
            </div>
          </div>
        </div>

      </main>
    </>
  );
}
