"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function isStrongPassword(password: string) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_]).{8,}$/.test(password);
  }

  function getPasswordStrength(password: string) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&_]/.test(password)) score++;
    return score;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!isStrongPassword(formData.password)) {
      setError("Use 8+ characters with uppercase, lowercase, number, and symbol.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!formData.agreed) {
      setError("You must agree to the terms and conditions.");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Signup failed."); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch {
      setError("Could not connect to server. Please try again.");
      return;
    }

    setSuccess("Account created! Redirecting...");
    setTimeout(() => router.push("/profile"), 1000);
    setFormData({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "", agreed: false });
  }

  const passwordStrength = getPasswordStrength(formData.password);
  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400";

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 flex items-stretch">

        {/* Left photo panel */}
        <div className="hidden md:block md:w-1/2 relative">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1200&q=80')" }}
          />
          <div className="absolute inset-0 bg-slate-900/65" />
          <div className="relative h-full flex flex-col justify-end p-12">
            <span className="inline-block px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white text-xs font-semibold uppercase tracking-widest mb-5">
              Join Scholario
            </span>
            <h2 className="text-3xl font-bold text-white leading-tight mb-3">
              Find the scholarship that changes everything.
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Build your student profile and get matched with opportunities tailored to your goals.
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Create Account</h2>
            <p className="text-slate-400 text-sm mb-8">Start your scholarship journey today</p>

            <form className="space-y-4" onSubmit={handleSubmit}>

              <div className="grid grid-cols-2 gap-3">
                <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} className={inputClass} />
                <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className={inputClass} />
              </div>

              <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className={inputClass} />

              <div>
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
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {formData.password && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= passwordStrength
                              ? passwordStrength <= 2 ? "bg-red-400" : passwordStrength <= 4 ? "bg-amber-400" : "bg-emerald-500"
                              : "bg-slate-100"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ${isStrongPassword(formData.password) ? "text-emerald-600" : "text-slate-400"}`}>
                      {isStrongPassword(formData.password) ? "Strong password" : "Use 8+ chars with uppercase, lowercase, number & symbol"}
                    </p>
                  </div>
                )}
              </div>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              <label className="flex items-start gap-3 text-sm text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreed"
                  checked={formData.agreed}
                  onChange={handleChange}
                  className="mt-0.5 accent-indigo-600"
                />
                <span>I agree to the terms and conditions and privacy policy.</span>
              </label>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
              )}
              {success && (
                <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">{success}</p>
              )}

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm"
              >
                Create Account
              </button>
            </form>

            <p className="text-sm text-slate-400 text-center mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-600 hover:text-indigo-800 font-semibold">
                Log in
              </Link>
            </p>
          </div>
        </div>

      </main>
    </>
  );
}
