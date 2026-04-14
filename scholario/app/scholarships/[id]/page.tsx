"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Link from "next/link";
import { getScholarshipById, getBookmarks, toggleBookmark, getApplication, updateApplication, deleteApplication } from "../../../lib/api";
import type { Scholarship, AppStatus, Application } from "../../../lib/api";

// ─── Structured requirements display ──────────────────────────────────────
interface Requirements {
  age?: { enabled: boolean; min: number; max: number };
  educationLevel?: { enabled: boolean; levels: string[] };
  languageCertificates?: { enabled: boolean; items: { name: string; minScore: string }[] };
  personalEssay?: boolean;
  recommendationLetters?: { enabled: boolean; count: number };
  motivationLetter?: boolean;
  cv?: boolean;
  portfolio?: boolean;
  notes?: string;
}

function RequirementBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold">
      {children}
    </span>
  );
}

function StructuredRequirements({ reqs }: { reqs: Requirements | string }) {
  if (!reqs) return null;

  // Legacy string format
  if (typeof reqs === "string") {
    return <p className="text-sm text-slate-800 whitespace-pre-line">{reqs}</p>;
  }

  const items: React.ReactNode[] = [];

  if (reqs.age?.enabled) {
    const { min, max } = reqs.age;
    const label = min && max ? `Age ${min}–${max}` : min ? `Age ${min}+` : max ? `Age up to ${max}` : "Age requirement";
    items.push(<RequirementBadge key="age">🎂 {label}</RequirementBadge>);
  }

  if (reqs.educationLevel?.enabled && reqs.educationLevel.levels.length > 0) {
    reqs.educationLevel.levels.forEach((l) =>
      items.push(<RequirementBadge key={`edu-${l}`}>🎓 {l}</RequirementBadge>)
    );
  }

  if (reqs.languageCertificates?.enabled && reqs.languageCertificates.items.length > 0) {
    reqs.languageCertificates.items.forEach((c, i) =>
      items.push(
        <RequirementBadge key={`cert-${i}`}>
          🌐 {c.name}{c.minScore ? ` ≥ ${c.minScore}` : ""}
        </RequirementBadge>
      )
    );
  }

  if (reqs.personalEssay) items.push(<RequirementBadge key="essay">✍️ Personal Essay</RequirementBadge>);
  if (reqs.motivationLetter) items.push(<RequirementBadge key="motiv">📝 Motivation Letter</RequirementBadge>);
  if (reqs.cv) items.push(<RequirementBadge key="cv">📄 CV / Resume</RequirementBadge>);
  if (reqs.portfolio) items.push(<RequirementBadge key="port">🎨 Portfolio</RequirementBadge>);

  if (reqs.recommendationLetters?.enabled) {
    const count = reqs.recommendationLetters.count;
    items.push(
      <RequirementBadge key="rec">
        📬 {count} Recommendation Letter{count !== 1 ? "s" : ""}
      </RequirementBadge>
    );
  }

  if (items.length === 0 && !reqs.notes) return null;

  return (
    <div className="space-y-3">
      {items.length > 0 && <div className="flex flex-wrap gap-2">{items}</div>}
      {reqs.notes && <p className="text-sm text-slate-600">{reqs.notes}</p>}
    </div>
  );
}

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Scholarship | null | undefined>(undefined);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [appStatus, setAppStatus] = useState<AppStatus>("saved");
  const [appNotes, setAppNotes] = useState("");
  const [appSaving, setAppSaving] = useState(false);
  const [appSaved, setAppSaved] = useState(false);

  useEffect(() => {
    getScholarshipById(id).then(setData);

    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      getBookmarks(token).then((bookmarks) => {
        setBookmarked(bookmarks.some((b) => b._id === id));
      });
      getApplication(token, id).then((app) => {
        if (app) {
          setApplication(app);
          setAppStatus(app.status);
          setAppNotes(app.notes || "");
        }
      });
    }
  }, [id]);

  async function handleBookmark() {
    const token = localStorage.getItem("token");
    if (!token) return;
    setBookmarkLoading(true);
    const result = await toggleBookmark(token, id);
    if (result !== null) setBookmarked(result);
    setBookmarkLoading(false);
  }

  async function handleSaveApplication() {
    const token = localStorage.getItem("token");
    if (!token) return;
    setAppSaving(true);
    const result = await updateApplication(token, id, appStatus, appNotes);
    if (result) {
      setApplication(result);
      setAppSaved(true);
      setTimeout(() => setAppSaved(false), 2000);
    }
    setAppSaving(false);
  }

  async function handleRemoveApplication() {
    const token = localStorage.getItem("token");
    if (!token) return;
    await deleteApplication(token, id);
    setApplication(null);
    setAppStatus("saved");
    setAppNotes("");
  }

  if (data === undefined) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="inline-block w-7 h-7 border-[3px] border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
        </main>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-slate-50 flex items-center justify-center px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Scholarship not found</h1>
            <p className="text-slate-500 mb-8">This scholarship may have been removed or the link is incorrect.</p>
            <Link
              href="/scholarships"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              ← Back to Scholarships
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative text-white py-14 px-8 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-slate-900/82" />
        <div className="relative max-w-4xl mx-auto">
          <Link
            href="/scholarships"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
          >
            ← Back to Scholarships
          </Link>
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-4">
            {data.degreeLevel || "Scholarship"}
          </span>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-snug flex-1">{data.title}</h1>
            {isLoggedIn && (
              <button
                onClick={handleBookmark}
                disabled={bookmarkLoading}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all shrink-0 ${
                  bookmarked
                    ? "bg-amber-500 border-amber-400 text-white hover:bg-amber-600"
                    : "bg-white/10 border-white/25 text-white hover:bg-white/20"
                }`}
              >
                <svg className="w-4 h-4" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z" />
                </svg>
                {bookmarked ? "Bookmarked" : "Bookmark"}
              </button>
            )}
          </div>
        </div>
      </section>

      <main className="bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-8 py-12">

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Country", value: data.country || "—" },
              { label: "Deadline", value: data.deadline || "—" },
              { label: "Funding", value: data.funding || "—" },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-2xl p-5 border border-slate-200 text-center shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">{item.label}</p>
                <p className="text-lg font-bold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Details card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Scholarship Details</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                { label: "Title", value: data.title },
                { label: "Country", value: data.country || "Not specified" },
                { label: "Degree Level", value: data.degreeLevel || "Not specified" },
                { label: "Deadline", value: data.deadline || "Not specified" },
                { label: "Funding Type", value: data.funding || "Not specified" },
                ...(data.description ? [{ label: "Description", value: data.description }] : []),
              ].map((row) => (
                <div key={row.label} className="flex items-start gap-6 px-8 py-4">
                  <span className="text-sm font-semibold text-slate-400 w-32 shrink-0 pt-0.5">{row.label}</span>
                  <span className="text-sm text-slate-800">{row.value}</span>
                </div>
              ))}
              {data.requirements && (
                <div className="flex items-start gap-6 px-8 py-4">
                  <span className="text-sm font-semibold text-slate-400 w-32 shrink-0 pt-0.5">Requirements</span>
                  <div className="flex-1">
                    <StructuredRequirements reqs={data.requirements as unknown as Requirements} />
                  </div>
                </div>
              )}
            </div>
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center gap-4 flex-wrap">
              {data.link ? (
                <a
                  href={data.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-3 rounded-xl font-semibold shadow-sm hover:shadow-indigo-500/20 hover:shadow-md transition-all"
                >
                  Apply Now →
                </a>
              ) : (
                <button
                  disabled
                  className="inline-block bg-slate-200 text-slate-400 px-7 py-3 rounded-xl font-medium cursor-not-allowed"
                >
                  No Application Link
                </button>
              )}
              {!isLoggedIn && (
                <Link href="/login" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                  Sign in to bookmark →
                </Link>
              )}
            </div>
          </div>

          {/* Application Tracker */}
          {isLoggedIn && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6">
              <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Application Tracker</h2>
                  <p className="text-slate-400 text-sm mt-0.5">Track your progress with this scholarship</p>
                </div>
                {application && (
                  <button
                    onClick={handleRemoveApplication}
                    className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                  >
                    Remove tracking
                  </button>
                )}
              </div>
              <div className="px-8 py-6 space-y-5">
                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                  <div className="flex flex-wrap gap-2">
                    {(["saved", "applied", "pending", "accepted", "rejected"] as AppStatus[]).map((s) => {
                      const colors: Record<AppStatus, string> = {
                        saved: "bg-slate-100 text-slate-600 border-slate-200",
                        applied: "bg-blue-100 text-blue-700 border-blue-200",
                        pending: "bg-amber-100 text-amber-700 border-amber-200",
                        accepted: "bg-emerald-100 text-emerald-700 border-emerald-200",
                        rejected: "bg-red-100 text-red-700 border-red-200",
                      };
                      const activeColors: Record<AppStatus, string> = {
                        saved: "bg-slate-700 text-white border-slate-700",
                        applied: "bg-blue-600 text-white border-blue-600",
                        pending: "bg-amber-500 text-white border-amber-500",
                        accepted: "bg-emerald-600 text-white border-emerald-600",
                        rejected: "bg-red-500 text-white border-red-500",
                      };
                      return (
                        <button
                          key={s}
                          onClick={() => setAppStatus(s)}
                          className={`px-4 py-1.5 rounded-full text-sm font-semibold border capitalize transition-all ${
                            appStatus === s ? activeColors[s] : colors[s]
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
                  <textarea
                    value={appNotes}
                    onChange={(e) => setAppNotes(e.target.value)}
                    placeholder="Add any notes about your application…"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
                <button
                  onClick={handleSaveApplication}
                  disabled={appSaving}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {appSaving ? "Saving…" : appSaved ? "Saved!" : "Save Status"}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
