"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";

const SHEET_ID = "1V71nSZuWQ6C-cJeEiu7yROCXZeEExwAcbqe9NUANaIU";

type Profile = {
  country: string;
  major: string;
  gpa: number;
  ielts: string;
  fundingType: string;
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
      .map((row: any, index: number) => ({
        id: index + 1,
        title: row.c?.[0]?.v || "",
        country: row.c?.[1]?.v || "",
        degree: row.c?.[2]?.v || "",
        deadline: row.c?.[3]?.v || "",
        funding: row.c?.[4]?.v || "",
        link: row.c?.[5]?.v || "",
      }))
      .filter((s: Scholarship) => s.title);
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
  const [user, setUser] = useState<{ email: string } | null>(null);
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

  function handleLogout() {
    localStorage.removeItem("user");
    router.push("/");
  }

  if (!user) return null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Dashboard</h1>
              <p className="text-gray-500 mt-1">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm transition"
            >
              Log Out
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border text-center">
              <p className="text-3xl font-bold text-indigo-600">{matches.length}</p>
              <p className="text-gray-500 text-sm mt-1">Matched Scholarships</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border text-center">
              <p className="text-3xl font-bold text-indigo-600">
                {profile?.fundingType || "—"}
              </p>
              <p className="text-gray-500 text-sm mt-1">Funding Preference</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border text-center">
              <p className="text-3xl font-bold text-indigo-600">
                {profile?.country || "—"}
              </p>
              <p className="text-gray-500 text-sm mt-1">Your Country</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Link
              href="/scholarships"
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl p-6 shadow-sm transition"
            >
              <h2 className="text-xl font-semibold mb-1">Browse All Scholarships</h2>
              <p className="text-indigo-200 text-sm">Discover new opportunities</p>
            </Link>
            <Link
              href="/profile"
              className="bg-white hover:shadow-md rounded-2xl p-6 shadow-sm border transition"
            >
              <h2 className="text-xl font-semibold mb-1">
                {profile ? "Update Profile" : "Complete Profile"}
              </h2>
              <p className="text-gray-500 text-sm">
                {profile ? "Refine your scholarship matches" : "Set your preferences to get matches"}
              </p>
            </Link>
          </div>

          {/* Matched Scholarships */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {profile ? "Matched Scholarships" : "Suggested Scholarships"}
              </h2>
              {!profile && (
                <Link href="/profile" className="text-sm text-indigo-600 hover:underline">
                  Complete profile for better matches →
                </Link>
              )}
            </div>

            {loading && (
              <p className="text-gray-400 text-center py-8">Loading scholarships...</p>
            )}

            {!loading && matches.length === 0 && (
              <p className="text-gray-400 text-center py-8">
                No matches found.{" "}
                <Link href="/profile" className="text-indigo-600 hover:underline">
                  Update your profile
                </Link>{" "}
                to see matches.
              </p>
            )}

            {!loading && matches.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.map((s) => (
                  <div key={s.id} className="border rounded-2xl p-4 flex flex-col hover:shadow-md transition">
                    <h3 className="font-semibold mb-2">{s.title}</h3>
                    <p className="text-gray-500 text-sm">
                      <span className="font-medium text-black">Country:</span> {s.country || "N/A"}
                    </p>
                    <p className="text-gray-500 text-sm">
                      <span className="font-medium text-black">Funding:</span> {s.funding || "N/A"}
                    </p>
                    <p className="text-gray-500 text-sm mb-4">
                      <span className="font-medium text-black">Deadline:</span> {s.deadline || "N/A"}
                    </p>
                    <Link
                      href={`/scholarships/${s.id}`}
                      className="mt-auto block text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-sm transition"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
