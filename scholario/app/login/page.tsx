"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

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
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed."); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/user");
    } catch {
      setError("Could not connect to server. Please try again.");
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 px-6 py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">

          {/* LEFT */}
          <div>
            <span className="inline-block px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-4">
              Welcome Back
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Log in to continue your scholarship journey.
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              Access your personalized matches, saved scholarships, and deadlines all in one place.
            </p>
            <div className="space-y-4 text-gray-700">
              <div className="bg-white rounded-2xl p-4 shadow-sm border">Personalized scholarship matches</div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border">Track deadlines and requirements</div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border">Your student dashboard</div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="w-full bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-gray-100">
            <h2 className="text-3xl font-bold mb-2 text-center">Log In</h2>
            <p className="text-gray-500 text-center mb-6">Enter your credentials to continue</p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600"
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
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl shadow-md hover:shadow-lg transition"
              >
                Log In
              </button>
            </form>

            <p className="text-sm text-gray-500 text-center mt-6">
              Don't have an account?{" "}
              <Link href="/signup" className="text-indigo-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
