"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function SettingsPage() {
  const router = useRouter();

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  // Notification prefs state
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [daysBeforeDeadline, setDaysBeforeDeadline] = useState(7);
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [prefsError, setPrefsError] = useState("");
  const [prefsSuccess, setPrefsSuccess] = useState("");
  const [prefsFetched, setPrefsFetched] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    fetch(`${API}/notifications/prefs`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setEmailEnabled(data.emailEnabled ?? true);
        setDaysBeforeDeadline(data.daysBeforeDeadline ?? 7);
        setPrefsFetched(true);
      })
      .catch(() => setPrefsFetched(true));
  }, [router]);

  function isStrongPassword(p: string) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_]).{8,}$/.test(p);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (!isStrongPassword(newPassword)) {
      setPwError("Use 8+ characters with uppercase, lowercase, number, and symbol.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    setPwLoading(true);
    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setPwError(data.error || "Failed to change password."); return; }
      setPwSuccess("Password changed! A confirmation email has been sent.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPwError("Network error. Please try again.");
    } finally {
      setPwLoading(false);
    }
  }

  async function handleSavePrefs(e: React.FormEvent) {
    e.preventDefault();
    setPrefsError("");
    setPrefsSuccess("");

    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    setPrefsLoading(true);
    try {
      const res = await fetch(`${API}/notifications/prefs`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ emailEnabled, daysBeforeDeadline }),
      });
      if (!res.ok) { setPrefsError("Failed to save preferences."); return; }
      setPrefsSuccess("Notification preferences saved.");
    } catch {
      setPrefsError("Network error. Please try again.");
    } finally {
      setPrefsLoading(false);
    }
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your password and notification preferences.</p>
          </div>

          {/* Change Password */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Change Password</h2>
            <p className="text-slate-500 text-sm mb-5">
              You'll receive a confirmation email after a successful change.
            </p>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  {showCurrent ? "Hide" : "Show"}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  {showNew ? "Hide" : "Show"}
                </button>
              </div>
              {newPassword && (
                <p className={`text-xs -mt-2 ${isStrongPassword(newPassword) ? "text-emerald-600" : "text-slate-400"}`}>
                  {isStrongPassword(newPassword) ? "Strong password" : "Use 8+ chars with uppercase, lowercase, number & symbol"}
                </p>
              )}

              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={inputClass}
              />

              {pwError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{pwError}</p>
              )}
              {pwSuccess && (
                <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">{pwSuccess}</p>
              )}

              <button
                type="submit"
                disabled={pwLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
              >
                {pwLoading ? "Changing…" : "Change Password"}
              </button>
            </form>
          </section>

          {/* Notification Preferences */}
          {prefsFetched && (
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-1">Email Notifications</h2>
              <p className="text-slate-500 text-sm mb-5">
                Get reminders before your bookmarked scholarship deadlines.
              </p>
              <form onSubmit={handleSavePrefs} className="space-y-5">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-slate-700">Enable deadline reminders</span>
                  <button
                    type="button"
                    onClick={() => setEmailEnabled((v) => !v)}
                    className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${
                      emailEnabled ? "bg-indigo-600" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        emailEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </label>

                {emailEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Remind me this many days before deadline
                    </label>
                    <select
                      value={daysBeforeDeadline}
                      onChange={(e) => setDaysBeforeDeadline(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {[1, 3, 7, 14, 30].map((d) => (
                        <option key={d} value={d}>
                          {d} {d === 1 ? "day" : "days"} before
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {prefsError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{prefsError}</p>
                )}
                {prefsSuccess && (
                  <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">{prefsSuccess}</p>
                )}

                <button
                  type="submit"
                  disabled={prefsLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
                >
                  {prefsLoading ? "Saving…" : "Save Preferences"}
                </button>
              </form>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
