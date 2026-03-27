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
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_]).{8,}$/;
    return regex.test(password);
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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isStrongPassword(formData.password)) {
      setError(
        "Use 8+ characters with uppercase, lowercase, number, and symbol."
      );
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

    // SUCCESS
    setSuccess("Account created successfully!");

    setTimeout(() => {
      router.push("/profile");
    }, 1000);

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreed: false,
    });
  }

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 px-6 py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">

          {/* LEFT SIDE */}
          <div>
            <span className="inline-block px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-4">
              Join Scholario
            </span>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Create your account and start finding scholarships smarter.
            </h1>

            <p className="text-gray-600 text-lg mb-6">
              Build your student profile, discover funding opportunities, and
              track your scholarship journey in one place.
            </p>

            <div className="space-y-4 text-gray-700">
              <div className="bg-white rounded-2xl p-4 shadow-sm border">
                Personalized scholarship matches
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border">
                Organized deadlines and requirements
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border">
                Clean and simple student dashboard
              </div>
            </div>
          </div>

          {/* RIGHT SIDE FORM */}
          <div className="w-full bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-gray-100">
            <h2 className="text-3xl font-bold mb-2 text-center">
              Create Account
            </h2>

            <p className="text-gray-500 text-center mb-6">
              Start your scholarship journey today
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>

              {/* NAME */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* EMAIL */}
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
              />

              {/* PASSWORD */}
              <div>
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

                {/* PASSWORD HINT */}
                <p
                  className={`text-xs mt-2 ${
                    isStrongPassword(formData.password)
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {isStrongPassword(formData.password)
                    ? "Strong password ✓"
                    : "Use 8+ characters with uppercase, lowercase, number, and symbol"}
                </p>

                {/* STRENGTH BAR */}
                <div className="mt-2">
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        passwordStrength <= 2
                          ? "bg-red-500 w-1/3"
                          : passwordStrength <= 4
                          ? "bg-yellow-500 w-2/3"
                          : "bg-green-500 w-full"
                      }`}
                    ></div>
                  </div>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-indigo-600"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              {/* CHECKBOX */}
              <label className="flex items-start gap-3 text-sm text-gray-600">
                <input
                  type="checkbox"
                  name="agreed"
                  checked={formData.agreed}
                  onChange={handleChange}
                  className="mt-1"
                />
                <span>
                  I agree to the terms and conditions and privacy policy.
                </span>
              </label>

              {/* ERROR */}
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              {/* SUCCESS */}
              {success && (
                <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  {success}
                </p>
              )}

              {/* BUTTON */}
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl shadow-md hover:shadow-lg transition"
              >
                Create Account
              </button>
            </form>

            <p className="text-sm text-gray-500 text-center mt-6">
              Already have an account?{" "}
              <Link href="/" className="text-indigo-600 hover:underline">
                Go home
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}