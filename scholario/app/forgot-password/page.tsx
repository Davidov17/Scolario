"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setToken("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); return; }
      setMessage(data.message);
      if (data.token) setToken(data.token);
    } catch {
      setError("Network error. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Forgot Password</h1>
            <p className="text-slate-500 text-sm mb-6">Enter your email and we&apos;ll generate a reset token for you.</p>

            {!token ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="you@example.com"
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
                >
                  {loading ? "Generating…" : "Get Reset Token"}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">{message}</p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Your Reset Token</p>
                  <p className="font-mono text-xs text-slate-800 break-all">{token}</p>
                </div>
                <p className="text-xs text-slate-400">Copy the token above and use it on the reset password page. It expires in 1 hour.</p>
                <Link
                  href="/reset-password"
                  className="block text-center bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
                >
                  Reset Password →
                </Link>
              </div>
            )}

            <p className="text-center text-sm text-slate-400 mt-6">
              Remember your password?{" "}
              <Link href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">Log in</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
