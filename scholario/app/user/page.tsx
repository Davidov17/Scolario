"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";

const SHEET_ID = "1V71nSZuWQ6C-cJeEiu7yROCXZeEExwAcbqe9NUANaIU";

type Profile = {
  firstName: string;
  lastName: string;
  country: string;
  major: string;
  gpa: string;
  ielts: string;
  fundingType: string;
  degreeLevel: string;
};

type Scholarship = {
  id: number;
  title: string;
  country: string;
  degree: string;
  deadline: string;
  funding: string;
  link: string;
};

async function fetchScholarships(): Promise<Scholarship[]> {
  try {
    const res = await fetch(
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`,
      { cache: "no-store" }
    );
    const text = await res.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows || [];
    return rows
      .map((row: any) => ({
        title: row.c?.[0]?.v || "",
        country: row.c?.[1]?.v || "",
        degree: row.c?.[2]?.v || "",
        funding: row.c?.[3]?.v || "",
        deadline: row.c?.[4]?.v || "",
        link: row.c?.[5]?.v || "",
      }))
      .filter((s: any) => s.title)
      .map((item: any, index: number) => ({ ...item, id: index + 1 }));
  } catch {
    return [];
  }
}

function matchScholarships(scholarships: Scholarship[], profile: Profile): Scholarship[] {
  return scholarships.filter((s) => {
    const fundingMatch =
      !profile.fundingType ||
      s.funding?.toLowerCase().includes(profile.fundingType.toLowerCase());
    return fundingMatch;
  });
}

export default function UserPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ firstName: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(stored));

    const storedProfile = localStorage.getItem("scholarioProfile");
    const parsedProfile: Profile | null = storedProfile ? JSON.parse(storedProfile) : null;
    setProfile(parsedProfile);

    fetchScholarships().then((all) => {
      const matched = parsedProfile ? matchScholarships(all, parsedProfile) : all.slice(0, 6);
      setMatches(matched);
      setLoading(false);
    });
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {[
              { label: "Matched Scholarships", value: loading ? "—" : String(matches.length), accent: true },
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
              className="group bg-slate-900 hover:bg-slate-800 text-white rounded-2xl p-6 shadow-sm transition-colors"
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
                    className="inline-block bg-slate-900 hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  >
                    Update your profile →
                  </Link>
                </div>
              )}

              {!loading && matches.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matches.map((s) => (
                    <div
                      key={s.id}
                      className="border border-slate-200 rounded-2xl p-5 flex flex-col hover:shadow-md hover:border-slate-300 transition-all bg-white"
                    >
                      <span className="inline-block px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3 self-start">
                        {s.degree || "Scholarship"}
                      </span>
                      <h3 className="font-bold text-slate-900 mb-3 leading-snug text-sm">{s.title}</h3>
                      <div className="space-y-1.5 flex-1 mb-4">
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
                      <Link
                        href={`/scholarships/${s.id}`}
                        className="block text-center bg-slate-900 hover:bg-slate-700 text-white py-2 rounded-xl text-xs font-semibold transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
