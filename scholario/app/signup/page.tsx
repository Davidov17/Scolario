"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Step 1: fill out the form. Step 2: enter the verification code.
  const [step, setStep] = useState<"form" | "verify">(
    searchParams.get("verify") === "1" ? "verify" : "form"
  );
  const [pendingEmail, setPendingEmail] = useState(searchParams.get("email") || "");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });

  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

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

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/signup`, {
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
      // Backend returns { needsVerification: true, email }
      setPendingEmail(data.email || formData.email);
      setStep("verify");
    } catch {
      setError("Could not connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (code.length !== 6) { setError("Please enter the 6-digit code."); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/verify-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Verification failed."); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setSuccess("Email verified! Redirecting…");
      setTimeout(() => router.push("/profile"), 1000);
    } catch {
      setError("Could not connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    try {
      await fetch(`${API}/auth/resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail }),
      });
      setSuccess("A new code has been sent to your email.");
    } catch {
      setError("Could not resend code.");
    }
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

        {/* Right panel */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">

            {step === "form" ? (
              <>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Create Account</h2>
                <p className="text-slate-600 text-sm mb-8">Start your scholarship journey today</p>

                <form className="space-y-4" onSubmit={handleSignup}>
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
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
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
                        <p className={`text-xs ${isStrongPassword(formData.password) ? "text-emerald-600" : "text-slate-500"}`}>
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
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
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

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm disabled:opacity-60"
                  >
                    {loading ? "Creating account…" : "Create Account"}
                  </button>
                </form>

                <p className="text-sm text-slate-600 text-center mt-6">
                  Already have an account?{" "}
                  <Link href="/login" className="text-blue-500 hover:text-blue-700 font-semibold">
                    Log in
                  </Link>
                </p>
              </>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">Check your email</h2>
                  <p className="text-slate-500 text-sm">
                    We sent a 6-digit code to<br />
                    <span className="font-semibold text-slate-700">{pendingEmail}</span>
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleVerify}>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Verification Code</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="123456"
                      className="w-full px-4 py-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-2xl font-bold tracking-[0.5em] text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
                  )}
                  {success && (
                    <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">{success}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || code.length !== 6}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm disabled:opacity-60"
                  >
                    {loading ? "Verifying…" : "Verify Email"}
                  </button>
                </form>

                <div className="text-center mt-6 space-y-2">
                  <p className="text-sm text-slate-500">
                    Didn&apos;t receive the code?{" "}
                    <button onClick={handleResend} className="text-indigo-600 font-semibold hover:text-indigo-800">
                      Resend
                    </button>
                  </p>
                  <button
                    onClick={() => { setStep("form"); setError(""); setCode(""); }}
                    className="text-sm text-slate-400 hover:text-slate-600"
                  >
                    ← Back to signup
                  </button>
                </div>
              </>
            )}

          </div>
        </div>

      </main>
    </>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
