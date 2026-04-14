"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { getScholarships } from "../../lib/api";
import type { Scholarship } from "../../lib/api";

function ScholarshipCard({ s }: { s: Scholarship }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
          {s.degreeLevel || "Scholarship"}
        </span>
        <span className="text-xs text-slate-400">{s.country || "—"}</span>
      </div>

      <h2 className="text-base font-bold text-slate-900 mb-4 leading-snug flex-1">{s.title}</h2>

      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Deadline</span>
          <span className="font-medium text-slate-700">{s.deadline || "—"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Funding</span>
          <span className="font-medium text-slate-700">{s.funding || "—"}</span>
        </div>
      </div>

      <Link
        href={`/scholarships/${s._id}`}
        className="block w-full bg-slate-900 hover:bg-slate-700 text-white py-2.5 rounded-xl text-center text-sm font-medium transition-colors"
      >
        View Details
      </Link>
    </div>
  );
}

function ScholarshipSection({
  title,
  tag,
  tagColor,
  scholarships,
}: {
  title: string;
  tag: string;
  tagColor: string;
  scholarships: Scholarship[];
}) {
  if (scholarships.length === 0) return null;
  return (
    <section className="mb-16">
      <div className="flex items-center gap-4 mb-8">
        <div>
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-2 ${tagColor}`}>
            {tag}
          </span>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-sm font-medium">
              {scholarships.length}
            </span>
          </div>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {scholarships.map((s) => (
          <ScholarshipCard key={s._id} s={s} />
        ))}
      </div>
    </section>
  );
}

export default function ScholarshipsPage() {
  const [all, setAll] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDegree, setFilterDegree] = useState("All");
  const [filterFunding, setFilterFunding] = useState("All");
  const [filterCountry, setFilterCountry] = useState("All");

  useEffect(() => {
    getScholarships().then((data) => {
      setAll(data);
      setLoading(false);
    });
  }, []);

  const countries = useMemo(() => {
    const set = new Set(all.map((s) => s.country).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [all]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return all.filter((s) => {
      const matchesSearch =
        !q ||
        s.title?.toLowerCase().includes(q) ||
        s.country?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q);
      const matchesDegree =
        filterDegree === "All" ||
        (filterDegree === "Bachelor's" && s.degreeLevel?.toLowerCase().includes("bachelor")) ||
        (filterDegree === "Master's" && s.degreeLevel?.toLowerCase().includes("master")) ||
        (filterDegree === "Other" && !s.degreeLevel?.toLowerCase().includes("bachelor") && !s.degreeLevel?.toLowerCase().includes("master"));
      const matchesFunding =
        filterFunding === "All" ||
        s.funding?.toLowerCase().includes(filterFunding.toLowerCase());
      const matchesCountry =
        filterCountry === "All" || s.country === filterCountry;
      return matchesSearch && matchesDegree && matchesFunding && matchesCountry;
    });
  }, [all, search, filterDegree, filterFunding, filterCountry]);

  const bachelors = filtered.filter((s) => s.degreeLevel?.toLowerCase().includes("bachelor"));
  const masters = filtered.filter((s) => s.degreeLevel?.toLowerCase().includes("master"));
  const others = filtered.filter(
    (s) => !s.degreeLevel?.toLowerCase().includes("bachelor") && !s.degreeLevel?.toLowerCase().includes("master")
  );

  const hasActiveFilters = search || filterDegree !== "All" || filterFunding !== "All" || filterCountry !== "All";

  function clearFilters() {
    setSearch("");
    setFilterDegree("All");
    setFilterFunding("All");
    setFilterCountry("All");
  }

  const selectClass = "px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative text-white py-16 px-8 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-slate-900/82" />
        <div className="relative max-w-6xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-slate-300 text-xs font-semibold uppercase tracking-widest mb-5">
            All Scholarships
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            {loading ? "…" : `${all.length} Scholarships`}
          </h1>
          <p className="text-slate-400 text-lg">
            Organized by degree level. Find the perfect fit for your goals.
          </p>
        </div>
      </section>

      <main className="bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-12">

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-10">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by title, country, or description…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Degree filter */}
              <select value={filterDegree} onChange={(e) => setFilterDegree(e.target.value)} className={selectClass}>
                <option value="All">All Degrees</option>
                <option value="Bachelor's">Bachelor&apos;s</option>
                <option value="Master's">Master&apos;s</option>
                <option value="Other">Other</option>
              </select>
              {/* Funding filter */}
              <select value={filterFunding} onChange={(e) => setFilterFunding(e.target.value)} className={selectClass}>
                <option value="All">All Funding</option>
                <option value="Full">Full</option>
                <option value="Partial">Partial</option>
              </select>
              {/* Country filter */}
              <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} className={selectClass}>
                {countries.map((c) => (
                  <option key={c} value={c}>{c === "All" ? "All Countries" : c}</option>
                ))}
              </select>
              {/* Clear */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  Clear
                </button>
              )}
            </div>
            {hasActiveFilters && (
              <p className="text-xs text-slate-400 mt-3">
                Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of {all.length} scholarships
              </p>
            )}
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-7 h-7 border-[3px] border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
              <p className="text-slate-400 text-sm">Loading scholarships…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400 text-lg mb-4">No scholarships match your search.</p>
              <button onClick={clearFilters} className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold">
                Clear filters →
              </button>
            </div>
          ) : (
            <>
              <ScholarshipSection
                title="Bachelor's Scholarships"
                tag="Undergraduate"
                tagColor="bg-indigo-50 text-indigo-700"
                scholarships={bachelors}
              />
              <ScholarshipSection
                title="Master's Scholarships"
                tag="Postgraduate"
                tagColor="bg-violet-50 text-violet-700"
                scholarships={masters}
              />
              <ScholarshipSection
                title="Other Scholarships"
                tag="Other"
                tagColor="bg-amber-50 text-amber-700"
                scholarships={others}
              />
            </>
          )}
        </div>
      </main>
    </>
  );
}
