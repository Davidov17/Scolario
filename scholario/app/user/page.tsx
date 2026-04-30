"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { getScholarships, getProfile, getBookmarks, getApplications } from "../../lib/api";
import type { Scholarship, Application } from "../../lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type Profile = {
  firstName: string;
  lastName: string;
  country: string;
  major: string;
  gpa: string;
  ielts: string;
  fundingType: string;
  degreeLevel: string;
  languages?: { language: string; proficiency: string; certificate: string; score: string }[];
};

type ScoredScholarship = Scholarship & { matchScore: number; matchReasons: string[] };

// Language requirements by country (what language proficiency is typically needed)
const COUNTRY_LANGUAGES: Record<string, string> = {
  germany: "german", france: "french", spain: "spanish", italy: "italian",
  china: "chinese", japan: "japanese", "south korea": "korean", turkey: "turkish",
  russia: "russian", "saudi arabia": "arabic", "united arab emirates": "arabic",
  jordan: "arabic", egypt: "arabic", morocco: "arabic",
};

function scoreScholarship(s: Scholarship, profile: Profile): ScoredScholarship {
  let score = 0;
  const reasons: string[] = [];

  // 1. Degree level match (strong signal — 40pts)
  if (profile.degreeLevel && s.degreeLevel) {
    const profileDeg = profile.degreeLevel.toLowerCase();
    const scholarshipDeg = s.degreeLevel.toLowerCase();
    if (
      scholarshipDeg.includes(profileDeg) ||
      profileDeg.includes(scholarshipDeg) ||
      (profileDeg.includes("bachelor") && scholarshipDeg.includes("bachelor")) ||
      (profileDeg.includes("master") && scholarshipDeg.includes("master"))
    ) {
      score += 40;
      reasons.push("Degree level matches");
    }
  }

  // 2. Funding type match (strong signal — 30pts)
  if (profile.fundingType && s.funding) {
    const pFunding = profile.fundingType.toLowerCase();
    const sFunding = s.funding.toLowerCase();
    if (sFunding.includes(pFunding) || sFunding.includes("full")) {
      score += 30;
      reasons.push("Funding type matches");
    }
  }

  // 3. Language proficiency match (15pts)
  if (profile.languages?.length) {
    const countryKey = s.country?.toLowerCase();
    const requiredLang = COUNTRY_LANGUAGES[countryKey] || "english";
    const hasLang = profile.languages.some(
      (l) => l.language.toLowerCase() === requiredLang && l.score
    );
    if (hasLang) {
      score += 15;
      reasons.push("Language proficiency available");
    } else if (profile.languages.some((l) => l.language.toLowerCase() === "english" && l.score)) {
      // English is a universal plus
      score += 8;
      reasons.push("English proficiency available");
    }
  }

  // 4. GPA check (15pts) — reward high GPA (3.0+ / 75%+)
  if (profile.gpa) {
    const gpa = parseFloat(profile.gpa);
    if (!isNaN(gpa)) {
      if (gpa >= 3.5 || (gpa >= 85 && gpa <= 100)) {
        score += 15;
        reasons.push("Strong GPA");
      } else if (gpa >= 3.0 || (gpa >= 75 && gpa <= 100)) {
        score += 8;
        reasons.push("Good GPA");
      }
    }
  }

  // If no profile criteria matched at all, give a base score so all show
  if (score === 0) score = 1;

  return { ...s, matchScore: score, matchReasons: reasons };
}

function matchScholarships(scholarships: Scholarship[], profile: Profile): ScoredScholarship[] {
  return scholarships
    .map((s) => scoreScholarship(s, profile))
    .sort((a, b) => b.matchScore - a.matchScore);
}

export default function UserPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ firstName: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<ScoredScholarship[]>([]);
  const [bookmarks, setBookmarks] = useState<Scholarship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [notifDays, setNotifDays] = useState(7);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifMsg, setNotifMsg] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(stored));

    async function loadData(token: string | null) {
      // Try backend profile first, then fall back to localStorage
      let parsedProfile: Profile | null = null;
      if (token) {
        const remote = await getProfile(token);
        if (remote) {
          parsedProfile = remote as unknown as Profile;
        }
      }
      if (!parsedProfile) {
        const storedProfile = localStorage.getItem("scholarioProfile");
        parsedProfile = storedProfile ? JSON.parse(storedProfile) : null;
      }
      setProfile(parsedProfile);

      const all = await getScholarships();
      const matched = parsedProfile
        ? matchScholarships(all, parsedProfile)
        : all.slice(0, 6).map((s) => ({ ...s, matchScore: 0, matchReasons: [] }));
      setMatches(matched);
      setLoading(false);
    }

    const token = localStorage.getItem("token");
    loadData(token);
    if (token) {
      getBookmarks(token).then(setBookmarks);
      getApplications(token).then(setApplications);
      fetch(`${API}/notifications/prefs`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => { setNotifEnabled(d.emailEnabled ?? true); setNotifDays(d.daysBeforeDeadline ?? 7); })
        .catch(() => {});
    }
  }, [router]);

  if (!user) return null;

  const displayName = profile?.firstName || user.firstName;

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative text-white py-12 px-8 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?auto=format&fit=crop&w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-slate-900/80" />
        <div className="relative max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-slate-400 text-sm mb-1">Hi, {displayName} 👋</p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{displayName}&apos;s Dashboard</h1>
            <p className="text-slate-500 mt-1 text-sm">{user.email}</p>
          </div>
          <Link
            href="/profile"
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            {profile ? "Update Profile" : "Complete Profile"}
          </Link>
        </div>
      </section>

      <main className="bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-12">

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
            {[
              { label: "Matched Scholarships", value: loading ? "—" : String(matches.length), accent: true },
              { label: "Bookmarked", value: String(bookmarks.length), accent: false },
              { label: "Funding Preference", value: profile?.fundingType || "Not set", accent: false },
              { label: "Degree Level", value: profile?.degreeLevel || "Not set", accent: false },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
                <p className={`text-3xl font-bold mb-1.5 ${stat.accent ? "text-indigo-600" : "text-slate-900"}`}>
                  {stat.value}
                </p>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-5 mb-10">
            <Link
              href="/scholarships"
              className="group bg-indigo-700 hover:bg-indigo-800 text-white rounded-2xl p-6 shadow-sm transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold mb-1">Browse Scholarships</h2>
                  <p className="text-slate-400 text-sm">Discover new opportunities</p>
                </div>
                <span className="text-xl text-slate-500 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
            <Link
              href="/profile"
              className="group bg-white hover:shadow-md rounded-2xl p-6 border border-slate-200 shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-1">
                    {profile ? "Update Profile" : "Complete Your Profile"}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    {profile ? "Refine your scholarship matches" : "Set preferences to get matches"}
                  </p>
                </div>
                <span className="text-xl text-indigo-500 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          </div>

          {/* Matched Scholarships */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {profile ? "Matched Scholarships" : "Suggested Scholarships"}
                </h2>
                {!profile && (
                  <p className="text-slate-400 text-sm mt-0.5">Complete your profile for personalized matches</p>
                )}
              </div>
              {!profile && (
                <Link href="/profile" className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold">
                  Complete profile →
                </Link>
              )}
            </div>

            <div className="p-6">
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block w-7 h-7 border-[3px] border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
                  <p className="text-slate-400 text-sm">Loading scholarships...</p>
                </div>
              )}

              {!loading && matches.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-400 mb-5">No matches found yet.</p>
                  <Link
                    href="/profile"
                    className="inline-block bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  >
                    Update your profile →
                  </Link>
                </div>
              )}

              {!loading && matches.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matches.map((s) => (
                    <div
                      key={s._id}
                      className="border border-slate-200 rounded-2xl p-5 flex flex-col hover:shadow-md hover:border-slate-300 transition-all bg-white"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                          {s.degreeLevel || "Scholarship"}
                        </span>
                        {profile && s.matchScore > 0 && (
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                            s.matchScore >= 70 ? "bg-emerald-100 text-emerald-700" :
                            s.matchScore >= 40 ? "bg-amber-100 text-amber-700" :
                            "bg-slate-100 text-slate-500"
                          }`}>
                            {s.matchScore >= 70 ? "Strong match" : s.matchScore >= 40 ? "Good match" : "Partial match"}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 mb-3 leading-snug text-sm">{s.title}</h3>
                      <div className="space-y-1.5 flex-1 mb-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Country</span>
                          <span className="font-medium text-slate-700">{s.country || "—"}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Funding</span>
                          <span className="font-medium text-slate-700">{s.funding || "—"}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Deadline</span>
                          <span className="font-medium text-slate-700">{s.deadline || "—"}</span>
                        </div>
                      </div>
                      {profile && s.matchReasons.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {s.matchReasons.map((r) => (
                            <span key={r} className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-medium">
                              {r}
                            </span>
                          ))}
                        </div>
                      )}
                      <Link
                        href={`/scholarships/${s._id}`}
                        className="block text-center bg-indigo-700 hover:bg-indigo-800 text-white py-2 rounded-xl text-xs font-semibold transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Application Tracking */}
          {applications.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">My Applications</h2>
                <p className="text-slate-400 text-sm mt-0.5">Scholarships you are tracking</p>
              </div>
              <div className="divide-y divide-slate-100">
                {applications.map((app) => {
                  const s = app.scholarshipId;
                  const statusColors: Record<string, string> = {
                    saved: "bg-slate-100 text-slate-600",
                    applied: "bg-blue-100 text-blue-700",
                    pending: "bg-amber-100 text-amber-700",
                    accepted: "bg-emerald-100 text-emerald-700",
                    rejected: "bg-red-100 text-red-600",
                  };
                  return (
                    <div key={app._id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{s.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{s.country} · {s.deadline || "No deadline"}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize shrink-0 ${statusColors[app.status] || "bg-slate-100 text-slate-600"}`}>
                        {app.status}
                      </span>
                      <Link
                        href={`/scholarships/${s._id}`}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold shrink-0"
                      >
                        View →
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Email Notifications */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Deadline Reminders</h2>
              <p className="text-slate-400 text-sm mt-0.5">Get email reminders before your bookmarked scholarships close</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Email notifications</span>
                <button
                  onClick={() => setNotifEnabled((v) => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${notifEnabled ? "bg-indigo-500" : "bg-slate-200"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifEnabled ? "translate-x-5" : ""}`} />
                </button>
              </div>
              {notifEnabled && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Remind me <strong>{notifDays} days</strong> before the deadline
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={30}
                    value={notifDays}
                    onChange={(e) => setNotifDays(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>1 day</span><span>30 days</span>
                  </div>
                </div>
              )}
              {notifMsg && <p className="text-sm text-emerald-600">{notifMsg}</p>}
              <div className="flex gap-3 flex-wrap">
                <button
                  disabled={notifSaving}
                  onClick={async () => {
                    const token = localStorage.getItem("token");
                    if (!token) return;
                    setNotifSaving(true);
                    await fetch(`${API}/notifications/prefs`, {
                      method: "PUT",
                      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                      body: JSON.stringify({ emailEnabled: notifEnabled, daysBeforeDeadline: notifDays }),
                    });
                    setNotifMsg("Preferences saved!");
                    setNotifSaving(false);
                    setTimeout(() => setNotifMsg(""), 2500);
                  }}
                  className="px-5 py-2 bg-indigo-700 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {notifSaving ? "Saving…" : "Save Preferences"}
                </button>
                {bookmarks.length > 0 && (
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem("token");
                      if (!token) return;
                      const res = await fetch(`${API}/notifications/send-reminders`, {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      const data = await res.json();
                      setNotifMsg(data.message + (data.previewUrl ? ` Preview: ${data.previewUrl}` : ""));
                      setTimeout(() => setNotifMsg(""), 8000);
                    }}
                    className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
                  >
                    Send Test Reminder
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bookmarked Scholarships */}
          {bookmarks.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Bookmarked Scholarships</h2>
                <p className="text-slate-400 text-sm mt-0.5">Scholarships you saved for later</p>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookmarks.map((s) => (
                    <div key={s._id} className="border border-slate-200 bg-white rounded-2xl p-5 flex flex-col hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                          {s.degreeLevel || "Scholarship"}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 mb-3 leading-snug text-sm">{s.title}</h3>
                      <div className="space-y-1.5 flex-1 mb-4">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Country</span>
                          <span className="font-medium text-slate-700">{s.country || "—"}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Deadline</span>
                          <span className="font-medium text-slate-700">{s.deadline || "—"}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Funding</span>
                          <span className="font-medium text-slate-700">{s.funding || "—"}</span>
                        </div>
                      </div>
                      <Link
                        href={`/scholarships/${s._id}`}
                        className="block text-center bg-indigo-700 hover:bg-indigo-800 text-white py-2 rounded-xl text-xs font-semibold transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
