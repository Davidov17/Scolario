"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";

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
  major: string;
  minGpa: number;
  minIelts: number;
  fundingType: string;
  description: string;
};

const scholarships: Scholarship[] = [
  {
    id: 1,
    title: "DAAD Scholarship",
    country: "Germany",
    major: "Computer Science",
    minGpa: 3.2,
    minIelts: 6.5,
    fundingType: "Full",
    description:
      "Scholarship for international students pursuing study in Germany.",
  },
  {
    id: 2,
    title: "Erasmus+ Scholarship",
    country: "France",
    major: "Business",
    minGpa: 3.0,
    minIelts: 6.0,
    fundingType: "Partial",
    description:
      "European mobility scholarship for qualified students.",
  },
  {
    id: 3,
    title: "Korean Government Scholarship",
    country: "South Korea",
    major: "Computer Science",
    minGpa: 3.4,
    minIelts: 6.0,
    fundingType: "Full",
    description:
      "Government-funded scholarship for studying in South Korea.",
  },
  {
    id: 4,
    title: "Chevening Scholarship",
    country: "United Kingdom",
    major: "International Relations",
    minGpa: 3.5,
    minIelts: 6.5,
    fundingType: "Full",
    description:
      "Prestigious UK scholarship for future leaders.",
  },
  {
    id: 5,
    title: "MEXT Scholarship",
    country: "Japan",
    major: "Engineering",
    minGpa: 3.3,
    minIelts: 6.0,
    fundingType: "Full",
    description:
      "Japanese government scholarship for international students.",
  },
];

export default function MatchesPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<Scholarship[]>([]);

  useEffect(() => {
    const savedProfile = localStorage.getItem("scholarioProfile");

    if (!savedProfile) return;

    const parsedProfile: Profile = JSON.parse(savedProfile);
    setProfile(parsedProfile);

    const filtered = scholarships.filter((scholarship) => {
      const majorMatch =
        parsedProfile.major.trim().toLowerCase() ===
        scholarship.major.toLowerCase();

      const gpaMatch = parsedProfile.gpa >= scholarship.minGpa;

      const ieltsValue = parseFloat(parsedProfile.ielts || "0");
      const ieltsMatch =
        parsedProfile.ielts === "" || ieltsValue >= scholarship.minIelts;

      const fundingMatch =
        parsedProfile.fundingType === "" ||
        parsedProfile.fundingType === scholarship.fundingType;

      return majorMatch && gpaMatch && ieltsMatch && fundingMatch;
    });

    setMatches(filtered);
  }, []);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Your Scholarship Matches</h1>
          <p className="text-gray-500 mb-8">
            Scholarships recommended based on your profile.
          </p>

          {!profile && (
            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <p className="text-gray-700 mb-4">
                No profile found yet. Complete your profile first.
              </p>
              <Link
                href="/profile"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl"
              >
                Go to Profile
              </Link>
            </div>
          )}

          {profile && matches.length === 0 && (
            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <p className="text-gray-700">
                No scholarships matched your current profile yet.
              </p>
            </div>
          )}

          {matches.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((scholarship) => (
                <div
                  key={scholarship.id}
                  className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col"
                >
                  <h2 className="text-xl font-semibold mb-3">
                    {scholarship.title}
                  </h2>

                  <p className="text-gray-600 mb-2">
                    <span className="font-medium text-black">Country:</span>{" "}
                    {scholarship.country}
                  </p>

                  <p className="text-gray-600 mb-2">
                    <span className="font-medium text-black">Major:</span>{" "}
                    {scholarship.major}
                  </p>

                  <p className="text-gray-600 mb-2">
                    <span className="font-medium text-black">Minimum GPA:</span>{" "}
                    {scholarship.minGpa}
                  </p>

                  <p className="text-gray-600 mb-2">
                    <span className="font-medium text-black">Minimum IELTS:</span>{" "}
                    {scholarship.minIelts}
                  </p>

                  <p className="text-gray-600 mb-4">
                    <span className="font-medium text-black">Funding:</span>{" "}
                    {scholarship.fundingType}
                  </p>

                  <p className="text-gray-600 mb-6">{scholarship.description}</p>

                  <Link
                    href={`/scholarships/${scholarship.id}`}
                    className="mt-auto block text-center bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}